"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Grid,
  List,
  Download,
  Trash2,
  ExternalLink,
  Search,
  Filter,
} from "lucide-react";
import {
  formatFileSize,
  getFileTypeIcon,
  isImageFile,
} from "@/app/lib/fileUtils";
import useFileUpload from "@/app/hooks/useFileUpload";
import { getApiUrl } from "@/app/lib/apiUrl";

const API_URL = getApiUrl();

/**
 * File gallery component for viewing uploaded files
 * Supports different entity types and containers
 */
const FileGallery = ({
  // Entity configuration
  entityType = "user", // "user", "post", "game", "team"
  entityId,
  userType, // Required for user entities

  // Container type
  containerType = "all", // "avatars", "imagens", "documentos", "temp", "all"

  // UI Configuration
  viewMode: initialViewMode = "grid", // "grid", "list"
  showSearch = true,
  showFilter = true,
  showActions = true,
  maxItems = 50,

  // Callbacks
  onFileSelect,
  onFileDelete,

  // Component state
  className = "",
  disabled = false,
}) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContainer, setSelectedContainer] = useState(containerType);

  const { deleteFile } = useFileUpload();

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  };

  // Fetch files from API
  const fetchFiles = async () => {
    if (!entityId) return;

    setLoading(true);
    setError(null);

    try {
      let endpoint;

      // Build endpoint based on entity type
      switch (entityType) {
        case "user":
          if (selectedContainer === "all") {
            // Fetch both avatars and banners
            const [avatarsRes, bannersRes] = await Promise.all([
              fetch(
                `${API_URL}/files/users/${entityId}/avatars?userType=${userType}`,
                {
                  headers: { Authorization: `Bearer ${getAuthToken()}` },
                }
              ),
              fetch(
                `${API_URL}/files/users/${entityId}/banners?userType=${userType}`,
                {
                  headers: { Authorization: `Bearer ${getAuthToken()}` },
                }
              ),
            ]);

            const avatarsData = await avatarsRes.json();
            const bannersData = await bannersRes.json();

            const allFiles = [
              ...(avatarsData.avatars || []).map((url) => ({
                url,
                type: "avatar",
                name: `Avatar ${new Date().toLocaleDateString()}`,
                size: "N/A",
              })),
              ...(bannersData.banners || []).map((url) => ({
                url,
                type: "banner",
                name: `Banner ${new Date().toLocaleDateString()}`,
                size: "N/A",
              })),
            ];

            setFiles(allFiles);
            return;
          }

          if (selectedContainer === "avatars") {
            endpoint = `/files/users/${entityId}/avatars?userType=${userType}`;
          } else if (selectedContainer === "banners") {
            endpoint = `/files/users/${entityId}/banners?userType=${userType}`;
          }
          break;

        case "post":
          endpoint = `/files/posts/${entityId}/images`;
          break;

        case "game":
          endpoint = `/files/games/${entityId}/images`;
          break;

        case "team":
          endpoint = `/files/teams/${entityId}/logos`;
          break;

        default:
          throw new Error(`Tipo de entidade não suportado: ${entityType}`);
      }

      if (!endpoint) return;

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar arquivos");
      }

      const data = await response.json();

      // Process response based on endpoint
      let fileList = [];
      if (data.avatars) {
        fileList = data.avatars.map((url) => ({
          url,
          type: "avatar",
          name: `Avatar ${new Date().toLocaleDateString()}`,
          size: "N/A",
        }));
      } else if (data.banners) {
        fileList = data.banners.map((url) => ({
          url,
          type: "banner",
          name: `Banner ${new Date().toLocaleDateString()}`,
          size: "N/A",
        }));
      } else if (data.images) {
        fileList = data.images.map((url, index) => ({
          url,
          type: "image",
          name: `Imagem ${index + 1}`,
          size: "N/A",
        }));
      } else if (data.logos) {
        fileList = data.logos.map((url) => ({
          url,
          type: "logo",
          name: `Logo ${new Date().toLocaleDateString()}`,
          size: "N/A",
        }));
      }

      setFiles(fileList.slice(0, maxItems));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [entityId, entityType, userType, selectedContainer]);

  // Filter files based on search term
  const filteredFiles = files.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle file deletion
  const handleDeleteFile = async (file) => {
    if (!showActions || disabled) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir "${file.name}"?`
    );
    if (!confirmed) return;

    try {
      await deleteFile(file.url);
      setFiles((prev) => prev.filter((f) => f.url !== file.url));

      if (onFileDelete) {
        onFileDelete(file);
      }
    } catch (error) {
      alert(`Erro ao deletar arquivo: ${error.message}`);
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
        <p className="text-sm text-secondary mt-2">Carregando arquivos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchFiles}
          className="mt-2 text-accent hover:underline text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-primary">
            Arquivos ({filteredFiles.length})
          </h3>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-default overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-accent text-white"
                  : "bg-surface text-secondary hover:text-primary"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-accent text-white"
                  : "bg-surface text-secondary hover:text-primary"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="text"
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-default rounded-lg bg-surface text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}

          {/* Container Filter */}
          {showFilter && entityType === "user" && (
            <select
              value={selectedContainer}
              onChange={(e) => setSelectedContainer(e.target.value)}
              className="px-3 py-2 border border-default rounded-lg bg-surface text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">Todos</option>
              <option value="avatars">Avatares</option>
              <option value="banners">Banners</option>
            </select>
          )}
        </div>
      </div>

      {/* File Grid/List */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface-muted rounded-full flex items-center justify-center">
            <Filter className="w-8 h-8 text-secondary" />
          </div>
          <p className="text-secondary">
            {searchTerm
              ? "Nenhum arquivo encontrado para sua busca"
              : "Nenhum arquivo encontrado"}
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
              : "space-y-2"
          }
        >
          {filteredFiles.map((file, index) => (
            <FileItem
              key={`${file.url}-${index}`}
              file={file}
              viewMode={viewMode}
              onSelect={() => handleFileSelect(file)}
              onDelete={() => handleDeleteFile(file)}
              showActions={showActions}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Individual file item component
const FileItem = ({
  file,
  viewMode,
  onSelect,
  onDelete,
  showActions,
  disabled,
}) => {
  const isImage = isImageFile({ type: file.type || "image/jpeg" });

  if (viewMode === "grid") {
    return (
      <div className="group relative bg-surface border border-default rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        {/* File Preview */}
        <div className="aspect-square bg-surface-muted">
          {isImage || file.url ? (
            <Image
              src={file.url}
              alt={file.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-secondary">
                {getFileTypeIcon(file.type || "file")}
              </div>
            </div>
          )}
        </div>

        {/* Overlay Actions */}
        {showActions && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <button
              onClick={onSelect}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              disabled={disabled}
            >
              <ExternalLink className="w-4 h-4 text-white" />
            </button>

            <a
              href={file.url}
              download
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <Download className="w-4 h-4 text-white" />
            </a>

            <button
              onClick={onDelete}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              disabled={disabled}
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* File Info */}
        <div className="p-2">
          <p className="text-xs font-medium text-primary truncate">
            {file.name}
          </p>
          <p className="text-xs text-secondary">{file.type}</p>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="flex items-center space-x-4 p-3 bg-surface border border-default rounded-lg hover:bg-surface-muted transition-colors">
      {/* File Icon/Thumbnail */}
      <div className="flex-shrink-0">
        {isImage || file.url ? (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
            <Image
              src={file.url}
              alt={file.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-surface-muted rounded-lg flex items-center justify-center">
            <div className="text-secondary">
              {getFileTypeIcon(file.type || "file")}
            </div>
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{file.name}</p>
        <div className="flex items-center space-x-2 text-xs text-secondary">
          <span>{file.type}</span>
          {file.size !== "N/A" && <span>• {file.size}</span>}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center space-x-2">
          <button
            onClick={onSelect}
            className="p-2 text-secondary hover:text-primary rounded transition-colors"
            disabled={disabled}
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <a
            href={file.url}
            download
            className="p-2 text-secondary hover:text-primary rounded transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>

          <button
            onClick={onDelete}
            className="p-2 text-red-500 hover:text-red-600 rounded transition-colors"
            disabled={disabled}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileGallery;
