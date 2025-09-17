"use client";

import PrivateRoute from "@/app/components/PrivateRoute";

export default function UserLayout({ children }) {
  return <PrivateRoute>{children}</PrivateRoute>;
}
