import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { coupleName } from "@/lib/config";

export const metadata: Metadata = {
  title: `Privacidade · Casamento ${coupleName}`,
  description: `Como o site do casamento de ${coupleName} usa as fotos e os dados enviados pelos convidados.`,
};

export default function Privacidade() {
  return (
    <>
      <SiteNav />
      <main className="section prose">
        <Link href="/" className="back-link">
          <ChevronLeftIcon size={16} />
          Início
        </Link>
        <div className="kicker">Privacidade</div>
        <h1 className="page-title">Política de privacidade</h1>

        <p>
          Este site existe para os convidados do casamento de {coupleName} compartilharem as fotos e vídeos que
          tiraram no dia. Aqui explicamos, de forma simples, o que acontece com o que você envia.
        </p>

        <h2>O que coletamos</h2>
        <ul>
          <li>As fotos e vídeos que você escolhe enviar, na qualidade original.</li>
          <li>O nome que você informa e, se quiser, um recado para os noivos.</li>
        </ul>
        <p>Não pedimos login, e-mail ou telefone, e não usamos cookies de rastreamento nem anúncios.</p>

        <h2>Onde fica guardado</h2>
        <p>
          Os arquivos são salvos numa pasta do Google Drive usada só para este álbum. O site tem acesso apenas a
          essa pasta, e a nada mais do Drive. O Google armazena os arquivos de acordo com a{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
            política de privacidade do Google
          </a>
          .
        </p>

        <h2>Quem pode ver</h2>
        <p>
          As fotos, o nome de quem enviou e o recado aparecem na galeria do site, que qualquer pessoa com o link
          pode ver e baixar. Os noivos e as pessoas com acesso à pasta do Drive também podem ver os arquivos.
        </p>

        <h2>Seu nome no aparelho</h2>
        <p>
          Para você não precisar digitar de novo, o site lembra o seu nome no próprio navegador (armazenamento local).
          Ele não sai do seu aparelho por esse meio e você pode apagá-lo limpando os dados do site no navegador.
        </p>

        <h2>Remover uma foto</h2>
        <p>
          Se você enviou algo por engano ou quer que uma foto sua seja retirada, fale com os noivos ou com quem te
          passou o link do site, que a foto é apagada do álbum.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
