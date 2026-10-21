import WeddingSite from "@/components/WeddingSite";
import { demoPhotos } from "@/lib/demo";
import { driveConfigured, listPhotos } from "@/lib/drive";
import type { Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const demo = !driveConfigured();
  let photos: Photo[] = demoPhotos;
  if (!demo) {
    try {
      photos = await listPhotos();
    } catch (err) {
      console.error(err);
      photos = [];
    }
  }
  return <WeddingSite initialPhotos={photos} demo={demo} />;
}
