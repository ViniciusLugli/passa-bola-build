"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";

const ThemeToggle = dynamic(() => import("@/app/components/ui/ThemeToggle"), {
  ssr: false,
  loading: () => (
    <div className="w-10 h-10 rounded-full bg-surface-muted shadow-elevated animate-pulse" />
  ),
});

const decorations = [
  {
    src: "/DecoB-tatica-1.svg",
    className:
      "absolute top-[5%] left-[5%] w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 transform rotate-[-15deg]",
    width: 96,
    height: 96,
  },
  {
    src: "/DecoB-tatica-2.svg",
    className:
      "absolute bottom-[8%] left-[12%] w-20 sm:w-24 md:w-28 h-20 sm:h-24 md:h-28 transform rotate-[30deg]",
    width: 112,
    height: 112,
  },
  {
    src: "/TrianguloM-BV.svg",
    className:
      "absolute top-[50%] left-[2%] w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 transform rotate-[60deg] -translate-y-1/2",
    width: 64,
    height: 64,
  },
  {
    src: "/TrianguloP-BV.svg",
    className:
      "absolute top-[2%] right-[30%] w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 transform rotate-[180deg]",
    width: 40,
    height: 40,
  },
  {
    src: "/Deco-linha.svg",
    className:
      "absolute top-1/2 left-1/2 w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 transform -translate-x-1/2 -translate-y-1/2 opacity-20",
    width: 192,
    height: 192,
  },
  {
    src: "/DecoB-tatica-1.svg",
    className:
      "absolute bottom-[5%] right-[5%] w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 transform rotate-[45deg]",
    width: 64,
    height: 64,
  },
  {
    src: "/DecoB-tatica-2.svg",
    className:
      "absolute top-[60%] right-[15%] w-16 sm:w-18 md:w-20 h-16 sm:h-18 md:h-20 transform rotate-[-50deg]",
    width: 80,
    height: 80,
  },
  {
    src: "/TrianguloM-BV.svg",
    className:
      "absolute top-[15%] right-[8%] w-16 sm:w-18 md:w-20 h-16 sm:h-18 md:h-20 transform rotate-[25deg]",
    width: 80,
    height: 80,
  },
  {
    src: "/TrianguloP-BV.svg",
    className:
      "absolute bottom-[15%] right-[25%] w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 transform rotate-[-20deg]",
    width: 128,
    height: 128,
  },
];

export default function HeroSection({ scrollToFeatures }) {
  return (
    <section
      className="
        min-h-screen
        bg-brand-gradient
        text-on-brand
        relative
        overflow-hidden
        flex
        flex-col
        justify-center
        items-center
        p-4 sm:p-6 md:p-8 lg:p-12
      "
    >
      {/* Theme Toggle - Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <ThemeToggle />
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0">
        {decorations.map((deco, index) => (
          <Image
            key={index}
            src={deco.src}
            alt=""
            className={deco.className}
            width={deco.width}
            height={deco.height}
            priority={index < 3}
            loading={index < 3 ? undefined : "lazy"}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Hero Content */}
      <main
        id="main-content"
        className="
          relative
          z-10
          w-full
          max-w-4xl
          mx-auto
          flex
          flex-col
          items-center
          justify-center
          gap-8
        "
      >
        <div
          className="
            relative
            z-10
            w-full
            bg-surface
            border
            border-default
            rounded-3xl
            p-6 sm:p-8 md:p-10 lg:p-12
            shadow-elevated
            flex
            flex-col
            items-center
            text-center
            transition-transform duration-300 ease-in-out
          "
        >
          <h1
            className="
              text-3xl
              font-extrabold
              leading-tight
              sm:text-4xl
              md:text-5xl
              lg:text-6xl
              xl:text-7xl
              text-primary
              mb-4 sm:mb-6
            "
          >
            A plataforma que eleva o futebol feminino.
          </h1>

          <p
            className="
              text-base
              sm:text-lg
              md:text-xl
              text-secondary
              max-w-2xl
              leading-relaxed
              mb-6 sm:mb-8
            "
          >
            Uma rede social robusta para conectar jogadoras, clubes e fãs.
            Junte-se ao Passa a Bola e ajude a fortalecer a comunidade do
            esporte que amamos.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
            <Link
              href="/register"
              className="
                px-8 py-4
                bg-accent
                hover:bg-accent-strong
                text-lg
                font-bold
                rounded-full
                transition-all
                duration-300
                shadow-elevated
                hover:scale-105 active:scale-95
                focus:outline-none focus:ring-4 focus:ring-accent/50
                text-center
              "
              aria-label="Criar uma nova conta no PassaBola"
            >
              Começar Agora
            </Link>

            <button
              onClick={scrollToFeatures}
              className="px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300
                bg-white text-purple-700
                hover:bg-purple-50
                border-2 border-gray-300
                shadow-lg hover:shadow-xl
                focus:outline-none focus:ring-4 focus:ring-white/40
                flex items-center justify-center gap-2"
              aria-label="Saber mais sobre a plataforma"
            >
              Saber Mais
              <svg
                className="w-5 h-5 transition-transform duration-300 hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToFeatures}
        className="
          absolute
          bottom-8
          left-1/2
          -translate-x-1/2
          animate-bounce
          text-on-brand/70
          hover:text-on-brand
          transition-colors
          focus:outline-none focus:ring-4 focus:ring-accent/50 rounded-full p-2
        "
        aria-label="Rolar para baixo para ver recursos"
      >
        <ChevronDown className="w-8 h-8" aria-hidden="true" />
      </button>
    </section>
  );
}
