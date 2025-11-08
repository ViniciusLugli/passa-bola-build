"use client";

import { useTheme } from "@/app/context/ThemeContext";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-surface-muted shadow-elevated" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="
        relative
        w-10
        h-10
        rounded-full
        bg-surface-muted
        shadow-elevated
        flex
        items-center
        justify-center
        transition-all
        duration-300
        hover:scale-110
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-accent
        focus:ring-offset-2
        focus:ring-offset-[rgb(var(--color-page))]
      "
      aria-label={
        theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"
      }
      title={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
    >
      {/* Ícone Sol (Light Mode) */}
      <Sun
        className={`
          absolute
          h-5
          w-5
          text-yellow-500
          transition-all
          duration-300
          ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }
        `}
        strokeWidth={2}
      />

      {/* Ícone Lua (Dark Mode) */}
      <Moon
        className={`
          absolute
          h-5
          w-5
          text-purple-400
          transition-all
          duration-300
          ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }
        `}
        strokeWidth={2}
      />
    </button>
  );
}
