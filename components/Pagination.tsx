"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { wedding } from "@/lib/config";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

export const galleryHref = (page: number, perPage: number) => {
  const params = new URLSearchParams();
  if (page > 1) params.set("pagina", String(page));
  if (perPage !== wedding.galleryPageSizes[0]) params.set("por", String(perPage));
  const q = params.toString();
  return q ? `/galeria?${q}` : "/galeria";
};

/** Resumo ("Fotos 1–25 de 132") e escolha de quantas fotos por página. */
export function PageSummary({ page, perPage, total }: { page: number; perPage: number; total: number }) {
  const router = useRouter();
  const first = total ? (page - 1) * perPage + 1 : 0;
  const last = Math.min(page * perPage, total);
  return (
    <div className="page-summary">
      <span className="muted tnum">
        {total === 0 ? "Nenhuma foto" : `Fotos ${first}–${last} de ${total}`}
      </span>
      <label className="per-page">
        Mostrar
        <select
          className="input"
          value={perPage}
          onChange={(e) => router.push(galleryHref(1, Number(e.target.value)))}
        >
          {wedding.galleryPageSizes.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        por página
      </label>
    </div>
  );
}

/** Números das páginas, com anterior/próxima. */
export function PageNumbers({ page, perPage, total }: { page: number; perPage: number; total: number }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;

  // 1 … 4 5 6 … 12: sempre a primeira, a última e as vizinhas da atual.
  const shown: (number | "gap")[] = [];
  for (let n = 1; n <= pages; n++) {
    if (n === 1 || n === pages || Math.abs(n - page) <= 1) shown.push(n);
    else if (shown[shown.length - 1] !== "gap") shown.push("gap");
  }

  return (
    <nav className="pager" aria-label="Páginas da galeria">
      {page > 1 ? (
        <Link className="pager-btn" href={galleryHref(page - 1, perPage)} aria-label="Página anterior">
          <ChevronLeftIcon size={18} />
        </Link>
      ) : (
        <span className="pager-btn disabled" aria-hidden="true">
          <ChevronLeftIcon size={18} />
        </span>
      )}
      {shown.map((n, i) =>
        n === "gap" ? (
          <span key={`gap-${i}`} className="pager-gap">
            …
          </span>
        ) : (
          <Link
            key={n}
            className={`pager-btn tnum${n === page ? " current" : ""}`}
            href={galleryHref(n, perPage)}
            aria-current={n === page ? "page" : undefined}
          >
            {n}
          </Link>
        ),
      )}
      {page < pages ? (
        <Link className="pager-btn" href={galleryHref(page + 1, perPage)} aria-label="Próxima página">
          <ChevronRightIcon size={18} />
        </Link>
      ) : (
        <span className="pager-btn disabled" aria-hidden="true">
          <ChevronRightIcon size={18} />
        </span>
      )}
    </nav>
  );
}
