import "server-only";
import { demoPhotos } from "./demo";
import { driveConfigured, invalidatePhotos, listAllPhotos } from "./drive";
import type { Photo } from "./types";

export type PhotoPage = { photos: Photo[]; total: number };
export type PhotoResult = PhotoPage & { demo: boolean };

/**
 * Um trecho do álbum (as mais recentes primeiro): do Google Drive, ou as
 * fotos de exemplo no modo demonstração.
 */
export async function getPhotos(limit: number, offset = 0, fresh = false): Promise<PhotoResult> {
  const demo = !driveConfigured();
  if (fresh && !demo) invalidatePhotos();
  const all = demo ? demoPhotos : await listAllPhotos();
  return { photos: all.slice(offset, offset + limit), total: all.length, demo };
}
