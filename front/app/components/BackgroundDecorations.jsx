import Image from "next/image";

export default function BackgroundDecorations({
  children,
  bgColor = "bg-purple-700",
}) {
  const decorations = [
    {
      src: "/DecoR (tatica 1).svg",
      className:
        "absolute top-[5%] left-[5%] w-24 h-24 transform rotate-[-15deg]",
    },
    {
      src: "/DecoR (tatica 2).svg",
      className:
        "absolute bottom-[8%] left-[12%] w-28 h-28 transform rotate-[30deg]",
    },
    {
      src: "/TrianguloM-RV.svg",
      className:
        "absolute top-[50%] left-[2%] w-16 h-16 transform rotate-[60deg] -translate-y-1/2",
    },
    {
      src: "/TrianguloP-RV.svg",
      className:
        "absolute top-[2%] right-[30%] w-10 h-10 transform rotate-[180deg]",
    },
    {
      src: "/Deco (linha).svg",
      className:
        "absolute top-1/2 left-1/2 w-48 h-48 transform -translate-x-1/2 -translate-y-1/2 opacity-20",
    },
    {
      src: "/DecoR (tatica 1).svg",
      className:
        "absolute bottom-[5%] right-[5%] w-16 h-16 transform rotate-[45deg]",
    },
    {
      src: "/DecoR (tatica 2).svg",
      className:
        "absolute top-[60%] right-[15%] w-20 h-20 transform rotate-[-50deg]",
    },
    {
      src: "/TrianguloM-RV.svg",
      className:
        "absolute top-[15%] right-[8%] w-20 h-20 transform rotate-[25deg]",
    },
    {
      src: "/Seta-Preta.svg",
      className:
        "absolute bottom-[20%] left-[30%] w-12 h-12 transform rotate-[90deg]",
    },
    {
      src: "/Seta.svg",
      className:
        "absolute top-[30%] right-[25%] w-14 h-14 transform rotate-[-45deg]",
    },
    {
      src: "/Deco (linha).svg",
      className:
        "absolute bottom-[10%] left-[40%] w-32 h-32 transform rotate-[10deg] opacity-30",
    },
  ];

  return (
    <div
      className={`
        min-h-screen
        ${bgColor}
        relative
        overflow-hidden
        flex
        flex-col
        justify-center
        items-center
        p-4 sm:p-6 md:p-8 lg:p-12
      `}
    >
      <div className="absolute inset-0 z-0">
        {decorations.map((deco, index) => (
          <Image
            key={index}
            src={deco.src}
            alt="decoration"
            className={deco.className}
            width={100}
            height={100}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
