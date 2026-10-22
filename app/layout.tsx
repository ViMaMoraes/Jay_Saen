import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import UploadProvider from "@/components/UploadProvider";
import { coupleName, wedding } from "@/lib/config";
import { driveConfigured } from "@/lib/drive";
import "./globals.css";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});
const body = Lora({ subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"], variable: "--font-lora" });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `Casamento ${coupleName}`,
  description: `Envie as fotos que você tirou no casamento de ${coupleName} — ${wedding.dateLong}.`,
  openGraph: {
    title: `Casamento ${coupleName}`,
    description: "Envie suas fotos do nosso dia para o álbum dos noivos.",
    images: ["/assets/ja-3.jpg"],
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#f3f2f2" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${heading.variable} ${body.variable}`}>
      <body>
        {/* Fica no layout para o envio e as fotos recém-enviadas sobreviverem à troca de página. */}
        <UploadProvider demo={!driveConfigured()}>{children}</UploadProvider>
      </body>
    </html>
  );
}
