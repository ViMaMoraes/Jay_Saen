import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

// Permite usar as variáveis/bindings da Cloudflare no `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
