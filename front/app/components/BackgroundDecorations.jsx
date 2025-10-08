"use client";

import React from "react";
import Image from "next/image";

const SOURCES = [
  "/DecoR-tatica-1.svg",
  "/DecoR-tatica-2.svg",
  "/TrianguloM-RV.svg",
  "/TrianguloP-RV.svg",
  "/Deco-linha.svg",
];

const FIXED_POSITIONS = [
  {
    src: SOURCES[2],
    top: "5%",
    left: "3%",
    size: 50,
    rotate: -10,
    opacity: 0.7,
  },
  {
    src: SOURCES[0],
    top: "25%",
    left: "8%",
    size: 60,
    rotate: 15,
    opacity: 0.6,
  },
  {
    src: SOURCES[1],
    top: "45%",
    left: "2%",
    size: 55,
    rotate: 5,
    opacity: 0.7,
  },
  {
    src: SOURCES[3],
    top: "65%",
    left: "10%",
    size: 48,
    rotate: -20,
    opacity: 0.8,
  },
  {
    src: SOURCES[4],
    top: "80%",
    left: "5%",
    size: 65,
    rotate: 0,
    opacity: 0.2,
  },
  {
    src: SOURCES[2],
    top: "95%",
    left: "12%",
    size: 42,
    rotate: 25,
    opacity: 0.7,
  },

  {
    src: SOURCES[4],
    top: "12%",
    left: "50%",
    size: 70,
    rotate: 0,
    opacity: 0.18,
  },
  {
    src: SOURCES[1],
    top: "85%",
    left: "50%",
    size: 52,
    rotate: 10,
    opacity: 0.7,
  },

  {
    src: SOURCES[3],
    top: "8%",
    left: "97%",
    size: 50,
    rotate: -15,
    opacity: 0.7,
  },
  {
    src: SOURCES[0],
    top: "30%",
    left: "90%",
    size: 58,
    rotate: 20,
    opacity: 0.6,
  },
  {
    src: SOURCES[2],
    top: "55%",
    left: "98%",
    size: 48,
    rotate: -10,
    opacity: 0.7,
  },
  {
    src: SOURCES[1],
    top: "90%",
    left: "88%",
    size: 55,
    rotate: 15,
    opacity: 0.7,
  },
];

function getResponsiveSize(base, vw) {
  if (vw < 480) return base * 0.8;
  if (vw < 768) return base * 1.0;
  if (vw < 1024) return base * 1.3;
  return base * 1.5;
}

function randomOffset(min, max) {
  return Math.random() * (max - min) + min;
}

export default function BackgroundDecorations({
  children,
  bgColor = "bg-gray-100",
}) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [vw, setVw] = React.useState(1200);
  const [randomizedPositions, setRandomizedPositions] = React.useState([]);

  React.useEffect(() => {
    setIsMounted(true);
    setVw(window.innerWidth);

    // Gera offsets e rotações aleatórias para cada decoração
    const positions = FIXED_POSITIONS.map((d) => ({
      ...d,
      topOffset: randomOffset(-3, 3), // offset de -3% a +3%
      leftOffset: randomOffset(-3, 3),
      rotateOffset: randomOffset(-15, 15), // rotação adicional de -15° a +15°
    }));
    setRandomizedPositions(positions);

    const handleResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`${bgColor} relative overflow-hidden min-h-screen`}>
      {isMounted && randomizedPositions.length > 0 && (
        <div
          className="absolute inset-0 z-0 pointer-events-none select-none"
          aria-hidden="true"
        >
          {randomizedPositions.map((d, i) => (
            <Image
              key={i}
              src={d.src}
              alt={`deco-${i}`}
              width={getResponsiveSize(d.size, vw)}
              height={getResponsiveSize(d.size, vw)}
              style={{
                position: "absolute",
                top: `calc(${d.top} + ${d.topOffset}%)`,
                left: `calc(${d.left} + ${d.leftOffset}%)`,
                transform: `translate(-50%, -50%) rotate(${
                  d.rotate + d.rotateOffset
                }deg)`,
                opacity: d.opacity,
                pointerEvents: "none",
                userSelect: "none",
                maxWidth: "18vw",
                minWidth: 24,
              }}
              unoptimized
              priority={false}
              draggable={false}
            />
          ))}
        </div>
      )}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
