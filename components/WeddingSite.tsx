"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import { coupleName, wedding } from "@/lib/config";
import type { Photo } from "@/lib/types";
import { CameraIcon } from "./icons";
import PhotoGrid from "./PhotoGrid";
import { SiteFooter, SiteNav } from "./SiteChrome";
import { useUpload } from "./UploadProvider";

type Props = { recentPhotos: Photo[] };

export default function WeddingSite({ recentPhotos }: Props) {
  const { openUpload } = useUpload();
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const days = Math.ceil((wedding.date.getTime() - Date.now()) / 86_400_000);
    setCountdown(
      days > 1 ? `Faltam ${days} dias` : days === 1 ? "É amanhã!" : days === 0 ? "É hoje!" : "Obrigado por fazer parte do nosso dia",
    );
  }, []);

  const actions = (
    <>
      <button className="btn" onClick={openUpload}>
        <CameraIcon />
        Enviar minhas fotos
      </button>
      <Link href="/galeria" className={wedding.heroStyle === "cinematic" ? "btn btn-neutral" : "link-btn"}>
        Ver o álbum
      </Link>
    </>
  );

  return (
    <>
      <SiteNav />

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
            ["III", "Reviva no álbum", "Todas as fotos ficam na galeria, para ver e baixar quando quiser."],
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

      <section id="recentes" className="section">
        <div className="section-head">
          <div>
            <div className="kicker">O álbum</div>
            <h2>Nosso dia, pelos seus olhos</h2>
          </div>
          <p>As últimas fotos enviadas pelos convidados.</p>
        </div>
        <PhotoGrid initialPhotos={recentPhotos} limit={wedding.homePreviewCount} />
        <div className="more">
          <Link href="/galeria" className="btn">
            Ver todas as fotos
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
