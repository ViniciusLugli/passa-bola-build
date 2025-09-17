"use client";

import React, { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import PostCard from "@/app/components/PostCard";
import SearchBar from "@/app/components/SearchBar";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

function Feed() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let response;
        if (searchTerm) {
          response = await api.posts.search(searchTerm);
        } else {
          response = await api.posts.getAll();
        }
        setPosts(response.content || []);
      } catch (err) {
        console.error("Erro ao carregar posts:", err);
        setError(err.message || "Falha ao carregar os posts.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      // Chamar fetchPosts apenas quando não estiver carregando e autenticado
      const handler = setTimeout(() => {
        fetchPosts();
      }, 1000);

      return () => {
        clearTimeout(handler);
      };
    } else if (!authLoading && !isAuthenticated) {
      setError("Você precisa estar logado para ver o feed.");
      setLoading(false);
    }
  }, [searchTerm, isAuthenticated, authLoading]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
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
          <SearchBar value={searchTerm} onChange={handleSearchChange} />
        </div>

        {loading && <p className="text-center">Carregando posts...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <section className="flex flex-col gap-6">
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
        bottom-6 
        right-6 
        p-4 
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
          className="w-8 h-8"
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
