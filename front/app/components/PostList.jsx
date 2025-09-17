import { memo } from "react";
import PostCard from "./PostCard";

function PostList({ posts, profileUser }) {
  if (!posts || posts.length === 0) {
    return <p className="text-gray-500">Nenhuma publicação encontrada.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <PostCard
          key={`${profileUser.username}-${post.id}`}
          post={{
            ...post,
            authorUsername: profileUser.username,
            authorProfilePhotoUrl:
              profileUser.profilePhotoUrl || "/icons/user-default.png",
            authorRole: profileUser.userType, // Garante que o role do autor seja o do perfil
          }}
        />
      ))}
    </div>
  );
}

export default memo(PostList);
