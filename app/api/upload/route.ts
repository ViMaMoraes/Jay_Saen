import { NextResponse } from "next/server";
import { wedding } from "@/lib/config";
import { createUploadSession, driveConfigured, invalidatePhotos } from "@/lib/drive";

export const runtime = "nodejs";

type Body = { fileName?: string; mimeType?: string; size?: number; guest?: string; msg?: string };

export async function POST(req: Request) {
  if (!driveConfigured()) return NextResponse.json({ demo: true });

  const body = (await req.json().catch(() => ({}))) as Body;
  const mimeType = String(body.mimeType ?? "");
  const size = Number(body.size);
  const guest = String(body.guest ?? "").trim().slice(0, 80) || "Convidado";
  const msg = String(body.msg ?? "").trim().slice(0, 1000);
  const fileName = String(body.fileName ?? "foto").slice(0, 120);

  if (!/^(image|video)\//.test(mimeType)) {
    return NextResponse.json({ error: "Envie apenas fotos ou vídeos." }, { status: 400 });
  }
  if (!Number.isFinite(size) || size <= 0 || size > wedding.maxFileBytes) {
    return NextResponse.json({ error: "Arquivo grande demais." }, { status: 413 });
  }
  if (wedding.requireName && !body.guest?.trim()) {
    return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  try {
    const uploadUrl = await createUploadSession({ fileName, mimeType, size, guest, msg, origin });
    invalidatePhotos();
    return NextResponse.json({ uploadUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Não foi possível iniciar o envio." }, { status: 502 });
  }
}
