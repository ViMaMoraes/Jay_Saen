export type Photo = {
  id: string;
  /** Imagem para o álbum e o lightbox. Vazio = placeholder (modo demonstração). */
  src: string;
  /** Miniatura menor para a grade do álbum. */
  thumb: string;
  /** Arquivo original para baixar. */
  download: string;
  fileName: string;
  ratio: string;
  guest: string;
  msg: string;
  isVideo: boolean;
};
