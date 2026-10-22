"use client";

import Link from "next/link";
import { wedding } from "@/lib/config";
import type { Photo } from "@/lib/types";
import { CameraIcon, ChevronLeftIcon } from "./icons";
import PhotoGrid from "./PhotoGrid";
import { Dropzone, SiteFooter, SiteNav } from "./SiteChrome";
import { useUpload } from "./UploadProvider";

export default function GalleryPage({ photos, cursor }: { photos: Photo[]; cursor: string | null }) {
  const { openUpload } = useUpload();
  return (
    <>
      <SiteNav />
      <main className="section">
        <Link href="/" className="back-link">
          <ChevronLeftIcon size={16} />
          Início
        </Link>
        <div className="section-head">
          <div>
            <div className="kicker">O álbum</div>
            <h1 className="page-title">
              Galeria de {wedding.bride} <span className="amp">&amp;</span> {wedding.groom}
            </h1>
          </div>
          <div className="gallery-actions">
            <p>Toque numa foto para ampliar. Use a seta no canto para baixar.</p>
            <button className="btn" onClick={openUpload}>
              <CameraIcon />
              Enviar minhas fotos
            </button>
          </div>
        </div>
        <PhotoGrid initialPhotos={photos} initialCursor={cursor} />
        <Dropzone />
      </main>
      <SiteFooter />
    </>
  );
}
