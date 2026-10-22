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
  initialCursor: string | null;
  /** Mostra só as `preview` mais recentes, sem "carregar mais" (página inicial). */
  preview?: number;
};

type Page = { photos: Photo[]; nextCursor: string | null };

export default function PhotoGrid({ initialPhotos, initialCursor, preview }: Props) {
  const { demo, local, version, setLightboxOpen } = useUpload();
  const [serverPhotos, setServerPhotos] = useState(initialPhotos);
  const [cursor, setCursor] = useState(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lb, setLb] = useState(-1);
  const pageSize = preview ?? wedding.galleryPageSize;

  // Recarrega a primeira página (fotos novas) e mantém as que já foram carregadas.
  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/photos?limit=${pageSize}&fresh=1`, { cache: "no-store" });
      if (!res.ok) return;
      const page = (await res.json()) as Page;
      setServerPhotos((prev) => {
        const ids = new Set(page.photos.map((p) => p.id));
        return [...page.photos, ...prev.filter((p) => !ids.has(p.id))];
      });
    } catch {}
  }, [pageSize]);

  useEffect(() => {
    if (version) refresh();
  }, [version, refresh]);

  useEffect(() => {
    if (demo) return;
    const t = setInterval(refresh, 60_000);
    return () => clearInterval(t);
  }, [demo, refresh]);

  const loadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/photos?limit=${pageSize}&cursor=${encodeURIComponent(cursor)}`);
      if (res.ok) {
        const page = (await res.json()) as Page;
        setServerPhotos((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          return [...prev, ...page.photos.filter((p) => !ids.has(p.id))];
        });
        setCursor(page.nextCursor);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const localById = new Map(local.map((p) => [p.id, p]));
  const serverIds = new Set(serverPhotos.map((p) => p.id));
  let photos: Photo[] = [
    ...local.filter((p) => !serverIds.has(p.id)),
    ...serverPhotos.map((p) => {
      const mine = localById.get(p.id);
      return mine ? { ...p, src: mine.src, thumb: mine.thumb } : p;
    }),
  ];
  if (preview) photos = photos.slice(0, preview);

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

      {!preview && cursor && (
        <div className="more">
          <button className="btn btn-neutral" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Carregando…" : "Carregar mais fotos"}
          </button>
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
