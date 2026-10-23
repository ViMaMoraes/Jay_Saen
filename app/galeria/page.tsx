import type { Metadata } from "next";
import GalleryPage from "@/components/GalleryPage";
import { coupleName, wedding } from "@/lib/config";
import { getPhotos, type PhotoPage } from "@/lib/photos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Galeria · Casamento ${coupleName}`,
  description: `Veja, envie e baixe as fotos do casamento de ${coupleName}.`,
};

type Search = Promise<{ pagina?: string; por?: string }>;

export default async function Galeria({ searchParams }: { searchParams: Search }) {
  const { pagina, por } = await searchParams;
  const sizes = wedding.galleryPageSizes;
  const perPage = sizes.includes(Number(por)) ? Number(por) : sizes[0];
  let page = Math.max(1, Math.floor(Number(pagina)) || 1);

  let result: PhotoPage = { photos: [], total: 0 };
  try {
    result = await getPhotos(perPage, (page - 1) * perPage);
    // Página além do fim (ex.: link antigo): mostra a última.
    const pages = Math.max(1, Math.ceil(result.total / perPage));
    if (page > pages) {
      page = pages;
      result = await getPhotos(perPage, (page - 1) * perPage);
    }
  } catch (err) {
    console.error(err);
  }
  return <GalleryPage photos={result.photos} total={result.total} page={page} perPage={perPage} />;
}
