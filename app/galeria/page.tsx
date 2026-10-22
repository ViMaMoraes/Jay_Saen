import type { Metadata } from "next";
import GalleryPage from "@/components/GalleryPage";
import { coupleName, wedding } from "@/lib/config";
import { getPhotos, type PhotoPage } from "@/lib/photos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Galeria · Casamento ${coupleName}`,
  description: `Veja, envie e baixe as fotos do casamento de ${coupleName}.`,
};

export default async function Galeria() {
  let page: PhotoPage = { photos: [], nextCursor: null };
  try {
    page = await getPhotos(wedding.galleryPageSize);
  } catch (err) {
    console.error(err);
  }
  return <GalleryPage photos={page.photos} cursor={page.nextCursor} />;
}
