"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function CommentCard({ comment, onEdit, onDelete }) {
  const { profile } = useAuth();
  const [editing, setEditing] = useState(false);

  const isOwned = comment.isOwnedByCurrentUser || (profile && profile.entityId === comment.userId);

  return (
    <div className="flex items-start space-x-3 py-3 border-b last:border-b-0">
      <div className="w-10 h-10 relative rounded-full overflow-hidden">
        <Image
          src={comment.userProfilePhotoUrl || "/icons/user-default.png"}
          alt={comment.userName}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm">{comment.userUsername || comment.userName}</div>
            <div className="text-xs text-secondary">{new Date(comment.createdAt).toLocaleString()}</div>
          </div>
          {isOwned && (
            <div className="space-x-2">
              <button
                onClick={() => onEdit && onEdit(comment)}
                className="text-sm text-secondary hover:text-primary"
                aria-label="Editar comentário"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete && onDelete(comment)}
                className="text-sm text-red-500 hover:underline"
                aria-label="Deletar comentário"
              >
                Apagar
              </button>
            </div>
          )}
        </div>

        <div className="mt-2 text-primary whitespace-pre-wrap">{comment.content}</div>
      </div>
    </div>
  );
}
