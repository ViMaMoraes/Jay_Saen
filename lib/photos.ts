import "server-only";
import { demoPhotos } from "./demo";
import { driveConfigured, invalidatePhotos, listPhotos, type PhotoPage } from "./drive";

export type { PhotoPage };

export type PhotoResult = PhotoPage & { demo: boolean };

/** Uma página do álbum: do Google Drive, ou as fotos de exemplo no modo demonstração. */
export async function getPhotos(limit: number, cursor?: string | null, fresh = false): Promise<PhotoResult> {
  if (!driveConfigured()) {
    const start = Number(cursor) || 0;
    const end = start + limit;
    return {
      photos: demoPhotos.slice(start, end),
      nextCursor: end < demoPhotos.length ? String(end) : null,
      demo: true,
    };
  }
  if (fresh) invalidatePhotos();
  return { ...(await listPhotos(limit, cursor)), demo: false };
}
