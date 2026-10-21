// Autoriza o site a usar o Google Drive dos noivos e cria a pasta do álbum.
//
//   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... npm run google:auth
//
// Abre um link de login; ao final imprime GOOGLE_REFRESH_TOKEN e
// GOOGLE_DRIVE_FOLDER_ID para colocar no .env.local / na Vercel.
import http from "node:http";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const folderName = process.env.FOLDER_NAME || "Casamento Jayane & Anderson — Fotos dos convidados";
const port = 53682;
const redirectUri = `http://localhost:${port}/callback`;
// drive.file: o site só enxerga os arquivos e pastas que ele mesmo criou.
const scope = "https://www.googleapis.com/auth/drive.file";

if (!clientId || !clientSecret) {
  console.error("Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET antes de rodar.");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirectUri);
  if (url.pathname !== "/callback") return res.writeHead(404).end();
  const code = url.searchParams.get("code");
  if (!code) {
    res.end("Autorização cancelada.");
    return finish(1, url.searchParams.get("error"));
  }
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.refresh_token) throw new Error(JSON.stringify(tokens));

    let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      const folderRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokens.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName, mimeType: "application/vnd.google-apps.folder" }),
      });
      const folder = await folderRes.json();
      if (!folder.id) throw new Error(JSON.stringify(folder));
      folderId = folder.id;
    }

    res.end("Pronto! Pode fechar esta aba e voltar ao terminal.");
    console.log("\nAdicione ao .env.local e às variáveis de ambiente da Vercel:\n");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GOOGLE_DRIVE_FOLDER_ID=${folderId}\n`);
    console.log(`Pasta no Drive: https://drive.google.com/drive/folders/${folderId}\n`);
    finish(0);
  } catch (err) {
    res.end("Algo deu errado, veja o terminal.");
    finish(1, err);
  }
});

function finish(code, err) {
  if (err) console.error(err);
  server.close();
  process.exit(code);
}

server.listen(port, () => {
  console.log("Abra este link no navegador e entre com a conta Google dos noivos:\n");
  console.log(authUrl + "\n");
});
