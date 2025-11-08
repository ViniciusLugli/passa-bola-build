"use client";

import { useState } from "react";
import PostCard from "@/app/components/cards/PostCard";
import SearchBar from "@/app/components/ui/SearchBar";
import LoadingSkeleton from "@/app/components/ui/LoadingSkeleton";
import EmptyState from "@/app/components/ui/EmptyState";
import ErrorState from "@/app/components/ui/ErrorState";
import { Plus, MessageCircle } from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import NewPostForm from "@/app/components/feed/NewPostForm";
import useFeed from "@/app/hooks/useFeed";
import Button from "@/app/components/ui/Button";

function Feed() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
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
    prependPost,
  } = useFeed({ initialSize: 10 });

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFiltersChange = (filters) => setSelectedFilters(filters || []);

  const getUserTypeLabel = (type) => {
    const types = {
      player: "Jogadora",
      organization: "Organização",
      spectator: "Espectador",
    };
    return types[type] || type;
  };

  return (
    <div>
      <main
        className="
        container 
        mx-auto 
        p-3 sm:p-4 md:p-8 lg:p-12 
        max-w-md sm:max-w-4xl
        min-h-screen
      "
        aria-busy={loading}
      >
        <h1
          className="
          text-4xl 
          font-extrabold 
          text-primary
          leading-tight
          mb-8
          text-center
        "
        >
          Feed
        </h1>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onFiltersChange={handleFiltersChange}
              selectedFilters={selectedFilters}
            />
          </div>

          <div className="flex-shrink-0 self-start">
            <div className="sm:hidden mt-2">
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="primary"
                className="w-full"
                ariaLabel="Criar nova publicação"
              >
                Criar publicação
              </Button>
            </div>
            <div className="hidden sm:block">
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="primary"
                ariaLabel="Criar nova publicação"
              >
                Criar
              </Button>
            </div>
          </div>
        </div>

        {loading && <LoadingSkeleton count={3} variant="post" />}

        {error && (
          <ErrorState
            title="Erro ao carregar feed"
            message={error}
            onRetry={() => window.location.reload()}
            variant="error"
          />
        )}

        {!loading && !error && (
          <section className="flex flex-col gap-6" aria-live="polite">
            {userResults.length > 0 && (
              <div className="bg-surface border border-default p-4 rounded-md shadow-elevated">
                <h3 className="font-semibold text-primary mb-2">Usuários</h3>
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
                          className="font-medium text-accent hover:text-accent-strong transition-colors"
                        >
                          {u.name || u.username}
                        </a>
                        <div className="text-sm text-secondary">
                          {getUserTypeLabel(u._type)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} showComments={false} />
              ))
            ) : (
              <EmptyState
                icon={<MessageCircle />}
                title="Nenhum post disponível"
                description="Seja a primeira a compartilhar algo ou siga outras usuárias para ver posts aqui."
                action={
                  <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Post
                  </Button>
                }
                variant="gradient"
              />
            )}
            <div ref={sentinelRef} />
            {loadingMore && <LoadingSkeleton count={1} variant="post" />}
          </section>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Criar Nova Publicação"
      >
        <NewPostForm
          onSuccess={(created) => {
            if (created) prependPost(created);
            setIsModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

export default function FeedPage() {
  return <Feed />;
}
