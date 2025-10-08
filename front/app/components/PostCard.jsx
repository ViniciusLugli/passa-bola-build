import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { formatDateTimeBrazil } from "@/app/lib/dateUtils";

function PostCard({ post }) {
  const { isAuthenticated } = useAuth(); // Obter estado de autenticação
  const [hasLiked, setHasLiked] = useState(post.isLikedByCurrentUser || false);
  const [currentLikes, setCurrentLikes] = useState(
    post.totalLikes || post.likes || 0
  );

  useEffect(() => {
    setHasLiked(post.isLikedByCurrentUser || false);
    setCurrentLikes(post.totalLikes || post.likes || 0);
  }, [post]);

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      alert("Você precisa estar logado para curtir posts!");
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
      alert("Falha ao processar sua curtida. Tente novamente.");
    }
  };

  return (
    <div className="bg-white border border-zinc-300 rounded-lg shadow-xl p-4">
      <div className="flex items-center mb-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
          <Image
            src={post.authorProfilePhotoUrl || "/icons/user-default.png"}
            alt="Avatar do autor"
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div>
          <Link
            href={`/user/${post.authorType.toLowerCase()}/${post.authorId}`}
          >
            <h4 className="font-bold text-lg text-gray-900 leading-tight hover:underline cursor-pointer">
              {post.authorUsername}{" "}
            </h4>
          </Link>
          <p className="text-gray-500 text-sm">
            {formatDateTimeBrazil(post.createdAt).fullDateTime}
          </p>
        </div>
      </div>

      <p className="text-gray-800 mb-4">{post.content}</p>

      {post.imageUrl && (
        <div className="relative w-full h-60 rounded-lg overflow-hidden mb-4">
          <Image
            src={post.imageUrl}
            alt="Imagem da publicação"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      <div className="flex items-center mt-4">
        <button
          onClick={handleLikeToggle}
          className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors duration-200 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${hasLiked ? "text-red-500" : "text-gray-400"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          <span>{currentLikes} Curtidas</span>
        </button>
      </div>
    </div>
  );
}

export default PostCard;
