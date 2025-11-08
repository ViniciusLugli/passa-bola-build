"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Edit3, Trash2, Upload } from "lucide-react";
import FileUpload from "./FileUpload";
import useFileUpload from "@/app/hooks/useFileUpload";

const ImageUpload = ({
  // Type of image upload
  type = "general", // "avatar", "banner", "post", "team-logo", "game", "general"

  // Entity IDs (required based on type)
  userId,
  userType, // "PLAYER", "ORGANIZATION", "SPECTATOR"
  postId,
  teamId,
  gameId,
  currentImageUrl,
  className = "",
  size = "medium", // "small", "medium", "large"
  shape = "auto", // "square", "circle", "rectangle", "auto"
  showLabel = true,
  label,
  placeholder,

  // Callbacks
  onUploadSuccess,
  onUploadError,
  onImageRemove,

  // Component behavior
  disabled = false,
  required = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [showUploader, setShowUploader] = useState(!currentImageUrl);
  const fileInputRef = useRef(null);

  // Use the custom upload hook
  const {
    isUploading,
    uploadAvatar,
    uploadBanner,
    uploadPostImage,
    uploadGameImage,
    uploadTeamLogo,
    uploadTempFile,
    deleteFile,
    error: uploadError,
    success: uploadSuccess,
    uploadedFileUrl,
    resetState,
  } = useFileUpload();

  // Get configuration based on type
  const getUploadConfig = () => {
    const configs = {
      avatar: {
        maxSize: 5 * 1024 * 1024, // 5MB
        aspectRatio: "1:1",
        label: "Foto de Perfil",
        placeholder: "Clique para adicionar sua foto",
        shape: "circle",
        uploadFn: (file) => uploadAvatar(userId, userType, file),
      },
      banner: {
        maxSize: 10 * 1024 * 1024, // 10MB
        aspectRatio: "16:9",
        label: "Banner",
        placeholder: "Clique para adicionar um banner",
        shape: "rectangle",
        uploadFn: (file) => uploadBanner(userId, userType, file),
      },
      post: {
        maxSize: 10 * 1024 * 1024, // 10MB
        aspectRatio: "free",
        label: "Imagem do Post",
        placeholder: "Adicione uma imagem ao seu post",
        shape: "auto",
        uploadFn: (file) => uploadPostImage(postId, file),
      },
      "team-logo": {
        maxSize: 5 * 1024 * 1024, // 5MB
        aspectRatio: "1:1",
        label: "Logo do Time",
        placeholder: "Clique para adicionar o logo",
        shape: "circle",
        uploadFn: (file) => uploadTeamLogo(teamId, file),
      },
      game: {
        maxSize: 10 * 1024 * 1024, // 10MB
        aspectRatio: "16:9",
        label: "Imagem do Jogo",
        placeholder: "Adicione uma imagem do jogo",
        shape: "rectangle",
        uploadFn: (file) => uploadGameImage(gameId, file),
      },
      general: {
        maxSize: 10 * 1024 * 1024, // 10MB
        aspectRatio: "free",
        label: "Imagem",
        placeholder: "Clique para adicionar uma imagem",
        shape: "auto",
        uploadFn: (file) => uploadTempFile(file),
      },
      temp: {
        maxSize: 20 * 1024 * 1024, // 20MB for temp files
        aspectRatio: "free",
        label: "Imagem Temporária",
        placeholder: "Clique para adicionar uma imagem",
        shape: "auto",
        uploadFn: (file) => uploadTempFile(file),
      },
    };

    return (
      configs[type] || {
        maxSize: 10 * 1024 * 1024,
        aspectRatio: "free",
        label: "Imagem",
        placeholder: "Clique para adicionar uma imagem",
        shape: "auto",
        uploadFn: (file) => uploadTempFile(file),
      }
    );
  };

  const config = getUploadConfig();

  // Get size classes
  const getSizeClasses = () => {
    const sizes = {
      small: {
        container: "w-16 h-16",
        preview: "w-16 h-16",
        uploader: "min-h-[64px]",
      },
      medium: {
        container: "w-24 h-24",
        preview: "w-24 h-24",
        uploader: "min-h-[96px]",
      },
      large: {
        container: "w-32 h-32",
        preview: "w-32 h-32",
        uploader: "min-h-[128px]",
      },
    };

    // Special handling for banners
    if (type === "banner") {
      return {
        container: "w-full h-24 md:h-32",
        preview: "w-full h-24 md:h-32",
        uploader: "min-h-[96px] md:min-h-[128px]",
      };
    }

    return sizes[size] || sizes.medium;
  };

  const sizeClasses = getSizeClasses();

  // Get shape classes
  const getShapeClasses = () => {
    const actualShape = shape === "auto" ? config.shape : shape;

    const shapes = {
      circle: "rounded-full",
      square: "rounded-lg",
      rectangle: "rounded-lg",
    };

    return shapes[actualShape] || "rounded-lg";
  };

  const shapeClasses = getShapeClasses();

  // Handle upload
  const handleUpload = async (files) => {
    if (!files?.length || !config.uploadFn) return;

    try {
      resetState();
      const file = files[0];

      // Create preview URL immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload file
      const result = await config.uploadFn(file);

      // Update with final URL
      if (result?.url) {
        URL.revokeObjectURL(objectUrl); // Cleanup
        setPreviewUrl(result.url);
        setShowUploader(false);

        if (onUploadSuccess) {
          onUploadSuccess(result);
        }
      }
    } catch (error) {
      // Restore previous preview on error
      setPreviewUrl(currentImageUrl);

      if (onUploadError) {
        onUploadError(error);
      }
    }
  };

  // Handle remove image
  const handleRemoveImage = async () => {
    try {
      if (previewUrl && previewUrl !== currentImageUrl) {
        await deleteFile(previewUrl);
      }

      setPreviewUrl(null);
      setShowUploader(true);

      if (onImageRemove) {
        onImageRemove();
      }
    } catch (error) {
      if (onUploadError) {
        onUploadError(error);
      }
    }
  };

  // Handle edit (replace image)
  const handleEditImage = () => {
    setShowUploader(true);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      {showLabel && (
        <label className="block text-sm font-medium text-primary">
          {label || config.label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Image Preview */}
      {previewUrl && !showUploader && (
        <div className={`relative ${sizeClasses.container} group`}>
          <div
            className={`${sizeClasses.preview} ${shapeClasses} overflow-hidden border-2 border-default bg-surface-muted`}
          >
            <Image
              src={previewUrl}
              alt={config.label}
              fill
              className="object-cover"
              sizes={
                size === "small" ? "64px" : size === "large" ? "128px" : "96px"
              }
            />
          </div>

          {/* Overlay controls */}
          <div
            className={`
            absolute inset-0 ${shapeClasses}
            bg-black/50 opacity-0 group-hover:opacity-100 
            transition-opacity duration-200
            flex items-center justify-center space-x-2
          `}
          >
            <button
              type="button"
              onClick={handleEditImage}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              disabled={disabled || isUploading}
            >
              <Edit3 className="w-4 h-4 text-white" />
            </button>

            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              disabled={disabled || isUploading}
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Upload progress overlay */}
          {isUploading && (
            <div
              className={`
              absolute inset-0 ${shapeClasses}
              bg-surface/80 backdrop-blur-sm 
              flex items-center justify-center
            `}
            >
              <div className="text-center">
                <Upload className="w-6 h-6 text-accent animate-pulse mx-auto mb-2" />
                <p className="text-xs font-medium">Enviando...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      {showUploader && (
        <div className={`${sizeClasses.uploader}`}>
          <FileUpload
            accept="image/*"
            maxSize={config.maxSize}
            maxFiles={1}
            onUpload={handleUpload}
            isUploading={isUploading}
            disabled={disabled}
            label={`📷 ${placeholder || config.placeholder}`}
            description={
              config.aspectRatio !== "free"
                ? `Proporção recomendada: ${config.aspectRatio}`
                : undefined
            }
          />
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {uploadError}
        </p>
      )}

      {/* Success message */}
      {uploadSuccess && !uploadError && (
        <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
          Imagem enviada com sucesso!
        </p>
      )}

      {/* Aspect ratio hint */}
      {config.aspectRatio !== "free" && showUploader && (
        <p className="text-xs text-secondary">
          💡 Para melhor resultado, use uma imagem com proporção{" "}
          {config.aspectRatio}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
