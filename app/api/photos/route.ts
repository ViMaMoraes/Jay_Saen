import { NextResponse } from "next/server";
import { getPhotos } from "@/lib/photos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(Number(params.get("limit")) || 25, 1), 100);
  const offset = Math.max(Number(params.get("offset")) || 0, 0);
  try {
    return NextResponse.json(await getPhotos(limit, offset, params.has("fresh")));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Não foi possível carregar o álbum." }, { status: 502 });
  }
}
