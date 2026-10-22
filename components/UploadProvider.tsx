"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { wedding } from "@/lib/config";
import type { Photo } from "@/lib/types";
import { CameraIcon } from "./icons";
import UploadModal, { type Step } from "./UploadModal";
import { mediaType, uploadFile, type Picked } from "./upload";

// Estado do envio de fotos, compartilhado pela página inicial e pela galeria:
// o modal, o seletor de arquivos e as fotos enviadas nesta visita.

type UploadContext = {
  demo: boolean;
  /** Fotos enviadas nesta visita, exibidas do próprio aparelho enquanto o Drive gera as miniaturas. */
  local: Photo[];
  /** Muda a cada envio concluído, para as galerias recarregarem. */
  version: number;
  openUpload: () => void;
  pickFiles: () => void;
  addFiles: (list: FileList | null) => void;
  setLightboxOpen: (open: boolean) => void;
};

const Ctx = createContext<UploadContext | null>(null);

export function useUpload() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUpload precisa estar dentro de <UploadProvider>");
  return ctx;
}

const CONCURRENCY = 3;

export default function UploadProvider({ demo, children }: { demo: boolean; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [local, setLocal] = useState<Photo[]>([]);
  const [version, setVersion] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [files, setFiles] = useState<Picked[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestMsg, setGuestMsg] = useState("");
  const [error, setError] = useState("");
  const [lastCount, setLastCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setGuestName(localStorage.getItem("guestName") ?? "");
    } catch {}
  }, []);

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
    if (!demo) setTimeout(() => setVersion((v) => v + 1), 1500);
  };

  const seeAlbum = () => {
    setUploadOpen(false);
    setFiles([]);
    setStep("form");
    if (pathname === "/galeria") window.scrollTo({ top: 0, behavior: "smooth" });
    else router.push("/galeria");
  };

  const ctx: UploadContext = {
    demo,
    local,
    version,
    openUpload,
    pickFiles: () => fileRef.current?.click(),
    addFiles,
    setLightboxOpen,
  };

  return (
    <Ctx.Provider value={ctx}>
      {children}

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

      {!uploadOpen && !lightboxOpen && (
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
          seeAlbumLabel={pathname === "/galeria" ? "Ver na galeria" : "Ver a galeria"}
        />
      )}
    </Ctx.Provider>
  );
}
