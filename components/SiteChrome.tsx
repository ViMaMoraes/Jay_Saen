"use client";

import Link from "next/link";
import { useState } from "react";
import { wedding } from "@/lib/config";
import { UploadIcon } from "./icons";
import { useUpload } from "./UploadProvider";

export function SiteNav() {
  const { openUpload } = useUpload();
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        {wedding.initials[0]} <span className="amp">&amp;</span> {wedding.initials[1]}
      </Link>
      <Link href="/galeria" className="nav-link">
        Galeria
      </Link>
      <button className="btn btn-sm" onClick={openUpload}>
        <UploadIcon />
        Enviar fotos
      </button>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <span className="footer-brand">
        {wedding.bride} <span className="amp">&amp;</span> {wedding.groom}
      </span>
      <span>As fotos são guardadas no álbum dos noivos no Google Drive.</span>
    </footer>
  );
}

export function Dropzone() {
  const { pickFiles, addFiles, demo } = useUpload();
  const [drag, setDrag] = useState(false);
  return (
    <>
      <button
        className={`dropzone${drag ? " drag" : ""}`}
        onClick={pickFiles}
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
    </>
  );
}
