/**
 * Layout para páginas de autenticação (login, register, landing)
 * Não inclui Header - páginas públicas
 */

export const metadata = {
  title: "PassaBola - A Rede Social do Futebol Feminino",
  description: "Conecte-se com jogadoras de todo o Brasil, organize partidas, crie times e participe de torneios. A plataforma que eleva o futebol feminino.",
  keywords: "futebol feminino, rede social, jogadoras, times, campeonatos, brasil",
  openGraph: {
    title: "PassaBola - A Rede Social do Futebol Feminino",
    description: "Conecte-se com jogadoras, organize jogos e fortaleça a comunidade.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "PassaBola - A Rede Social do Futebol Feminino",
    description: "Conecte-se com jogadoras, organize jogos e fortaleça a comunidade.",
  },
};

export default function AuthLayout({ children }) {
  return <>{children}</>;
}
