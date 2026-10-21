"use client";

import { coupleName, wedding } from "@/lib/config";
import { CheckIcon, PlusIcon, XIcon } from "./icons";
import type { Picked } from "./upload";

export type Step = "form" | "uploading" | "done";

type Props = {
  step: Step;
  files: Picked[];
  guestName: string;
  guestMsg: string;
  error: string;
  lastCount: number;
  onName: (v: string) => void;
  onMsg: (v: string) => void;
  onPick: () => void;
  onRemove: (id: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  onSendMore: () => void;
  onSeeAlbum: () => void;
};

export default function UploadModal(p: Props) {
  const n = p.files.length;
  const cantSubmit = n === 0 || (wedding.requireName && !p.guestName.trim());
  const firstName = p.guestName.trim().split(" ")[0] || "querido convidado";
  const title = p.step === "done" ? "Fotos enviadas" : p.step === "uploading" ? "Enviando…" : "Enviar fotos";
  const plural = (k: number, one: string, many: string) => (k === 1 ? one : many);

  return (
    <div className="backdrop" onClick={p.onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={p.onClose} aria-label="Fechar" disabled={p.step === "uploading"}>
            <XIcon />
          </button>
        </div>

        {p.step === "form" && (
          <div className="modal-body">
            <div className="field">
              <label htmlFor="guest-name">
                Seu nome {!wedding.requireName && <span className="opt">(opcional)</span>}
              </label>
              <input
                id="guest-name"
                className="input"
                value={p.guestName}
                onChange={(e) => p.onName(e.target.value)}
                placeholder="Ex.: Mariana Costa"
                autoComplete="name"
                maxLength={80}
              />
            </div>
            <div className="field">
              <label htmlFor="guest-msg">
                Recado para os noivos <span className="opt">(opcional)</span>
              </label>
              <textarea
                id="guest-msg"
                className="input"
                rows={3}
                value={p.guestMsg}
                onChange={(e) => p.onMsg(e.target.value)}
                placeholder="Um carinho, uma lembrança do dia…"
                maxLength={1000}
              />
            </div>
            <div>
              <div className="files-head">
                <span>Fotos</span>
                <span className="muted tnum">
                  {n ? `${n} ${plural(n, "selecionada", "selecionadas")}` : "Nenhuma ainda"}
                </span>
              </div>
              <div className="files">
                {p.files.map((f) => (
                  <div className="file" key={f.id}>
                    <Thumb item={f} />
                    <button className="file-remove" onClick={() => p.onRemove(f.id)} aria-label="Remover">
                      <XIcon size={14} />
                    </button>
                  </div>
                ))}
                <button className="file-add" onClick={p.onPick}>
                  <PlusIcon />
                  Adicionar
                </button>
              </div>
            </div>
            {p.error && <div className="error">{p.error}</div>}
            <button className="btn btn-block" onClick={p.onSubmit} disabled={cantSubmit}>
              {n ? `Enviar ${n} ${plural(n, "foto", "fotos")}` : "Enviar fotos"}
            </button>
            <div className="fine">As fotos vão para o álbum dos noivos no Google Drive, na qualidade original.</div>
          </div>
        )}

        {p.step === "uploading" && (
          <div className="modal-body" style={{ gap: 12 }}>
            {p.files.map((f) => (
              <div className="progress-row" key={f.id}>
                <Thumb item={f} />
                <div className="progress-info">
                  <div className="progress-label">
                    <span>{f.file.name}</span>
                    <span className="muted tnum">{f.failed ? "falhou" : `${Math.round(f.progress * 100)}%`}</span>
                  </div>
                  <div className={`bar${f.failed ? " failed" : ""}`}>
                    <div style={{ width: `${f.progress * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {p.step === "done" && (
          <div className="done">
            <div className="done-check">
              <CheckIcon />
            </div>
            <h3>Obrigado, {firstName}!</h3>
            <p>
              {p.lastCount} {plural(p.lastCount, "foto já está", "fotos já estão")} no álbum de {coupleName}. Eles vão
              adorar.
            </p>
            {p.error && <div className="error" style={{ marginBottom: 16 }}>{p.error}</div>}
            <div className="done-actions">
              <button className="btn btn-neutral" onClick={p.onSendMore}>
                Enviar mais
              </button>
              <button className="btn" onClick={p.onSeeAlbum}>
                Ver no álbum
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Thumb({ item }: { item: Picked }) {
  if (item.type.startsWith("video/")) return <video src={item.url} muted playsInline preload="metadata" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={item.url} alt="" />;
}
