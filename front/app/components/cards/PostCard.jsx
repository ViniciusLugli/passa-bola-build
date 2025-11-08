"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle } from "lucide-react";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import CommentSection from "@/app/components/comments/CommentSection";
import { getApiUrl } from "@/app/lib/apiUrl";
import { normalizeRemoteUrl } from "@/app/lib/fileUtils";

function PostCard({ post, showComments = true }) {
  const { isAuthenticated } = useAuth(); // Obter estado de autenticação
  const { showToast } = useToast();
  const [hasLiked, setHasLiked] = useState(post.isLikedByCurrentUser || false);
  const [currentLikes, setCurrentLikes] = useState(
    post.totalLikes || post.likes || 0
  );
  const [imageSrc, setImageSrc] = useState(post.imageUrl || null);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    setHasLiked(post.isLikedByCurrentUser || false);
    setCurrentLikes(post.totalLikes || post.likes || 0);
    setImageSrc(post.imageUrl || null);

    // Debug: Log post data to check imageUrl
    console.log("PostCard received post:", {
      id: post.id,
      content: post.content?.substring(0, 50) + "...",
      imageUrl: post.imageUrl,
      hasImage: !!post.imageUrl,
    });
  }, [post]);

  useEffect(() => {
    // If the post doesn't include an imageUrl, try to fetch images for the post
    if (post && !post.imageUrl) {
      const API_URL = getApiUrl();
      let mounted = true;
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;

      const loadImages = async () => {
        try {
          setLoadingImage(true);
          const res = await fetch(`${API_URL}/files/posts/${post.id}/images`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!res.ok) return;
          const json = await res.json();
          if (!mounted) return;
          if (json && Array.isArray(json.images) && json.images.length > 0) {
            setImageSrc(json.images[0]);
          }
        } catch (err) {
          console.debug("Não foi possível carregar imagem do post:", err);
        } finally {
          if (mounted) setLoadingImage(false);
        }
      };

      loadImages();
      return () => (mounted = false);
    }
    return undefined;
  }, [post]);

  const router = useRouter();

  const handleCardClick = () => {
    // Navega para página de detalhe do post
    router.push(`/feed/post/${post.id}`);
  };

  const handleLikeToggle = async (e) => {
    // prevenir propagation para que o clique no botão não abra o detalhe
    if (e && e.stopPropagation) e.stopPropagation();
    if (!isAuthenticated) {
      showToast("Você precisa estar logado para curtir posts!", "error");
      return;
    }

    try {
      if (hasLiked) {
        await api.posts.unlike(post.id);
        setCurrentLikes((prev) => prev - 1);
      } else {
        await api.posts.like(post.id);
        setCurrentLikes((prev) => prev + 1);
      }
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error("Erro ao curtir/descurtir post:", error);
      showToast("Falha ao processar sua curtida. Tente novamente.", "error");
    }
  };
  return (
    <div
      className="bg-surface border border-default rounded-lg shadow-elevated p-4 cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleCardClick();
      }}
    >
      <div className="flex items-center mb-4">
        <div
          className="relative w-10 h-10 rounded-full overflow-hidden mr-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={
              normalizeRemoteUrl(post.authorProfilePhotoUrl) ||
              "/icons/user-default.png"
            }
            alt="Avatar do autor"
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div>
          <Link
            href={`/user/${post.authorType.toLowerCase()}/${post.authorId}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-bold text-lg text-primary leading-tight hover:underline cursor-pointer">
              {post.authorUsername}{" "}
            </h4>
          </Link>
          <p className="text-secondary text-sm">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="text-primary mb-4 whitespace-pre-wrap wrap-break-word">
        {post.content}
      </div>

      {/* Image: prefer post.imageUrl, fallback to fetched imageSrc (from /files/posts/:id/images) */}
      {(imageSrc || loadingImage) && (
        <div className="relative w-full h-60 rounded-lg overflow-hidden mb-4">
          {loadingImage && !imageSrc ? (
            <div className="w-full h-full bg-surface-muted animate-pulse" />
          ) : (
            <PostImage src={imageSrc} alt="Imagem da publicação" />
          )}
        </div>
      )}

      <div className="flex items-center mt-4">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={(e) => handleLikeToggle(e)}
            className="flex items-center space-x-2 text-zinc-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 focus:outline-none"
          >
            <Heart
              className={`h-5 w-5 ${
                hasLiked
                  ? "text-red-500 fill-red-500"
                  : "text-zinc-500 dark:text-gray-300"
              }`}
              strokeWidth={2}
            />
            <span className="font-bold">{currentLikes} Curtidas</span>
          </button>

          {/* Botão de comentar: ao clicar, abre detalhe com foco no campo de comentário */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              // Navega para o detalhe e aciona foco no campo de comentário via query param
              router.push(`/feed/post/${post.id}?focusComment=1`);
            }}
            aria-label="Comentar nesta publicação"
            className="inline-flex items-center gap-2 px-3 py-1 bg-surface-muted text-secondary rounded-md hover:bg-surface-hover transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Comentar</span>
          </button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4">
          <CommentSection postId={post.id} />
        </div>
      )}
    </div>
  );
}

function PostImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const normalized = normalizeRemoteUrl(src);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-muted text-secondary">
        <span className="text-sm">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <>
      {/* Use next/image for remote images; if it errors, fall back to native img */}
      <Image
        src={normalized}
        alt={alt}
        fill
        className="object-cover"
        sizes="100vw"
        onError={() => setFailed(true)}
      />
    </>
  );
}

export default PostCard;
