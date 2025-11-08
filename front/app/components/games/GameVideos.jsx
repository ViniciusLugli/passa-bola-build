"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";

export default function GameVideos({ gameId }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gameId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.games.getVideos(gameId);
        // API returns { videos: [...] } according to docs or direct array
        if (res && res.videos) setVideos(res.videos);
        else if (Array.isArray(res)) setVideos(res);
        else setVideos([]);
      } catch (err) {
        console.error("Erro ao buscar vídeos do jogo:", err);
        setError(err.message || "Falha ao carregar vídeos");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [gameId]);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent mx-auto" />
        <p className="mt-3 text-secondary">Carregando vídeos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-red-500">{error}</div>
    );
  }

  if (!videos || videos.length === 0) {
    return <div className="py-6 text-center text-secondary">Nenhum vídeo disponível para este jogo.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {videos.map((v, idx) => (
        <div key={idx} className="bg-surface border border-default rounded-lg overflow-hidden">
          <video controls className="w-full h-[220px] object-cover bg-black">
            <source src={v.url} type="video/mp4" />
            Seu navegador não suporta o elemento de vídeo.
          </video>
          <div className="p-3">
            <div className="text-sm text-primary font-semibold">{v.filename || `Vídeo ${idx + 1}`}</div>
            <div className="text-xs text-secondary mt-1">
              {v.timeDiffDescription || `${v.minutesFromGameStart ?? ""} minutos`}
            </div>
            <div className="text-xs text-tertiary mt-2">Gravado em: {v.videoTimestamp ? new Date(v.videoTimestamp).toLocaleString() : "N/A"}</div>
            <div className="text-xs text-tertiary mt-1">Tamanho: {v.size ? (v.size / 1024 / 1024).toFixed(2) + ' MB' : '—'}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
