"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/app/lib/api";
import CommentSection from "@/app/components/comments/CommentSection";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { normalizeRemoteUrl } from "@/app/lib/fileUtils";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.postId;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoFocusComments, setAutoFocusComments] = useState(false);

  const [imageSrc, setImageSrc] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    if (!postId) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.posts.getById(postId);
        if (mounted) setPost(res);
      } catch (err) {
        console.error("Erro ao carregar post:", err);
        setError("Falha ao carregar publicação.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [postId]);

  // Detect query param to auto focus comment field when coming from a card button
  const searchParams = useSearchParams();
  useEffect(() => {
    try {
      const focus = searchParams?.get?.("focusComment");
      if (focus) {
        setAutoFocusComments(true);
        setTimeout(() => setAutoFocusComments(false), 800);
        // remove query param from URL without adding history entry
        router.replace(`/feed/post/${postId}`);
      }
    } catch (err) {
      // ignore
    }
  }, [searchParams, postId, router]);

  // Try to fetch images when post loads and post.imageUrl is falsy
  useEffect(() => {
    if (!post) return;
    if (post.imageUrl) {
      setImageSrc(post.imageUrl);
      return;
    }

    let mounted = true;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

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
        console.debug("Erro ao buscar imagens do post:", err);
      } finally {
        if (mounted) setLoadingImage(false);
      }
    };

    loadImages();
    return () => (mounted = false);
  }, [post]);

  const handleBack = (e) => {
    e.preventDefault();
    router.back();
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    setAutoFocusComments(true);
    // reset after a while so subsequent clicks can refocus
    setTimeout(() => setAutoFocusComments(false), 800);
    // Allow CommentSection to scroll into view via its autoFocus handling
  };

  if (loading) {
    return (
      <main className="container mx-auto p-6 max-w-3xl">
        <div className="text-center text-secondary">Carregando publicação...</div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="container mx-auto p-6 max-w-3xl">
        <div className="text-center text-secondary">{error || "Publicação não encontrada."}</div>
        <div className="mt-4 text-center">
          <Link href="/feed" className="text-accent hover:underline">
            Voltar ao Feed
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6 max-w-3xl">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={handleBack} className="p-2 rounded-md hover:bg-surface-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Publicação</h1>
      </div>

      <article className="bg-surface border border-default rounded-lg shadow-elevated p-6">
        <header className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden relative">
            <Image
              src={post.authorProfilePhotoUrl || "/icons/user-default.png"}
              alt={post.authorUsername}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div>
            <div className="font-bold text-lg text-primary">{post.authorUsername}</div>
            <div className="text-sm text-secondary">{new Date(post.createdAt).toLocaleString()}</div>
          </div>
        </header>

        <div className="text-primary mb-4 whitespace-pre-wrap wrap-break-word">{post.content}</div>

        {(imageSrc || loadingImage) && (
          <div className="relative w-full h-80 rounded-lg overflow-hidden mb-4">
            {loadingImage && !imageSrc ? (
              <div className="w-full h-full bg-surface-muted animate-pulse" />
            ) : (
              <PostImage src={imageSrc} alt="Imagem do post" />
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary">{post.totalLikes || 0} curtidas</div>
          <div>
            <button
              onClick={handleCommentClick}
              className="inline-flex items-center gap-2 px-3 py-1 bg-surface-muted text-secondary rounded-md hover:bg-surface-hover transition-colors"
              aria-label="Focar campo de comentário"
            >
              <MessageCircle className="w-4 h-4" />
              Abrir comentários
            </button>
          </div>
        </div>
      </article>

      <section className="mt-6">
        <CommentSection postId={post.id} autoFocus={autoFocusComments} />
      </section>
    </main>
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
    <Image
      src={normalized}
      alt={alt}
      fill
      className="object-cover"
      sizes="100vw"
      onError={() => setFailed(true)}
    />
  );
}
