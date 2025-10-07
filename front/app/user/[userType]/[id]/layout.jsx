"use client";

import BackgroundDecorations from "@/app/components/BackgroundDecorations";
import PrivateRoute from "@/app/components/PrivateRoute";

export default function UserLayout({ children }) {
  return (
    <BackgroundDecorations>
      <PrivateRoute>{children}</PrivateRoute>
    </BackgroundDecorations>
  );
}
