"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export default function useFeed({ initialSize = 10 } = {}) {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(initialSize);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  const abortRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const fetchResults = async (pageToLoad = 0, replace = false) => {
      try {
        if (pageToLoad === 0 && !replace) setLoading(true);
        if (pageToLoad > 0) setLoadingMore(true);
        setError(null);

        if (abortRef.current) {
          try {
            abortRef.current.abort();
          } catch (e) {}
        }
        const controller = new AbortController();
        abortRef.current = controller;

        const q = searchTerm.trim();

        const filters = selectedFilters || [];

        let usersAccum = [];
        let postsAccum = [];

        const guarded = async (fn) => {
          const res = await fn();
          if (controller.signal.aborted) throw new Error("aborted");
          return res;
        };

        if (q && filters.length === 0) {
          const p = await guarded(() =>
            api.players.search(q, { page: 0, size: 5 })
          );
          usersAccum = usersAccum.concat(
            (p.content || []).map((u) => ({ ...u, _type: "player" }))
          );

          const s = await guarded(() =>
            api.spectators.search(q, { page: 0, size: 5 })
          );
          usersAccum = usersAccum.concat(
            (s.content || []).map((u) => ({ ...u, _type: "spectator" }))
          );

          const o = await guarded(() =>
            api.organizations.search(q, { page: 0, size: 5 })
          );
          usersAccum = usersAccum.concat(
            (o.content || []).map((u) => ({ ...u, _type: "organization" }))
          );

          // posts after users
          const postsRes = await guarded(() =>
            api.posts.search(q, { page: 0, size: 20 })
          );
          postsAccum = postsRes.content || [];
          // disable infinite scroll when searching
          setHasMore(false);
        } else if (q && filters.length > 0) {
          const promises = [];
          if (filters.includes("posts")) {
            promises.push(
              guarded(() => api.posts.search(q, { page: 0, size: 20 })).then(
                (r) => ({ kind: "posts", data: r.content || [] })
              )
            );
          }
          if (filters.includes("players")) {
            promises.push(
              guarded(() => api.players.search(q, { page: 0, size: 20 })).then(
                (r) => ({
                  kind: "players",
                  data: (r.content || []).map((u) => ({
                    ...u,
                    _type: "player",
                  })),
                })
              )
            );
          }
          if (filters.includes("spectators")) {
            promises.push(
              guarded(() =>
                api.spectators.search(q, { page: 0, size: 20 })
              ).then((r) => ({
                kind: "spectators",
                data: (r.content || []).map((u) => ({
                  ...u,
                  _type: "spectator",
                })),
              }))
            );
          }
          if (filters.includes("organizations")) {
            promises.push(
              guarded(() =>
                api.organizations.search(q, { page: 0, size: 20 })
              ).then((r) => ({
                kind: "organizations",
                data: (r.content || []).map((u) => ({
                  ...u,
                  _type: "organization",
                })),
              }))
            );
          }

          const results = await Promise.all(promises);
          results.forEach((res) => {
            if (res.kind === "posts") postsAccum = postsAccum.concat(res.data);
            else usersAccum = usersAccum.concat(res.data);
          });
        } else {
          // paginated fetch when no search/filters
          const postsRes = await guarded(() =>
            api.posts.getAll({ page: pageToLoad, size })
          );
          postsAccum = postsRes.content || [];
          if (postsRes.totalPages != null && postsRes.number != null) {
            setHasMore(postsRes.number < postsRes.totalPages - 1);
          } else {
            setHasMore((postsRes.content || []).length === size);
          }
        }

        setUserResults(usersAccum);
        setPosts((prev) =>
          pageToLoad === 0 ? postsAccum : prev.concat(postsAccum)
        );
      } catch (err) {
        if (err.message === "aborted") return;
        console.error("Erro ao carregar resultados:", err);
        setError(err.message || "Falha ao carregar resultados.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      const handler = setTimeout(() => {
        if (searchTerm.trim() || selectedFilters.length > 0) {
          setPage(0);
          fetchResults(0, true);
        } else {
          setPage(0);
          setPosts([]);
          fetchResults(0, true);
        }
      }, 500);

      return () => {
        clearTimeout(handler);
        if (abortRef.current) {
          try {
            abortRef.current.abort();
          } catch (e) {}
        }
      };
    } else if (!authLoading && !isAuthenticated) {
      setError("Você precisa estar logado para ver o feed.");
      setLoading(false);
    }
  }, [
    searchTerm,
    isAuthenticated,
    authLoading,
    selectedFilters,
    page,
    size,
    reloadKey,
  ]);

  // infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loadingMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            (async () => {
              try {
                setLoadingMore(true);
                const res = await api.posts.getAll({ page: nextPage, size });
                const nextPosts = res.content || [];
                setPosts((prev) => prev.concat(nextPosts));
                if (res.totalPages != null && res.number != null) {
                  setHasMore(res.number < res.totalPages - 1);
                } else {
                  setHasMore(nextPosts.length === size);
                }
              } catch (err) {
                console.error(err);
              } finally {
                setLoadingMore(false);
              }
            })();
          }
        });
      },
      { rootMargin: "200px" }
    );

    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [sentinelRef.current, hasMore, loadingMore, loading, page, size]);

  const refresh = () => {
    // trigger a full reload of the first page
    setPage(0);
    setPosts([]);
    setReloadKey((k) => k + 1);
  };

  const prependPost = (post) => {
    setPosts((prev) => [post].concat(prev));
  };

  return {
    posts,
    userResults,
    loading,
    loadingMore,
    hasMore,
    page,
    setPage,
    searchTerm,
    setSearchTerm,
    selectedFilters,
    setSelectedFilters,
    sentinelRef,
    error,
    refresh,
    prependPost,
  };
}
