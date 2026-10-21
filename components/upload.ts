// Envio de um arquivo: o servidor abre uma sessão no Google Drive e o
// navegador manda o arquivo direto para lá, acompanhando o progresso.

export type Picked = { id: string; file: File; url: string; type: string; progress: number; failed: boolean };

const extTypes: Record<string, string> = {
  heic: "image/heic",
  heif: "image/heif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mov: "video/quicktime",
  mp4: "video/mp4",
  m4v: "video/x-m4v",
};

/** Alguns celulares não informam o tipo de HEIC/MOV; deduz pela extensão. */
export function mediaType(file: File) {
  if (/^(image|video)\//.test(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return extTypes[ext] ?? "";
}

export async function uploadFile(
  item: Picked,
  guest: string,
  msg: string,
  onProgress: (fraction: number) => void,
): Promise<{ id: string; demo: boolean }> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: item.file.name, mimeType: item.type, size: item.file.size, guest, msg }),
  });
  const json = (await res.json().catch(() => ({}))) as { uploadUrl?: string; demo?: boolean; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Falha no envio.");

  if (json.demo) {
    // Sem Google Drive configurado: simula o envio para demonstração.
    for (let p = 0; p < 1; p += 0.08 + Math.random() * 0.12) {
      onProgress(p);
      await new Promise((r) => setTimeout(r, 120));
    }
    onProgress(1);
    return { id: `local-${item.id}`, demo: true };
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", json.uploadUrl!);
    xhr.setRequestHeader("Content-Type", item.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(1);
        let id = `local-${item.id}`;
        try {
          id = JSON.parse(xhr.responseText).id ?? id;
        } catch {}
        resolve({ id, demo: false });
      } else reject(new Error(`Falha no envio (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Falha de conexão."));
    xhr.send(item.file);
  });
}
