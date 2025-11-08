"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/app/context/ToastContext";
import { useAuth } from "@/app/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Helper to get current auth token
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

/**
 * Custom hook for handling file uploads to Azure Blob Storage
 * Supports all upload types documented in the API
 */
export const useFileUpload = () => {
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    progress: 0,
    error: null,
    success: false,
    uploadedFileUrl: null,
  });

  const { showToast } = useToast();
  const { updateUserProfile } = useAuth();

  const resetState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      success: false,
      uploadedFileUrl: null,
    });
  }, []);

  const validateFile = useCallback((file, options = {}) => {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ],
    } = options;

    if (!file) {
      throw new Error("Nenhum arquivo selecionado");
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(
        `Arquivo muito grande. Máximo: ${maxSizeMB}MB. Atual: ${fileSizeMB}MB`
      );
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      const allowedTypesStr = allowedTypes
        .map((t) => t.split("/")[1].toUpperCase())
        .join(", ");
      throw new Error(`Tipo de arquivo inválido. Use: ${allowedTypesStr}`);
    }

    return true;
  }, []);

  /**
   * Upload avatar for users (PLAYER, ORGANIZATION, SPECTATOR)
   */
  const uploadAvatar = useCallback(
    async (userId, userType, file) => {
      try {
        validateFile(file, {
          maxSize: 5 * 1024 * 1024, // 5MB for avatars
          allowedTypes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
          ],
        });

        setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `${API_URL}/files/users/${userId}/avatar?userType=${userType}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Avatar upload failed:", {
            status: response.status,
            statusText: response.statusText,
            errorData,
            url: `${API_URL}/files/users/${userId}/avatar?userType=${userType}`,
          });
          throw new Error(errorData.error || "Falha no upload do avatar");
        }

        const result = await response.json();

        console.log("Avatar upload result:", result);

        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          success: true,
          uploadedFileUrl: result.url,
        }));

        showToast(
          result.message || "Avatar atualizado com sucesso!",
          "success"
        );

        // Update user profile in AuthContext
        if (updateUserProfile) {
          try {
            console.log("Updating profile with URL:", result.url);
            await updateUserProfile({ profilePhotoUrl: result.url });
          } catch (error) {
            console.warn("Failed to update profile in context:", error);
          }
        }

        return result;
      } catch (error) {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: error.message,
        }));
        showToast(error.message, "error");
        throw error;
      }
    },
    [validateFile, showToast, updateUserProfile]
  );

  /**
   * Upload banner for users
   */
  const uploadBanner = useCallback(
    async (userId, userType, file) => {
      try {
        validateFile(file, {
          maxSize: 10 * 1024 * 1024, // 10MB for banners
          allowedTypes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
          ],
        });

        setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `${API_URL}/files/users/${userId}/banner?userType=${userType}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Falha no upload do banner");
        }

        const result = await response.json();

        console.log("Banner upload result:", result);

        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          success: true,
          uploadedFileUrl: result.url,
        }));

        showToast(
          result.message || "Banner atualizado com sucesso!",
          "success"
        );

        // Update user profile in AuthContext
        if (updateUserProfile) {
          try {
            console.log("Updating profile with banner URL:", result.url);
            await updateUserProfile({ bannerUrl: result.url });
          } catch (error) {
            console.warn("Failed to update profile in context:", error);
          }
        }

        return result;
      } catch (error) {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: error.message,
        }));
        showToast(error.message, "error");
        throw error;
      }
    },
    [validateFile, showToast, updateUserProfile]
  );

  /**
   * Upload image for posts
   */
  const uploadPostImage = useCallback(
    async (postId, file) => {
      try {
        validateFile(file, {
          maxSize: 10 * 1024 * 1024, // 10MB for post images
          allowedTypes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
          ],
        });

        setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/files/posts/${postId}/image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Post image upload failed:", {
            status: response.status,
            statusText: response.statusText,
            errorData,
            url: `${API_URL}/files/posts/${postId}/image`,
          });
          throw new Error(
            errorData.error || "Falha no upload da imagem do post"
          );
        }

        const result = await response.json();

        console.log("Post image upload result:", result);

        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          success: true,
          uploadedFileUrl: result.url,
        }));

        showToast(
          result.message || "Imagem do post enviada com sucesso!",
          "success"
        );
        return result;
      } catch (error) {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: error.message,
        }));
        showToast(error.message, "error");
        throw error;
      }
    },
    [validateFile, showToast]
  );

  /**
   * Upload image for games
   */
  const uploadGameImage = useCallback(
    async (gameId, file) => {
      try {
        validateFile(file, {
          maxSize: 10 * 1024 * 1024, // 10MB for game images
          allowedTypes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
          ],
        });

        setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/files/games/${gameId}/image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Falha no upload da imagem do jogo"
          );
        }

        const result = await response.json();

        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          success: true,
          uploadedFileUrl: result.url,
        }));

        showToast(
          result.message || "Imagem do jogo enviada com sucesso!",
          "success"
        );
        return result;
      } catch (error) {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: error.message,
        }));
        showToast(error.message, "error");
        throw error;
      }
    },
    [validateFile, showToast]
  );

  /**
   * Upload logo for teams
   */
  const uploadTeamLogo = useCallback(
    async (teamId, file) => {
      try {
        validateFile(file, {
          maxSize: 5 * 1024 * 1024, // 5MB for team logos
          allowedTypes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
          ],
        });

        setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/files/teams/${teamId}/logo`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Falha no upload do logo do time");
        }

        const result = await response.json();

        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          success: true,
          uploadedFileUrl: result.url,
        }));

        showToast(
          result.message || "Logo do time enviado com sucesso!",
          "success"
        );
        return result;
      } catch (error) {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: error.message,
        }));
        showToast(error.message, "error");
        throw error;
      }
    },
    [validateFile, showToast]
  );

  /**
   * Upload document to private container
   */
  const uploadDocument = useCallback(
    async (file, category = "geral") => {
      try {
        validateFile(file, {
          maxSize: 50 * 1024 * 1024, // 50MB for documents
          allowedTypes: [], // Any file type for documents
        });

        setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `${API_URL}/files/documents?category=${encodeURIComponent(category)}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Falha no upload do documento");
        }

        const result = await response.json();

        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          success: true,
          uploadedFileUrl: result.url,
        }));

        showToast(
          result.message || "Documento enviado com sucesso!",
          "success"
        );
        return result;
      } catch (error) {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: error.message,
        }));
        showToast(error.message, "error");
        throw error;
      }
    },
    [validateFile, showToast]
  );

  /**
   * Upload temporary file (expires in 7 days)
   */
  const uploadTempFile = useCallback(
    async (file) => {
      try {
        validateFile(file, {
          maxSize: 20 * 1024 * 1024, // 20MB for temp files
          allowedTypes: [], // Any file type for temp files
        });

        setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/files/temp`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Falha no upload temporário");
        }

        const result = await response.json();

        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          success: true,
          uploadedFileUrl: result.url,
        }));

        showToast(
          result.message || "Arquivo temporário criado com sucesso!",
          "success"
        );
        return result;
      } catch (error) {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: error.message,
        }));
        showToast(error.message, "error");
        throw error;
      }
    },
    [validateFile, showToast]
  );

  /**
   * Delete file from Azure Blob Storage
   */
  const deleteFile = useCallback(
    async (fileUrl) => {
      try {
        setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

        const response = await fetch(
          `${API_URL}/files/delete?url=${encodeURIComponent(fileUrl)}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Falha ao deletar arquivo");
        }

        const result = await response.json();

        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          success: true,
          uploadedFileUrl: null,
        }));

        showToast(result.message || "Arquivo deletado com sucesso!", "success");
        return result;
      } catch (error) {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: error.message,
        }));
        showToast(error.message, "error");
        throw error;
      }
    },
    [showToast]
  );

  return {
    // State
    ...uploadState,

    // Actions
    uploadAvatar,
    uploadBanner,
    uploadPostImage,
    uploadGameImage,
    uploadTeamLogo,
    uploadDocument,
    uploadTempFile,
    deleteFile,
    validateFile,
    resetState,
  };
};

export default useFileUpload;
