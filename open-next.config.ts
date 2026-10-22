import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// O site é todo dinâmico (sem ISR), então não precisa de cache incremental.
export default defineCloudflareConfig({});
