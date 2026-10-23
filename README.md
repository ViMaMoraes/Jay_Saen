# Casamento Jayane & Anderson

Site do casamento (14/11/2026). Os convidados enviam as fotos e vídeos que tiraram no dia, que vão direto para uma pasta no Google Drive dos noivos e aparecem no álbum do site.

Feito com Next.js a partir do protótipo de design "Classical" (Cormorant Garamond + Lora, tons dourados).

## Rodar no computador

```bash
npm install
npm run dev
```

`npm run build` gera o pacote para a Cloudflare; para só o build do Next.js, use `npm run build:next`.

Abra http://localhost:3000. Sem o Google Drive configurado, o site roda em **modo demonstração**: mostra fotos de exemplo, e os envios aparecem só no próprio aparelho.

## Personalizar

- `lib/config.ts`: nomes, data, estilo da capa (`editorial` ou `cinematic`), estilo do álbum (`mosaic` ou `square`), quantas fotos recentes aparecem na página inicial (`homePreviewCount`, padrão 5), as opções de fotos por página da galeria (`galleryPageSizes`, padrão 25, 50 e 100), nome obrigatório e tamanho máximo dos arquivos.
- `public/assets/`: fotos do pré-wedding (`ja-1.jpg`, `ja-2.jpg`, `ja-3.jpg`).
- `app/globals.css`: cores e estilos (tokens no topo do arquivo).

## Conectar ao Google Drive

O site usa a conta Google dos noivos, com a permissão `drive.file`: ele só enxerga a pasta e os arquivos que ele mesmo cria, e nada mais do Drive.

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto e ative a **Google Drive API**.
2. Em **APIs e serviços → Tela de consentimento OAuth**, configure o app como *Externo* e adicione o e-mail dos noivos. Depois clique em **Publicar app** (status "Em produção"). Em modo "Teste" o acesso expira em 7 dias e o envio para de funcionar.
3. Em **Credenciais → Criar credenciais → ID do cliente OAuth**, escolha *App para computador*. Anote o Client ID e o Client Secret.
4. No seu computador, rode:
   ```bash
   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... npm run google:auth
   ```
   Abra o link, entre com a conta dos noivos e autorize. Se aparecer o aviso "app não verificado", clique em *Avançado → Acessar*. O script cria a pasta do álbum no Drive e mostra `GOOGLE_REFRESH_TOKEN` e `GOOGLE_DRIVE_FOLDER_ID`.
5. Copie `.env.example` para `.env.local` e preencha as quatro variáveis.

Cada envio vira um arquivo na pasta com o nome do convidado no nome do arquivo e o recado na descrição. A página inicial mostra as últimas fotos enviadas, e a página `/galeria` mostra todas, separadas em páginas, com envio e download.

## Publicar na Cloudflare

O site tem partes que rodam no servidor (envio e listagem das fotos), então ele vai como **Worker**, e não como Pages estático. O adaptador [OpenNext](https://opennext.js.org/cloudflare) já está configurado (`wrangler.jsonc` e `open-next.config.ts`).

1. No painel da Cloudflare: **Workers & Pages → Create → Workers → Import a repository** e escolha este repositório.
2. Pode deixar os comandos padrão do painel:
   - **Build command:** `npm run build` (já gera o pacote da Cloudflare)
   - **Deploy command:** `npx wrangler deploy`
3. Depois do primeiro deploy, em **Settings → Variables and Secrets** do Worker, adicione as quatro variáveis do `.env.local` (de preferência como *Secret*) e faça um novo deploy.
4. Se quiser, aponte um domínio próprio em **Settings → Domains & Routes**.

Para testar localmente no mesmo ambiente da Cloudflare: coloque as variáveis num arquivo `.dev.vars` e rode `npm run preview`. Para publicar direto do computador: `npm run deploy`.

### Alternativa: Vercel

Importe o repositório em https://vercel.com/new, adicione as quatro variáveis em *Settings → Environment Variables* e faça o deploy.

Os arquivos vão do celular do convidado direto para o Google Drive (upload resumível), então não há limite de tamanho do servidor, e vídeos grandes também funcionam.

## Estrutura

```
app/
  layout.tsx               layout comum (envio de fotos compartilhado entre as páginas)
  page.tsx                 página inicial (últimas fotos)
  galeria/page.tsx         galeria completa
  api/upload/route.ts      abre a sessão de envio no Drive
  api/photos/route.ts      lista as fotos do álbum
  api/photos/[id]/route.ts miniatura / download de um arquivo
components/
  WeddingSite.tsx          página inicial: capa, casal, como funciona, últimas fotos
  GalleryPage.tsx          página da galeria
  PhotoGrid.tsx            grade de fotos com download
  Pagination.tsx           páginas da galeria e fotos por página
  UploadProvider.tsx       estado do envio, modal e botão flutuante
  SiteChrome.tsx           menu, rodapé e área de arrastar fotos
  UploadModal.tsx          formulário e progresso do envio
  Lightbox.tsx             foto em tela cheia
lib/
  config.ts                dados do casamento
  drive.ts                 integração com o Google Drive
  photos.ts                fotos do Drive ou de exemplo (modo demonstração)
scripts/get-refresh-token.mjs  autorização do Google
```
