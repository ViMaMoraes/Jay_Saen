import "server-only";
import type { Photo } from "./types";

// Integração com o Google Drive via REST, autenticada com o refresh token
// da conta dos noivos (veja README.md e scripts/get-refresh-token.mjs).

const API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

const env = () => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
});

export function driveConfigured() {
  const e = env();
  return Boolean(e.clientId && e.clientSecret && e.refreshToken && e.folderId);
}

let token: { value: string; expires: number } | null = null;

async function accessToken() {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const e = env();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: e.clientId!,
      client_secret: e.clientSecret!,
      refresh_token: e.refreshToken!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Falha ao renovar token do Google: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: json.access_token, expires: Date.now() + json.expires_in * 1000 };
  return token.value;
}

async function driveFetch(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${await accessToken()}`);
  return fetch(url, { ...init, headers, cache: "no-store" });
}

/**
 * Abre uma sessão de upload resumível. O navegador envia o arquivo direto
 * para a URL devolvida, sem passar pelo servidor (sem limite de tamanho da
 * função). `origin` precisa ser a origem do site para o Google liberar CORS.
 */
export async function createUploadSession(opts: {
  fileName: string;
  mimeType: string;
  size: number;
  guest: string;
  msg: string;
  origin: string;
}) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeGuest = opts.guest.replace(/[\\/:*?"<>|]/g, "").slice(0, 60);
  const metadata = {
    name: `${stamp} - ${safeGuest} - ${opts.fileName}`,
    parents: [env().folderId],
    mimeType: opts.mimeType,
    description: opts.msg,
    // appProperties aceita no máximo 124 bytes por par chave+valor.
    appProperties: { guest: truncateBytes(opts.guest, 100) },
  };
  const res = await driveFetch(`${UPLOAD_API}/files?uploadType=resumable&fields=id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": opts.mimeType,
      "X-Upload-Content-Length": String(opts.size),
      Origin: opts.origin,
    },
    body: JSON.stringify(metadata),
  });
  const location = res.headers.get("location");
  if (!res.ok || !location) throw new Error(`Falha ao iniciar upload: ${res.status} ${await res.text()}`);
  return location;
}

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  appProperties?: { guest?: string };
  imageMediaMetadata?: { width?: number; height?: number; rotation?: number };
  videoMediaMetadata?: { width?: number; height?: number };
};

// Cache curto da lista, para não consultar o Drive a cada visita.
let listCache: { at: number; photos: Photo[] } | null = null;

/** Todas as fotos da pasta, as mais recentes primeiro (só metadados; as imagens vêm sob demanda). */
export async function listAllPhotos(): Promise<Photo[]> {
  if (listCache && Date.now() - listCache.at < 15_000) return listCache.photos;

  const q = `'${env().folderId}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`;
  const fields =
    "nextPageToken,files(id,name,mimeType,description,appProperties,imageMediaMetadata(width,height,rotation),videoMediaMetadata(width,height))";
  const files: DriveFile[] = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({ q, fields, orderBy: "createdTime desc", pageSize: "1000" });
    if (pageToken) params.set("pageToken", pageToken);
    const res = await driveFetch(`${API}/files?${params}`);
    if (!res.ok) throw new Error(`Falha ao listar fotos: ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { files: DriveFile[]; nextPageToken?: string };
    files.push(...json.files);
    pageToken = json.nextPageToken ?? "";
  } while (pageToken);

  const photos = files.map(toPhoto);
  listCache = { at: Date.now(), photos };
  return photos;
}

export function invalidatePhotos() {
  listCache = null;
}

function toPhoto(f: DriveFile): Photo {
  const meta = f.imageMediaMetadata ?? f.videoMediaMetadata;
  let w = meta?.width, h = meta?.height;
  if (f.imageMediaMetadata?.rotation && f.imageMediaMetadata.rotation % 2 === 1) [w, h] = [h, w];
  return {
    id: f.id,
    src: `/api/photos/${f.id}?size=large`,
    thumb: `/api/photos/${f.id}?size=small`,
    download: `/api/photos/${f.id}?download=1`,
    fileName: f.name.split(" - ").slice(2).join(" - ") || f.name,
    ratio: w && h ? `${w}/${h}` : "3/4",
    guest: f.appProperties?.guest || "Convidado",
    msg: f.description ?? "",
    isVideo: f.mimeType.startsWith("video/"),
  };
}

/** Miniatura em JPEG gerada pelo Drive (também converte HEIC e vídeos). */
export async function fetchThumbnail(id: string, px: number) {
  const meta = await driveFetch(`${API}/files/${encodeURIComponent(id)}?fields=thumbnailLink,parents`);
  if (!meta.ok) return null;
  const { thumbnailLink, parents } = (await meta.json()) as { thumbnailLink?: string; parents?: string[] };
  if (!parents?.includes(env().folderId!) || !thumbnailLink) return null;
  const res = await driveFetch(thumbnailLink.replace(/=s\d+$/, `=s${px}`));
  return res.ok ? res : null;
}

/** Arquivo original, em streaming. */
export async function fetchOriginal(id: string) {
  const meta = await driveFetch(`${API}/files/${encodeURIComponent(id)}?fields=name,mimeType,parents`);
  if (!meta.ok) return null;
  const info = (await meta.json()) as { name: string; mimeType: string; parents?: string[] };
  if (!info.parents?.includes(env().folderId!)) return null;
  const res = await driveFetch(`${API}/files/${encodeURIComponent(id)}?alt=media`);
  return res.ok ? { res, info } : null;
}

function truncateBytes(s: string, max: number) {
  const enc = new TextEncoder();
  while (enc.encode(s).length > max) s = s.slice(0, -1);
  return s;
}
