import type { Photo } from "./types";

// Fotos de exemplo exibidas enquanto o Google Drive não está configurado.
const seed: [string, string, string][] = [
  ["4/5", "Mariana Costa", "Vocês dois brilhando! Que dia lindo."],
  ["2/3", "Tio Roberto", ""],
  ["1/1", "Letícia & Caio", "Esse sorriso da Jay não tem preço."],
  ["4/3", "Vó Cida", "Deus abençoe essa união."],
  ["3/4", "Rafael M.", ""],
  ["2/3", "Bruna Alves", ""],
  ["1/1", "Paulo & Renata", "A melhor festa do ano!"],
  ["4/5", "Thiago", ""],
  ["3/4", "Camila Souza", ""],
];

export const demoPhotos: Photo[] = seed.map(([ratio, guest, msg], i) => ({
  id: `demo-${i}`,
  src: "",
  thumb: "",
  download: "",
  fileName: "",
  ratio,
  guest,
  msg,
  isVideo: false,
}));
