import { NextResponse } from "next/server";
import { demoPhotos } from "@/lib/demo";
import { driveConfigured, invalidatePhotos, listPhotos } from "@/lib/drive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!driveConfigured()) return NextResponse.json({ photos: demoPhotos, demo: true });
  if (new URL(req.url).searchParams.has("fresh")) invalidatePhotos();
  try {
    return NextResponse.json({ photos: await listPhotos() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Não foi possível carregar o álbum." }, { status: 502 });
  }
}
