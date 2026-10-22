import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// O site é todo dinâmico (sem ISR), então não precisa de cache incremental.
export default {
  ...defineCloudflareConfig({}),
  // `npm run build` já gera o bundle da Cloudflare (padrão do painel);
  // aqui o OpenNext chama o build do Next.js diretamente para não entrar em loop.
  buildCommand: "npx next build",
};
