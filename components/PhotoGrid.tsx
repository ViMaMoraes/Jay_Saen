"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";
import { wedding } from "@/lib/config";
import type { Photo } from "@/lib/types";
import { DownloadIcon, PlayIcon } from "./icons";
import Lightbox from "./Lightbox";
import { useUpload } from "./UploadProvider";

type Props = {
  initialPhotos: Photo[];
  /** Quantas fotos mostrar e a partir de qual (as mais recentes primeiro). */
  limit: number;
  offset?: number;
  /** Avisa o novo total de fotos depois de recarregar (para a paginação). */
  onTotal?: (total: number) => void;
};

export default function PhotoGrid({ initialPhotos, limit, offset = 0, onTotal }: Props) {
  const { demo, local, version, setLightboxOpen } = useUpload();
  const [serverPhotos, setServerPhotos] = useState(initialPhotos);
  const [lb, setLb] = useState(-1);

  // Trocar de página na galeria reaproveita o componente com novas fotos.
  useEffect(() => {
    setServerPhotos(initialPhotos);
    setLb(-1);
  }, [initialPhotos]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/photos?limit=${limit}&offset=${offset}&fresh=1`, { cache: "no-store" });
      if (!res.ok) return;
      const page = (await res.json()) as { photos: Photo[]; total: number };
      setServerPhotos(page.photos);
      onTotal?.(page.total);
    } catch {}
  }, [limit, offset, onTotal]);

  useEffect(() => {
    if (version) refresh();
  }, [version, refresh]);

  useEffect(() => {
    if (demo) return;
    const t = setInterval(refresh, 60_000);
    return () => clearInterval(t);
  }, [demo, refresh]);

  // Fotos enviadas nesta visita: aparecem no topo da primeira página e usam a
  // imagem do aparelho enquanto o Drive gera a miniatura.
  const localById = new Map(local.map((p) => [p.id, p]));
  const serverIds = new Set(serverPhotos.map((p) => p.id));
  const photos: Photo[] = [
    ...(offset === 0 ? local.filter((p) => !serverIds.has(p.id)) : []),
    ...serverPhotos.map((p) => {
      const mine = localById.get(p.id);
      return mine ? { ...p, src: mine.src, thumb: mine.thumb, download: p.download || mine.download } : p;
    }),
  ].slice(0, limit);

  useEffect(() => setLightboxOpen(lb >= 0), [lb, setLightboxOpen]);
  const closeLb = useCallback(() => setLb(-1), []);
  const stepLb = useCallback((d: number) => setLb((i) => (i + d + photos.length) % photos.length), [photos.length]);

  return (
    <>
      {photos.length === 0 ? (
        <div className="empty">Nenhuma foto aqui ainda. Seja o primeiro a enviar!</div>
      ) : (
        <div className={wedding.galleryStyle === "mosaic" ? "mosaic" : "square"}>
          {photos.map((p, i) => (
            <Tile key={p.id} photo={p} onOpen={() => setLb(i)} showGuest={wedding.galleryStyle === "mosaic"} />
          ))}
        </div>
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
