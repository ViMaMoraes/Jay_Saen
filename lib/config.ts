// Personalize o site aqui.
export const wedding = {
  bride: "Jayane",
  groom: "Anderson",
  initials: ["J", "A"] as const,
  // Mês começa em 0 (10 = novembro).
  date: new Date(2026, 10, 14),
  dateShort: "14 · 11 · 2026",
  dateLong: "14 de novembro de 2026",
  // "editorial" (foto ao lado do título) ou "cinematic" (foto em tela cheia).
  heroStyle: "editorial" as "editorial" | "cinematic",
  // "mosaic" (alturas variadas) ou "square" (grade quadrada).
  galleryStyle: "mosaic" as "mosaic" | "square",
  // Quantas fotos recentes aparecem na página inicial.
  homePreviewCount: 5,
  // Quantas fotos a galeria carrega por vez.
  galleryPageSize: 24,
  // Exigir o nome do convidado para enviar fotos.
  requireName: true,
  // Tamanho máximo por arquivo (fotos e vídeos curtos).
  maxFileBytes: 500 * 1024 * 1024,
};

export const coupleName = `${wedding.bride} & ${wedding.groom}`;
