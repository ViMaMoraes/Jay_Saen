"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { wedding } from "@/lib/config";
import type { Photo } from "@/lib/types";
import { CameraIcon, ChevronLeftIcon } from "./icons";
import { PageNumbers, PageSummary } from "./Pagination";
import PhotoGrid from "./PhotoGrid";
import { Dropzone, SiteFooter, SiteNav } from "./SiteChrome";
import { useUpload } from "./UploadProvider";

type Props = { photos: Photo[]; total: number; page: number; perPage: number };

export default function GalleryPage({ photos, total: initialTotal, page, perPage }: Props) {
  const { openUpload } = useUpload();
  const [total, setTotal] = useState(initialTotal);
  useEffect(() => setTotal(initialTotal), [initialTotal]);

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
        <PageSummary page={page} perPage={perPage} total={total} />
        <PhotoGrid initialPhotos={photos} limit={perPage} offset={(page - 1) * perPage} onTotal={setTotal} />
        <PageNumbers page={page} perPage={perPage} total={total} />
        <Dropzone />
      </main>
      <SiteFooter />
    </>
  );
}
