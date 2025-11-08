import Link from "next/link";
import { Users, Trophy } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Jogadoras",
  },
  {
    icon: Users,
    value: "100+",
    label: "Times",
  },
  {
    icon: Trophy,
    value: "200+",
    label: "Jogos Organizados",
  },
];

export default function SocialProofSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-accent-soft">
      <div className="max-w-7xl mx-auto">
        {/* Partnership */}
        <div className="text-center mb-12">
          <p className="text-lg sm:text-xl text-accent font-semibold mb-2">
            Em parceria com
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            FIAP e Passa a Bola
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div
                    className="
                      w-16
                      h-16
                      bg-accent
                      rounded-full
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Icon
                      className="w-8 h-8 text-accent-contrast"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <p className="text-4xl sm:text-5xl font-bold text-accent mb-2">
                  {stat.value}
                </p>
                <p className="text-lg sm:text-xl text-primary font-medium">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/register"
            className="
              inline-block
              px-8
              py-4
              bg-accent
              hover:bg-accent-strong
              text-lg
              font-bold
              rounded-full
              transition-all
              duration-300
              shadow-elevated
              hover:scale-105
              active:scale-95
              focus:outline-none
              focus:ring-4
              focus:ring-accent/50
              text-accent-contrast
            "
            aria-label="Juntar-se ao PassaBola"
          >
            Junte-se a nós
          </Link>
        </div>
      </div>
    </section>
  );
}
