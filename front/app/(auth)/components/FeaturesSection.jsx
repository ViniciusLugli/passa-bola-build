import { Users, Trophy, MessageCircle, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Feed Social",
    description:
      "Conecte-se com jogadoras de todo o Brasil e compartilhe sua paixão pelo futebol. Construa sua rede e inspire outras atletas.",
  },
  {
    icon: Trophy,
    title: "Jogos e Times",
    description:
      "Organize partidas, crie times e participe de torneios na sua região. Encontre companheiras de equipe e adversárias do seu nível.",
  },
  {
    icon: MessageCircle,
    title: "Chat em Tempo Real",
    description:
      "Converse com outras atletas e organize jogos rapidamente. Comunicação instantânea para marcar aquela partida do fim de semana.",
  },
  {
    icon: BarChart3,
    title: "Rankings e Estatísticas",
    description:
      "Acompanhe seu desempenho e veja rankings das melhores jogadoras. Evolua seu jogo com dados e conquiste seu lugar no pódio.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-page"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-lg sm:text-xl text-secondary max-w-3xl mx-auto">
            Uma plataforma completa para elevar sua carreira no futebol feminino
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="
                  bg-surface
                  border
                  border-default
                  rounded-xl
                  p-6
                  shadow-md
                  hover:shadow-lg
                  transition-all
                  duration-300
                  hover:-translate-y-1
                "
              >
                <div
                  className="
                    w-12
                    h-12
                    bg-accent-soft
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    mb-4
                  "
                >
                  <Icon className="w-6 h-6 text-accent" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
