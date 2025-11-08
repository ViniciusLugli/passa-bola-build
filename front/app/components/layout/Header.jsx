"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Home,
  Trophy,
  Calendar,
  Users,
  User,
  MessageCircle,
  Bot,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useChat } from "@/app/context/ChatContext";

// Import dinâmico para evitar SSR
const ThemeToggle = dynamic(() => import("@/app/components/ui/ThemeToggle"), {
  ssr: false,
  loading: () => (
    <div className="w-10 h-10 rounded-full bg-surface-muted shadow-elevated" />
  ),
});

const NotificationBell = dynamic(
  () => import("@/app/components/ui/NotificationBell"),
  {
    ssr: false,
    loading: () => (
      <div className="w-10 h-10 rounded-full bg-surface-muted animate-pulse" />
    ),
  }
);

const iconMap = {
  Feed: Home,
  Jogos: Trophy,
  Calendário: Calendar,
  Equipes: Users,
  Perfil: User,
  Chat: MessageCircle,
  Chatbot: Bot,
};

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount: chatUnreadCount } = useChat();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const baseLinks = [
    { name: "Feed", href: "/feed" },
    { name: "Jogos", href: "/games" },
    { name: "Calendário", href: "/calendar" },
    { name: "Equipes", href: "/teams" },
    { name: "Chat", href: "/chat" },
    { name: "Chatbot", href: "/chatbot" },
  ];

  const navLinks = baseLinks
    .filter((l) => {
      if (!user) return true;
      const role = String(user.userType || "").toUpperCase();
      if (role === "SPECTATOR" && l.name === "Equipes") return false;
      return true;
    })
    .concat({
      name: "Perfil",
      href: user ? `/user/${user.userType.toLowerCase()}/${user.id}` : "/login",
    });

  return (
    <header
      className="
      sticky
      top-0
      z-50
      bg-brand-gradient
      backdrop-blur-sm
      shadow-elevated
      w-full
      p-4
      md:px-8
      flex
      justify-between
      items-center
      transition-colors
    "
    >
      <div className="flex items-center gap-3">
        <Image
          src="/logo.svg"
          alt="Logo do Passa a Bola"
          width={40}
          height={40}
          className="w-10 h-10 rounded-full"
          priority
        />
        <ThemeToggle />
      </div>

      <nav className="hidden md:flex gap-1 lg:gap-2 items-center">
        {navLinks.map((link) => {
          const Icon = iconMap[link.name];
          return (
            <Link
              key={link.name}
              href={link.href}
              className="
                flex
                flex-col
                items-center
                justify-center
                gap-1
                text-white
                hover:text-white/90
                transition-all
                duration-200
                font-semibold
                w-20
                relative
                opacity-90
                hover:opacity-100
              "
            >
              <Icon className="w-6 h-6" strokeWidth={2} />
              <span className="text-xs">{link.name}</span>
              {link.name === "Chat" && chatUnreadCount > 0 && (
                <span className="absolute top-0 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                </span>
              )}
            </Link>
          );
        })}

        {/* Notification Bell with integrated badge */}
        <Link
          href="/notifications"
          className="
            flex
            flex-col
            items-center
            justify-center
            gap-1
            text-white
            hover:text-white/90
            transition-colors
            duration-200
            w-20
            cursor-pointer
          "
        >
          <NotificationBell />
          <span className="text-xs font-semibold">Notificações</span>
        </Link>
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-1
              text-white
              hover:text-white/90
              transition-all
              duration-200
              font-semibold
              w-20
              opacity-90
              hover:opacity-100
            "
          >
            <LogOut className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs">Sair</span>
          </button>
        ) : (
          <Link href="/login" passHref>
            <button className="bg-accent hover:bg-accent-strong px-4 py-2 rounded-md transition-all duration-200 font-semibold shadow-elevated hover:shadow-lg">
              Entrar
            </button>
          </Link>
        )}
      </nav>

      <button
        className="md:hidden text-white hover:text-white/90 transition-all duration-200"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Menu"
      >
        <Menu className="w-8 h-8" strokeWidth={2} />
      </button>

      {isMenuOpen && (
        <div
          className="
          md:hidden
          absolute
          top-full
          right-0
          w-64
          mt-2
          bg-surface-elevated
          border
          border-strong
          rounded-xl
          shadow-elevated
          p-4
          text-primary
        "
        >
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const Icon = iconMap[link.name];
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="
                  flex
                  items-center
                  gap-3
                  text-primary
                  hover:text-accent
                  transition-colors
                  duration-200
                  font-semibold
                  p-2
                  rounded-lg
                  relative
                  hover:bg-surface-muted
                "
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-6 h-6" strokeWidth={2} />
                  <span>{link.name}</span>
                  {link.name === "Chat" && chatUnreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Notification Bell in mobile menu */}
            <Link
              href="/notifications"
              className="
                flex
                items-center
                gap-3
                text-primary
                hover:text-accent
                transition-colors
                duration-200
                font-semibold
                p-2
                rounded-lg
                relative
                hover:bg-surface-muted
              "
              onClick={() => setIsMenuOpen(false)}
            >
              <NotificationBell />
              <span>Notificações</span>
            </Link>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="
                flex
                items-center
                gap-3
                text-primary
                hover:text-accent
                transition-colors
                duration-200
                font-semibold
                p-2
                rounded-lg
                w-full
                text-left
                hover:bg-surface-muted
              "
              >
                <LogOut className="w-6 h-6" strokeWidth={2} />
                <span>Sair</span>
              </button>
            ) : (
              <Link href="/login" passHref>
                <span
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-primary hover:text-accent transition-colors duration-200 font-semibold p-2 rounded-lg hover:bg-surface-muted"
                >
                  <LogOut className="w-6 h-6" strokeWidth={2} />
                  <span>Entrar</span>
                </span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
