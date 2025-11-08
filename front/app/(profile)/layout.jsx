"use client";

import Header from "@/app/components/layout/Header";
import BackgroundDecorations from "@/app/components/layout/BackgroundDecorations";
import PrivateRoute from "@/app/components/layout/PrivateRoute";

/**
 * Layout para páginas de perfil de usuário
 * Inclui Header, Background, e PrivateRoute protection
 */
export default function ProfileLayout({ children }) {
  return (
    <BackgroundDecorations>
      <Header />
      <PrivateRoute>{children}</PrivateRoute>
    </BackgroundDecorations>
  );
}
