"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/app/lib/api";

export function useRecentComments(postId, { limit = 20 } = {}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.postComments.recent(postId, { limit });
      if (res && res.content) setComments(res.content);
      else if (Array.isArray(res)) setComments(res);
    } catch (err) {
      console.error("useRecentComments error", err);
    } finally {
      setLoading(false);
    }
  }, [postId, limit]);

  useEffect(() => {
    if (!postId) return;
    load();
  }, [postId, load]);

  return { comments, loading, reload: load };
}
