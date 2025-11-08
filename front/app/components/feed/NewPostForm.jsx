"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/api";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import FileUpload from "@/app/components/ui/FileUpload";
import useFileUpload from "@/app/hooks/useFileUpload";

export default function NewPostForm({ onSuccess }) {
  const router = useRouter();
  const { user } = useAuth();
  const { uploadPostImage } = useFileUpload();

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [postId, setPostId] = useState(null);

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!content.trim()) {
      setError("O post não pode estar vazio.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create post first (without image)
      const postData = {
        content,
        type: "GENERAL",
      };

      const created = await api.posts.create(postData);

      // 2. If there's a selected image file, upload it using the correct API
      if (selectedFile && created.id) {
        try {
          const uploadResult = await uploadPostImage(created.id, selectedFile);

          if (uploadResult?.url) {
            // Update the created post object to include the image URL
            created.imageUrl = uploadResult.url;
          }
        } catch (imageError) {
          console.warn("Failed to upload post image:", imageError);
          // Continue without failing the post creation
        }
      }

      // Reset form
      setContent("");
      setSelectedFile(null);
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl("");
      setPostId(null);

      if (onSuccess) onSuccess(created);
      else router.push("/feed");
    } catch (err) {
      setError(err.message || "Falha ao criar o post.");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload - store file for later upload
  const handleImageUpload = (result) => {
    if (result?.url) {
      setImageUrl(result.url); // Show preview
    }
  };

  // Handle file selection from FileUpload component
  const handleFileSelection = (files) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      // Create preview URL for UI
      const previewUrl = URL.createObjectURL(files[0]);
      setImageUrl(previewUrl);
    }
  };

  // Handle image removal
  const handleImageRemove = () => {
    setImageUrl("");
    setSelectedFile(null);
    // Cleanup preview URL
    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
  };

  const profilePhotoUrl = user?.profilePhotoUrl || "/icons/user-default.png";

  return (
    <div className="relative bg-surface border border-default rounded-2xl shadow-elevated p-6 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Oops! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface-muted">
            <Image
              src={profilePhotoUrl}
              alt="Avatar do usuário atual"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="font-bold text-lg text-primary leading-tight">
              {user?.name || user?.username}
            </h4>
            <p className="text-sm text-secondary">@{user?.username}</p>
          </div>
        </div>

        <Input
          type="textarea"
          placeholder="O que você tem em mente?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          className="min-h-[120px]"
          autoFocus
        />

        {/* Image Upload Section */}
        <div className="border-t border-default pt-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-primary">
              Adicionar Imagem
            </h4>

            {/* Preview da imagem selecionada */}
            {imageUrl && (
              <div className="relative">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-default">
                  <Image
                    src={imageUrl}
                    alt="Preview da imagem"
                    fill
                    className="object-cover"
                    sizes="100%"
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {!imageUrl && (
              <FileUpload
                accept="image/*"
                maxSize={10 * 1024 * 1024} // 10MB
                maxFiles={1}
                onFilesSelected={handleFileSelection}
                label="Clique ou arraste uma imagem aqui"
                description="Formatos aceitos: JPG, PNG, GIF, WebP - Máximo 10MB"
                disabled={loading}
              />
            )}
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          ariaLabel="Publicar"
          variant="primary"
        >
          {loading ? "PUBLICANDO..." : "Publicar"}
        </Button>
      </form>
    </div>
  );
}
