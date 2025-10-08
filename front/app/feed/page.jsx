"use client";

import { useEffect, useState, useRef } from "react";
import Header from "@/app/components/Header";
import PostCard from "@/app/components/PostCard";
import SearchBar from "@/app/components/SearchBar";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

function Feed() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const abortRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
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
        } else if (q && filters.length > 0) {
          // For each selected filter, call respective search
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
          const postsRes = await guarded(() => api.posts.getAll());
          postsAccum = postsRes.content || [];
        }

        setUserResults(usersAccum);

        // Ordenar posts do mais recente para o mais antigo
        const sortedPosts = postsAccum.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA; // Mais recente primeiro
        });

        setPosts(sortedPosts);
      } catch (err) {
        if (err.message === "aborted") return;
        console.error("Erro ao carregar resultados:", err);
        setError(err.message || "Falha ao carregar resultados.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      const handler = setTimeout(() => {
        fetchResults();
      }, 1000);

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
  }, [searchTerm, isAuthenticated, authLoading, selectedFilters]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFiltersChange = (filters) => {
    setSelectedFilters(filters || []);
  };

  const getUserTypeLabel = (type) => {
    const types = {
      player: "Jogadora",
      organization: "Organização",
      spectator: "Espectador",
    };
    return types[type] || type;
  };

  return (
    <div className="transparent min-h-screen">
      <Header />
      <main
        className="
        container 
        mx-auto 
        p-4 md:p-8 lg:p-12 
        max-w-4xl
      "
      >
        <h1
          className="
          text-4xl 
          font-extrabold 
          text-gray-900 
          leading-tight
          mb-8
          text-center
        "
        >
          Feed
        </h1>

        <div className="mb-8">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onFiltersChange={handleFiltersChange}
            selectedFilters={selectedFilters}
          />
        </div>

        {loading && <p className="text-center">Carregando...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <section className="flex flex-col gap-6">
            {userResults.length > 0 && (
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-semibold mb-2">Usuários</h3>
                <div className="flex flex-col gap-3">
                  {userResults.map((u) => (
                    <div
                      key={`${u._type}-${u.id}`}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={u.profilePhoto || "/icons/user-default.png"}
                        alt={u.name || u.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <a
                          href={`/user/${u._type}/${u.id}`}
                          className="font-medium text-purple-600"
                        >
                          {u.name || u.username}
                        </a>
                        <div className="text-sm text-gray-500">
                          {getUserTypeLabel(u._type)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <p className="text-center text-gray-500">
                Nenhum post encontrado.
              </p>
            )}
          </section>
        )}
      </main>

      <Link
        href="/feed/newPost"
        className="
        fixed 
        bottom-4 
        right-4 
        sm:bottom-6 
        sm:right-6
        p-3 
        sm:p-4 
        rounded-full 
        bg-purple-600 
        text-white 
        shadow-lg
        hover:bg-purple-700
        transition-colors
        duration-200
        z-40
      "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 sm:w-8 sm:h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </Link>
    </div>
  );
}

export default function FeedPage() {
  return <Feed />;
}
