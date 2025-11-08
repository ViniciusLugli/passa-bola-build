/**
 * File validation utilities for upload components
 */

// File size limits by type (in bytes)
export const FILE_SIZE_LIMITS = {
  AVATAR: 5 * 1024 * 1024, // 5MB
  BANNER: 10 * 1024 * 1024, // 10MB
  POST_IMAGE: 10 * 1024 * 1024, // 10MB
  GAME_IMAGE: 10 * 1024 * 1024, // 10MB
  TEAM_LOGO: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 50 * 1024 * 1024, // 50MB
  TEMP_FILE: 20 * 1024 * 1024, // 20MB
};

// Accepted file types
export const ACCEPTED_FILE_TYPES = {
  IMAGES: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  DOCUMENTS: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  VIDEOS: ["video/mp4", "video/avi", "video/mov", "video/wmv"],
  ALL: [], // Empty array means accept all types
};

// Aspect ratios for different upload types
export const ASPECT_RATIOS = {
  SQUARE: "1:1",
  BANNER: "16:9",
  PORTRAIT: "3:4",
  LANDSCAPE: "4:3",
  FREE: "free",
};

/**
 * Format bytes to human readable string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

/**
 * Get file type icon name based on MIME type
 */
export const getFileTypeIcon = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "document";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return "spreadsheet";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
    return "presentation";
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("7z")
  )
    return "archive";
  return "file";
};

/**
 * Validate file size
 */
export const validateFileSize = (file, maxSize) => {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `Arquivo "${file.name}" é muito grande. Máximo: ${maxSizeMB}MB. Atual: ${fileSizeMB}MB`
    );
  }
  return true;
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedTypes) => {
  if (!allowedTypes || allowedTypes.length === 0) return true;

  const isAccepted = allowedTypes.some((type) => {
    // Handle wildcard types (e.g., "image/*")
    if (type.endsWith("/*")) {
      return file.type.startsWith(type.slice(0, -1));
    }
    // Handle file extensions (e.g., ".pdf")
    if (type.startsWith(".")) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    // Handle exact MIME types
    return file.type === type;
  });

  if (!isAccepted) {
    const typeNames = allowedTypes
      .map((type) => {
        if (type.endsWith("/*")) return type.split("/")[0].toUpperCase();
        if (type.startsWith(".")) return type.toUpperCase();
        return type.split("/")[1]?.toUpperCase() || type;
      })
      .join(", ");

    throw new Error(
      `Tipo de arquivo "${file.name}" não é suportado. Tipos aceitos: ${typeNames}`
    );
  }

  return true;
};

/**
 * Validate image dimensions
 */
export const validateImageDimensions = (
  file,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight
) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        if (minWidth && img.width < minWidth) {
          throw new Error(
            `Largura mínima: ${minWidth}px. Atual: ${img.width}px`
          );
        }
        if (minHeight && img.height < minHeight) {
          throw new Error(
            `Altura mínima: ${minHeight}px. Atual: ${img.height}px`
          );
        }
        if (maxWidth && img.width > maxWidth) {
          throw new Error(
            `Largura máxima: ${maxWidth}px. Atual: ${img.width}px`
          );
        }
        if (maxHeight && img.height > maxHeight) {
          throw new Error(
            `Altura máxima: ${maxHeight}px. Atual: ${img.height}px`
          );
        }
        resolve(true);
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(img.src);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Não foi possível carregar a imagem"));
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate aspect ratio
 */
