export default function AuthLayout({ children }) {
  const decorations = [
    {
      src: "/DecoB (tatica 1).svg",
      className:
        "absolute top-[5%] left-[5%] w-24 h-24 transform rotate-[-15deg]",
    },
    {
      src: "/DecoB (tatica 2).svg",
      className:
        "absolute bottom-[8%] left-[12%] w-28 h-28 transform rotate-[30deg]",
    },
    {
      src: "/TrianguloM-BV.svg",
      className:
        "absolute top-[50%] left-[2%] w-16 h-16 transform rotate-[60deg] -translate-y-1/2",
    },
    {
      src: "/TrianguloP-BV.svg",
      className:
        "absolute top-[2%] right-[30%] w-10 h-10 transform rotate-[180deg]",
    },
    {
      src: "/Deco (linha).svg",
      className:
        "absolute top-1/2 left-1/2 w-48 h-48 transform -translate-x-1/2 -translate-y-1/2 opacity-20",
    },
    {
      src: "/DecoB (tatica 1).svg",
      className:
        "absolute bottom-[5%] right-[5%] w-16 h-16 transform rotate-[45deg]",
    },
    {
      src: "/DecoB (tatica 2).svg",
      className:
        "absolute top-[60%] right-[15%] w-20 h-20 transform rotate-[-50deg]",
    },
    {
      src: "/TrianguloM-BV.svg",
      className:
        "absolute top-[15%] right-[8%] w-20 h-20 transform rotate-[25deg]",
    },
  ];

  return (
    <div
      className="
        min-h-screen 
        bg-purple-700 
        relative 
        overflow-hidden 
        flex 
        flex-col 
        justify-center 
        items-center 
        p-4 sm:p-6 md:p-8 lg:p-12
      "
    >
      <div className="absolute inset-0 z-0">
        {decorations.map((deco, index) => (
          <img
            key={index}
            src={deco.src}
            alt="decoration"
            className={deco.className}
          />
        ))}
      </div>
      <main
        className="
          relative 
          z-10 
          w-full 
          max-w-md 
          md:max-w-lg 
          lg:max-w-xl 
          mx-auto 
          flex 
          flex-col 
          items-center 
          justify-center 
          gap-8
        "
      >
        {children}
      </main>
    </div>
  );
}
