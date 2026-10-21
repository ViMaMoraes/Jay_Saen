"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { coupleName, wedding } from "@/lib/config";
import type { Photo } from "@/lib/types";
import { CameraIcon, DownloadIcon, PlayIcon, UploadIcon } from "./icons";
import Lightbox from "./Lightbox";
import UploadModal, { type Step } from "./UploadModal";
import { mediaType, uploadFile, type Picked } from "./upload";

type Props = { initialPhotos: Photo[]; demo: boolean };

const CONCURRENCY = 3;

export default function WeddingSite({ initialPhotos, demo }: Props) {
  const [serverPhotos, setServerPhotos] = useState(initialPhotos);
  // Fotos enviadas nesta visita, exibidas a partir do próprio aparelho enquanto
  // o Drive gera as miniaturas.
  const [local, setLocal] = useState<Photo[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [files, setFiles] = useState<Picked[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestMsg, setGuestMsg] = useState("");
  const [error, setError] = useState("");
  const [lastCount, setLastCount] = useState(0);
  const [lb, setLb] = useState(-1);
  const [drag, setDrag] = useState(false);
  const [countdown, setCountdown] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const localById = new Map(local.map((p) => [p.id, p]));
  const serverIds = new Set(serverPhotos.map((p) => p.id));
  const photos: Photo[] = [
    ...local.filter((p) => !serverIds.has(p.id)),
    ...serverPhotos.map((p) => {
      const mine = localById.get(p.id);
      return mine ? { ...p, src: mine.src, thumb: mine.thumb } : p;
    }),
  ].slice(0, wedding.galleryLimit);

  useEffect(() => {
    const days = Math.ceil((wedding.date.getTime() - Date.now()) / 86_400_000);
    setCountdown(
      days > 1 ? `Faltam ${days} dias` : days === 1 ? "É amanhã!" : days === 0 ? "É hoje!" : "Obrigado por fazer parte do nosso dia",
    );
    try {
      setGuestName(localStorage.getItem("guestName") ?? "");
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/photos?fresh=1", { cache: "no-store" });
      if (res.ok) setServerPhotos(((await res.json()) as { photos: Photo[] }).photos);
    } catch {}
  }, []);

  useEffect(() => {
    if (demo) return;
    const t = setInterval(refresh, 60_000);
    return () => clearInterval(t);
  }, [demo, refresh]);

  const addFiles = (list: FileList | null) => {
    const picked = Array.from(list ?? [])
      .map((file) => ({ file, type: mediaType(file) }))
      .filter((f) => f.type && f.file.size <= wedding.maxFileBytes)
      .map(({ file, type }, i) => ({
        id: `${Date.now()}-${i}`,
        file,
        type,
        url: URL.createObjectURL(file),
        progress: 0,
        failed: false,
      }));
    if (!picked.length) return;
    setFiles((prev) => [...(step === "done" ? [] : prev), ...picked]);
    setStep("form");
    setError("");
    setUploadOpen(true);
  };

  const openUpload = () => {
    if (step === "done") {
      setFiles([]);
      setStep("form");
    }
    setError("");
    setUploadOpen(true);
  };

  const closeUpload = () => {
    if (step === "uploading") return;
    if (step === "done") {
      setFiles([]);
      setStep("form");
    }
    setUploadOpen(false);
  };

  const submit = async () => {
    const name = guestName.trim() || "Convidado";
    const msg = guestMsg.trim();
    try {
      localStorage.setItem("guestName", guestName.trim());
    } catch {}
    setStep("uploading");
    setError("");

    const queue = [...files];
    const sent: Photo[] = [];
    let failures = 0;
    const patch = (id: string, changes: Partial<Picked>) =>
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...changes } : f)));

    const worker = async () => {
      for (let item = queue.shift(); item; item = queue.shift()) {
        const it = item;
        try {
          const { id } = await uploadFile(it, name, msg, (progress) => patch(it.id, { progress }));
          sent.push({
            id,
            src: it.url,
            thumb: it.url,
            download: it.url,
            fileName: it.file.name,
            ratio: "3/4",
            guest: name,
            msg,
            isVideo: it.type.startsWith("video/"),
          });
        } catch (err) {
          failures++;
          patch(it.id, { failed: true });
          console.error(err);
        }
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    if (!sent.length) {
      setStep("form");
      setFiles((prev) => prev.map((f) => ({ ...f, progress: 0, failed: false })));
      setError("Não conseguimos enviar suas fotos. Verifique a conexão e tente de novo.");
      return;
    }
    setLocal((prev) => [...sent, ...prev]);
    setLastCount(sent.length);
    setGuestMsg("");
    if (failures) setError(`${failures} ${failures === 1 ? "arquivo não pôde" : "arquivos não puderam"} ser enviado(s).`);
    setStep("done");
    if (!demo) setTimeout(refresh, 1500);
  };

  const seeAlbum = () => {
    setUploadOpen(false);
    setFiles([]);
    setStep("form");
    const g = document.getElementById("galeria");
    if (g) window.scrollTo({ top: g.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" });
  };

  const closeLb = useCallback(() => setLb(-1), []);
  const stepLb = useCallback((d: number) => setLb((i) => (i + d + photos.length) % photos.length), [photos.length]);

  const actions = (
    <>
      <button className="btn" onClick={openUpload}>
        <CameraIcon />
        Enviar minhas fotos
      </button>
      <a href="#galeria" className={wedding.heroStyle === "cinematic" ? "btn btn-neutral" : "link-btn"}>
        Ver o álbum
      </a>
    </>
  );

  return (
    <>
      <nav className="nav">
        <a href="#inicio" className="nav-brand">
          {wedding.initials[0]} <span className="amp">&amp;</span> {wedding.initials[1]}
        </a>
        <a href="#galeria" className="nav-link">
          Galeria
        </a>
        <button className="btn btn-sm" onClick={openUpload}>
          <UploadIcon />
          Enviar fotos
        </button>
      </nav>

      {wedding.heroStyle === "editorial" ? (
        <header id="inicio" className="hero">
          <div className="hero-text">
            <div className="kicker tnum">{wedding.dateShort}</div>
            <h1 className="hero-title">
              {wedding.bride}
              <br />
              <span className="amp">&amp;</span> {wedding.groom}
            </h1>
            <div className="hero-rule" />
            <p className="hero-lead">
              Cada convidado vê o nosso dia de um jeito diferente. Envie aqui as fotos que você tirou — elas vão direto
              para o nosso álbum e ficam guardadas para sempre.
            </p>
            <div className="hero-actions">{actions}</div>
            <div className="hero-count muted tnum">{countdown}</div>
          </div>
          <figure className="hero-figure">
            <img src="/assets/ja-3.jpg" alt={coupleName} />
            <figcaption>
              <span>Pré-wedding</span>
              <span>Pl. I</span>
            </figcaption>
          </figure>
        </header>
      ) : (
        <header id="inicio" className="cine">
          <img src="/assets/ja-1.jpg" alt={coupleName} />
          <div className="cine-shade" />
          <div className="cine-body">
            <div className="kicker tnum">{wedding.dateLong}</div>
            <h1>
              {wedding.bride} <span className="amp">&amp;</span> {wedding.groom}
            </h1>
            <p>Envie as fotos que você tirou do nosso dia. Elas vão direto para o nosso álbum.</p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              {actions}
            </div>
            <div className="hero-count tnum">{countdown}</div>
          </div>
        </header>
      )}

      <section className="section section-top">
        <div className="section-head">
          <div>
            <div className="kicker">O casal</div>
            <h2>
              {wedding.bride} <span className="amp">&amp;</span> {wedding.groom}
            </h2>
          </div>
          <p>Alguns registros do nosso pré-wedding, enquanto o grande dia não chega.</p>
        </div>
        <div className="plates">
          {[
            ["ja-1.jpg", "de mãos dadas", "50% 60%", "I"],
            ["ja-2.jpg", "sorrindo na escadaria", "50% 55%", "II"],
            ["ja-3.jpg", "abraçados", "50% 45%", "III"],
          ].map(([file, alt, pos, n]) => (
            <figure key={file}>
              <img src={`/assets/${file}`} alt={`${coupleName} ${alt}`} className="plate" style={{ objectPosition: pos }} />
              <figcaption>Pl. {n}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="steps-band">
        <div className="steps">
          {[
            ["I", "Escolha as fotos", "Direto da galeria do celular, quantas quiser. Fotos e vídeos curtos."],
            ["II", "Deixe seu nome", "E, se quiser, um recado para os noivos junto com as fotos."],
            ["III", "Reviva no álbum", "As fotos mais recentes aparecem aqui, para ver e baixar quando quiser."],
          ].map(([n, title, text]) => (
            <div className="step" key={n}>
              <div className="step-num">{n}</div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="galeria" className="section">
        <div className="section-head">
          <div>
            <div className="kicker">O álbum</div>
            <h2>Nosso dia, pelos seus olhos</h2>
          </div>
          <div className="muted tnum" style={{ fontSize: 14 }}>
            {photos.length >= wedding.galleryLimit
              ? `As ${wedding.galleryLimit} fotos mais recentes`
              : `${photos.length} ${photos.length === 1 ? "foto" : "fotos"}`}
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="empty">Nenhuma foto aqui ainda. Seja o primeiro a enviar!</div>
        ) : (
          <div className={wedding.galleryStyle === "mosaic" ? "mosaic" : "square"}>
            {photos.map((p, i) => (
              <Tile key={p.id} photo={p} onOpen={() => setLb(i)} showGuest={wedding.galleryStyle === "mosaic"} />
            ))}
          </div>
        )}

        <button
          className={`dropzone${drag ? " drag" : ""}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            addFiles(e.dataTransfer.files);
          }}
        >
          <UploadIcon size={28} />
          <div className="dropzone-title">Tem fotos do casamento?</div>
          <div className="dropzone-sub">
            Arraste aqui ou <span>escolha do seu aparelho</span>
          </div>
        </button>
        {demo && (
          <div className="notice">
            Modo demonstração: o Google Drive ainda não foi configurado, então as fotos enviadas aparecem só neste
            aparelho. Veja o README para configurar.
          </div>
        )}
      </section>

      <footer className="footer">
        <span className="footer-brand">
          {wedding.bride} <span className="amp">&amp;</span> {wedding.groom}
        </span>
        <span>As fotos são guardadas no álbum dos noivos no Google Drive.</span>
      </footer>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*,.heic,.heif"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {!uploadOpen && lb < 0 && (
        <button className="btn fab" onClick={openUpload} aria-label="Enviar fotos">
          <CameraIcon />
          Enviar fotos
        </button>
      )}

      {uploadOpen && (
        <UploadModal
          step={step}
          files={files}
          guestName={guestName}
          guestMsg={guestMsg}
          error={error}
          lastCount={lastCount}
          onName={setGuestName}
          onMsg={setGuestMsg}
          onPick={() => fileRef.current?.click()}
          onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
          onSubmit={submit}
          onClose={closeUpload}
          onSendMore={() => {
            setFiles([]);
            setError("");
            setStep("form");
          }}
          onSeeAlbum={seeAlbum}
        />
      )}

      {lb >= 0 && <Lightbox photos={photos} index={lb} onClose={closeLb} onStep={stepLb} />}
    </>
  );
}

function Tile({ photo: p, onOpen, showGuest }: { photo: Photo; onOpen: () => void; showGuest: boolean }) {
  const [broken, setBroken] = useState(false);
  const isLocal = p.thumb.startsWith("blob:");
  return (
    <div className="tile-wrap">
      <button className="tile" onClick={onOpen} aria-label={`Abrir foto enviada por ${p.guest}`}>
        {p.thumb && !broken ? (
          p.isVideo && isLocal ? (
            <video className="tile-media" src={p.thumb} muted playsInline preload="metadata" style={{ aspectRatio: p.ratio }} />
          ) : (
            <img
              className="tile-media"
              src={p.thumb}
              alt={`Foto enviada por ${p.guest}`}
              loading="lazy"
              style={{ aspectRatio: isLocal ? undefined : p.ratio }}
              onError={() => setBroken(true)}
            />
          )
        ) : (
          <div className="placeholder" style={{ aspectRatio: p.ratio }}>
            {broken ? "processando…" : "foto do convidado"}
          </div>
        )}
        {p.isVideo && (
          <span className="badge">
            <PlayIcon /> vídeo
          </span>
        )}
        {showGuest && <span className="tile-guest">{p.guest}</span>}
      </button>
      {p.download && (
        <a className="tile-download" href={p.download} download={p.fileName} aria-label={`Baixar foto enviada por ${p.guest}`}>
          <DownloadIcon />
        </a>
      )}
    </div>
  );
}
