import PostList from "@/app/components/lists/PostList";
import LoadingSkeleton from "@/app/components/ui/LoadingSkeleton";

/**
 * Componente de conteúdo da tab Posts
 * Exibe lista de publicações do usuário
 *
 * @param {Array} posts - Lista de posts
 * @param {Object} profileUser - Dados do usuário do perfil
 * @param {boolean} isLoading - Estado de carregamento
 */
export default function PostsTabContent({ posts, profileUser, isLoading }) {
  return (
    <section
      role="tabpanel"
      id="posts-panel"
      aria-labelledby="posts-tab"
      tabIndex={0}
    >
      <h3 className="text-xl md:text-2xl font-bold text-primary mb-4">
        Publicações
      </h3>
      {isLoading ? (
        <LoadingSkeleton count={3} variant="post" />
      ) : (
        <PostList posts={posts} profileUser={profileUser} />
      )}
    </section>
  );
}
