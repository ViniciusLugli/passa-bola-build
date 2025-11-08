"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  File,
} from "lucide-react";

/**
 * Universal file upload component with drag & drop support
 * Features: Preview, progress, validation, multiple files
 */
const FileUpload = ({
  // Configuration
  accept = "image/*", // File types to accept
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1, // Maximum number of files
  showPreview = true, // Show file preview
  showProgress = true, // Show upload progress
  className = "",

  // Upload handler - must be provided
  onUpload, // Function that handles the upload

  // Callbacks
  onFilesSelected,
  onFilesRemoved,
  onError,

  // UI customization
  label = "Clique ou arraste arquivos aqui",
  description,
  disabled = false,

  // Current state
  isUploading = false,
  uploadProgress = 0,
  uploadedFiles = [],
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // File type detection
  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) return ImageIcon;
    if (file.type.startsWith("video/")) return Video;
    if (file.type.startsWith("text/") || file.type.includes("document"))
      return FileText;
    return File;
  };

  // File size formatter
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Validate file
  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      throw new Error(
        `Arquivo "${file.name}" é muito grande. Máximo: ${maxSizeMB}MB`
      );
    }

    // Check file type if specified
    if (accept && accept !== "*") {
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return (
          file.type === type ||
          file.name.toLowerCase().endsWith(type.replace(".", ""))
        );
      });

      if (!isAccepted) {
        throw new Error(
          `Tipo de arquivo "${file.name}" não é suportado. Tipos aceitos: ${accept}`
        );
      }
    }

    return true;
  };

  // Create file preview
  const createPreview = useCallback(
    (file) => {
      if (!showPreview) return null;

      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        return { type: "image", url, cleanup: () => URL.revokeObjectURL(url) };
      }

      return { type: "file", icon: getFileIcon(file) };
    },
    [showPreview]
  );

  // Handle file selection
  const handleFileSelection = useCallback(
    (files) => {
      try {
        const fileArray = Array.from(files);

        // Check max files limit
        if (selectedFiles.length + fileArray.length > maxFiles) {
          throw new Error(`Máximo de ${maxFiles} arquivo(s) permitido(s)`);
        }

        // Validate each file
        const validatedFiles = [];
        const newPreviews = [];

        for (const file of fileArray) {
          validateFile(file);
          validatedFiles.push(file);

          const preview = createPreview(file);
          if (preview) {
            newPreviews.push({ file, ...preview });
          }
        }

        // Update state
        const updatedFiles = [...selectedFiles, ...validatedFiles];
        const updatedPreviews = [...previews, ...newPreviews];

        setSelectedFiles(updatedFiles);
        setPreviews(updatedPreviews);

        // Callback
        if (onFilesSelected) {
          onFilesSelected(validatedFiles, updatedFiles);
        }
      } catch (error) {
        if (onError) {
          onError(error);
        } else {
          console.error("File selection error:", error.message);
        }
      }
    },
    [selectedFiles, maxFiles, createPreview, onFilesSelected, onError, previews]
  );

  // Remove file
  const removeFile = useCallback(
    (indexToRemove) => {
      const updatedFiles = selectedFiles.filter(
        (_, index) => index !== indexToRemove
      );
      const updatedPreviews = previews.filter(
        (_, index) => index !== indexToRemove
      );

      // Cleanup preview URL
      const previewToRemove = previews[indexToRemove];
      if (previewToRemove?.cleanup) {
        previewToRemove.cleanup();
      }

      setSelectedFiles(updatedFiles);
      setPreviews(updatedPreviews);

      if (onFilesRemoved) {
        onFilesRemoved(selectedFiles[indexToRemove], updatedFiles);
      }
    },
    [selectedFiles, previews, onFilesRemoved]
  );

  // Handle file input change
  const handleInputChange = (e) => {
    if (e.target.files?.length > 0) {
      handleFileSelection(e.target.files);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || isUploading || !e.dataTransfer.files) return;

    handleFileSelection(e.dataTransfer.files);
  };

  // Handle upload button click
  const handleUpload = async () => {
    if (!onUpload || selectedFiles.length === 0) return;

    try {
      await onUpload(selectedFiles);
      // Clear files after successful upload
      setSelectedFiles([]);
      setPreviews((prev) => {
        prev.forEach((p) => p.cleanup?.());
        return [];
      });
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
          ${
            isDragOver
              ? "border-accent bg-accent/10 scale-[1.02]"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
          ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() =>
          !disabled && !isUploading && fileInputRef.current?.click()
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="flex flex-col items-center space-y-2">
          <Upload
            className={`w-8 h-8 ${
              isDragOver ? "text-accent" : "text-gray-400"
            }`}
          />

          <div>
            <div className="text-sm font-medium text-primary">{label}</div>
            {description && (
              <p className="text-xs text-secondary mt-1">{description}</p>
            )}
            <p className="text-xs text-secondary mt-1">
              Máximo: {formatFileSize(maxSize)} •{" "}
              {maxFiles > 1 ? `Até ${maxFiles} arquivos` : "1 arquivo"}
            </p>
          </div>
        </div>

        {isUploading && showProgress && (
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm font-medium">
                Enviando... {uploadProgress}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-primary">
            Arquivos Selecionados ({selectedFiles.length})
          </h4>

          <div className="grid gap-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => {
              const preview = previews[index];
              const FileIcon = preview?.icon || FileText;

              return (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center space-x-3 p-3 bg-surface border border-default rounded-lg"
                >
                  {/* File Preview */}
                  <div className="flex-shrink-0">
                    {preview?.type === "image" ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                        <Image
                          src={preview.url}
                          alt={file.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-surface-muted rounded-lg flex items-center justify-center">
                        <FileIcon className="w-6 h-6 text-secondary" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-secondary">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Upload Button */}
          {onUpload && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
              className="w-full bg-accent text-white py-2 px-4 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading
                ? `Enviando... ${uploadProgress}%`
                : `Enviar ${selectedFiles.length} arquivo(s)`}
            </button>
          )}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-green-600">
            Arquivos Enviados ({uploadedFiles.length})
          </h4>

          <div className="grid gap-2">
            {uploadedFiles.map((uploadedFile, index) => (
              <div
                key={`uploaded-${index}`}
                className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    {uploadedFile.fileName || `Arquivo ${index + 1}`}
                  </p>
                  {uploadedFile.url && (
                    <a
                      href={uploadedFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:underline"
                    >
                      Ver arquivo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
