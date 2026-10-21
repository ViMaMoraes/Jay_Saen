import { driveConfigured, fetchOriginal, fetchThumbnail } from "@/lib/drive";

export const runtime = "nodejs";

// O conteúdo de um arquivo do Drive não muda para o mesmo id: cache longo na CDN.
const CACHE = "public, max-age=86400, s-maxage=31536000, immutable";
// Logo após o envio o Drive ainda pode estar gerando a miniatura.
const notFound = () => new Response("Não encontrado", { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!driveConfigured()) return notFound();
  const { id } = await params;
  const url = new URL(req.url);

  if (url.searchParams.has("download")) {
    const file = await fetchOriginal(id);
    if (!file) return notFound();
    const headers = new Headers({
      "Content-Type": file.info.mimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.info.name)}`,
      "Cache-Control": CACHE,
    });
    const len = file.res.headers.get("content-length");
    if (len) headers.set("Content-Length", len);
    return new Response(file.res.body, { headers });
  }

  const px = url.searchParams.get("size") === "small" ? 600 : 1600;
  const thumb = await fetchThumbnail(id, px);
  if (!thumb) return notFound();
  return new Response(thumb.body, {
    headers: { "Content-Type": thumb.headers.get("content-type") ?? "image/jpeg", "Cache-Control": CACHE },
  });
}