export const validateAspectRatio = (file, expectedRatio, tolerance = 0.1) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/") || expectedRatio === "free") {
      resolve(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        const actualRatio = img.width / img.height;

        // Parse expected ratio (e.g., "16:9" -> 1.777...)
        let targetRatio;
        if (expectedRatio.includes(":")) {
          const [w, h] = expectedRatio.split(":").map(Number);
          targetRatio = w / h;
        } else {
          targetRatio = parseFloat(expectedRatio);
        }

        const diff = Math.abs(actualRatio - targetRatio);
        const toleranceValue = targetRatio * tolerance;

        if (diff > toleranceValue) {
          throw new Error(
            `Proporção da imagem deve ser aproximadamente ${expectedRatio}. ` +
              `Atual: ${actualRatio.toFixed(2)}:1`
          );
        }

        resolve(true);
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(img.src);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Não foi possível carregar a imagem"));
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Comprehensive file validation
 */
export const validateFile = async (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ACCEPTED_FILE_TYPES.IMAGES,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    aspectRatio,
    aspectRatioTolerance = 0.1,
  } = options;

  try {
    // Basic validations
    if (!file) {
      throw new Error("Nenhum arquivo selecionado");
    }

    validateFileSize(file, maxSize);
    validateFileType(file, allowedTypes);

    // Image-specific validations
    if (file.type.startsWith("image/")) {
      if (minWidth || minHeight || maxWidth || maxHeight) {
        await validateImageDimensions(
          file,
          minWidth,
          minHeight,
          maxWidth,
          maxHeight
        );
      }

      if (aspectRatio && aspectRatio !== "free") {
        await validateAspectRatio(file, aspectRatio, aspectRatioTolerance);
      }
    }

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Get validation config for upload types
 */
export const getValidationConfig = (uploadType) => {
  const configs = {
    avatar: {
      maxSize: FILE_SIZE_LIMITS.AVATAR,
      allowedTypes: ACCEPTED_FILE_TYPES.IMAGES,
      aspectRatio: ASPECT_RATIOS.SQUARE,
      minWidth: 100,
      minHeight: 100,
    },
    banner: {
      maxSize: FILE_SIZE_LIMITS.BANNER,
      allowedTypes: ACCEPTED_FILE_TYPES.IMAGES,
      aspectRatio: ASPECT_RATIOS.BANNER,
      minWidth: 800,
      minHeight: 450,
    },
    "team-logo": {
      maxSize: FILE_SIZE_LIMITS.TEAM_LOGO,
      allowedTypes: ACCEPTED_FILE_TYPES.IMAGES,
      aspectRatio: ASPECT_RATIOS.SQUARE,
      minWidth: 100,
      minHeight: 100,
    },
    "post-image": {
      maxSize: FILE_SIZE_LIMITS.POST_IMAGE,
      allowedTypes: ACCEPTED_FILE_TYPES.IMAGES,
      aspectRatio: ASPECT_RATIOS.FREE,
    },
    "game-image": {
      maxSize: FILE_SIZE_LIMITS.GAME_IMAGE,
      allowedTypes: ACCEPTED_FILE_TYPES.IMAGES,
      aspectRatio: ASPECT_RATIOS.BANNER,
    },
    document: {
      maxSize: FILE_SIZE_LIMITS.DOCUMENT,
      allowedTypes: ACCEPTED_FILE_TYPES.DOCUMENTS,
    },
    temp: {
      maxSize: FILE_SIZE_LIMITS.TEMP_FILE,
      allowedTypes: ACCEPTED_FILE_TYPES.ALL,
    },
  };

  return (
    configs[uploadType] || {
      maxSize: FILE_SIZE_LIMITS.TEMP_FILE,
      allowedTypes: ACCEPTED_FILE_TYPES.ALL,
    }
  );
};

/**
 * Create image preview URL
 */
export const createImagePreview = (file) => {
  if (!file.type.startsWith("image/")) return null;
  return URL.createObjectURL(file);
};

/**
 * Cleanup preview URL
 */
export const cleanupPreviewUrl = (url) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Check if file is an image
 */
export const isImageFile = (file) => {
  return file.type.startsWith("image/");
};

/**
 * Check if file is a video
 */
export const isVideoFile = (file) => {
  return file.type.startsWith("video/");
};

/**
 * Check if file is a document
 */
export const isDocumentFile = (file) => {
  return (
    ACCEPTED_FILE_TYPES.DOCUMENTS.includes(file.type) ||
    file.type.startsWith("application/") ||
    file.type.startsWith("text/")
  );
};

/**
 * Ensures URL is absolute:
 * - If url is protocol-relative (//...) prefixes with https:
 * - If url is root-relative (/files/...), prefix with API base (NEXT_PUBLIC_API_URL without /api)
 */
export const normalizeRemoteUrl = (url) => {
  if (!url) return url;
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("//")) return `https:${url}`;

    // If it's a relative path, prefix with API base (without /api)
    const apiBase = (
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    ).replace(/\/api\/?$/, "");
    if (url.startsWith("/")) return `${apiBase}${url}`;

    // Fallback: return as-is
    return url;
  } catch (e) {
    return url;
  }
};

const fileUtils = {
  FILE_SIZE_LIMITS,
  ACCEPTED_FILE_TYPES,
  ASPECT_RATIOS,
  formatFileSize,
  getFileExtension,
  getFileTypeIcon,
  validateFile,
  validateFileSize,
  validateFileType,
  validateImageDimensions,
  validateAspectRatio,
  getValidationConfig,
  createImagePreview,
  cleanupPreviewUrl,
  isImageFile,
  isVideoFile,
  isDocumentFile,
};

export default fileUtils;
