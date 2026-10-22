import WeddingSite from "@/components/WeddingSite";
import { wedding } from "@/lib/config";
import { getPhotos } from "@/lib/photos";
import type { Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let photos: Photo[] = [];
  try {
    photos = (await getPhotos(wedding.homePreviewCount)).photos;
  } catch (err) {
    console.error(err);
  }
  return <WeddingSite recentPhotos={photos} />;
}
