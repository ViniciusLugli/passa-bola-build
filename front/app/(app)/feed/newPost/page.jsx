"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect deep-link to main feed (modal flow is preferred)
    router.replace("/feed");
  }, [router]);

  return null;
}
