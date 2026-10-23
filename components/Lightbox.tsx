"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect } from "react";
import type { Photo } from "@/lib/types";
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, XIcon } from "./icons";

type Props = { photos: Photo[]; index: number; onClose: () => void; onStep: (d: number) => void };

export default function Lightbox({ photos, index, onClose, onStep }: Props) {
  const cur = photos[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onStep]);

  if (!cur) return null;
  const isLocalVideo = cur.isVideo && cur.src.startsWith("blob:");

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada">
      <div className="lb-bar">
        <div className="lb-counter tnum">
          {index + 1} / {photos.length}
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Fechar">
          <XIcon size={22} />
        </button>
      </div>
      <div className="lb-stage">
        {isLocalVideo ? (
          <video key={cur.id} src={cur.src} controls playsInline />
        ) : cur.src ? (
          <img key={cur.id} src={cur.src} alt={`Foto enviada por ${cur.guest}`} />
        ) : (
          <div className="placeholder" style={{ aspectRatio: cur.ratio }}>
            foto do convidado
          </div>
        )}
        {photos.length > 1 && (
          <>
            <button className="lb-nav lb-prev" onClick={() => onStep(-1)} aria-label="Anterior">
              <ChevronLeftIcon />
            </button>
            <button className="lb-nav lb-next" onClick={() => onStep(1)} aria-label="Próxima">
              <ChevronRightIcon />
            </button>
          </>
        )}
      </div>
      <div className="lb-caption">
        <div className="lb-guest">{cur.guest}</div>
        {cur.msg && <div className="lb-msg">“{cur.msg}”</div>}
        {cur.download ? (
          <a className="lb-download" href={cur.download} download={cur.fileName}>
            <DownloadIcon size={18} />
            {cur.isVideo ? "Baixar vídeo" : "Baixar foto"}
          </a>
        ) : (
          <span className="lb-download disabled" title="Foto de exemplo: não há arquivo para baixar">
            <DownloadIcon size={18} />
            Baixar foto
          </span>
        )}
      </div>
    </div>
  );
}
