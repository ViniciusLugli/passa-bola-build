"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { getGameTypeLabel } from "@/app/lib/gameUtils";

export const useEditGameForm = (gameId) => {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    gameType: "",
    gameName: "",
    venue: "",
    championship: "",
    round: "",
    gameDate: "",
    gameTime: "",
    homeTeamId: "",
    awayTeamId: "",
    description: "",
    hasSpectators: false,
    maxSpectators: "",
    minPlayers: 6,
    maxPlayers: 22,
  });

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const gameTypeOptions = [
    { label: getGameTypeLabel("FRIENDLY"), value: "FRIENDLY" },
    { label: getGameTypeLabel("CHAMPIONSHIP"), value: "CHAMPIONSHIP" },
    { label: getGameTypeLabel("CUP"), value: "CUP" },
  ];

  const fetchGame = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    try {
      const response = await api.games.getById(gameId);
      setGameData(response);
      setFormData({
        gameType: response.gameType,
        gameName: response.gameName || "",
        venue: response.venue || "",
        championship: response.championship || "",
        round: response.round || "",
        gameDate: response.gameDate ? response.gameDate.substring(0, 10) : "",
        gameTime: response.gameDate ? response.gameDate.substring(11, 16) : "",
        homeTeamId: response.homeTeamId || "",
        awayTeamId: response.awayTeamId || "",
        description: response.description || "",
        hasSpectators: response.hasSpectators || false,
        maxSpectators: response.maxSpectators || "",
        minPlayers: response.minPlayers || 6,
        maxPlayers: response.maxPlayers || 22,
      });
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Falha ao carregar os dados do jogo.",
      });
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  // Buscar equipes quando o tipo de jogo for CUP
  useEffect(() => {
    if (gameData && gameData.gameType === "CUP") {
      fetchTeams();
    }
  }, [gameData]);

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await api.teams.getAll({ page: 0, size: 1000 });
      const allTeams = response.content || response.teams || response || [];
      setTeams(Array.isArray(allTeams) ? allTeams : []);
    } catch (err) {
      console.error("Erro ao buscar equipes:", err);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);
    
    const requiredHostType =
      gameData && gameData.gameType === "CUP" ? "ORGANIZATION" : "PLAYER";

    if (
      !user ||
      !gameData ||
      String(user.id || user.playerId) !== String(gameData.hostId) ||
      String(user.userType || "").toUpperCase() !== requiredHostType
    ) {
      setAlert({
        type: "error",
        message: "Você não tem permissão para editar este jogo.",
      });
      setSubmitting(false);
      return;
    }

    const {
      gameType,
      gameName,
      venue,
      championship,
      round,
      gameDate,
      gameTime,
      homeTeamId,
      awayTeamId,
      description,
      hasSpectators,
      minPlayers,
      maxPlayers,
    } = formData;
    const fullGameDate = `${gameDate}T${gameTime}:00`;

    let gamePayload = {
      gameType,
      venue,
      gameDate: fullGameDate,
      description,
      hostId: gameData.hostId,
      hostUsername: gameData.hostUsername,
    };

    let apiCall;
    let specificPayload = {
      venue,
      gameDate: fullGameDate,
      description,
      hostId: gameData.hostId,
      hostUsername: gameData.hostUsername,
    };

    switch (gameType) {
      case "FRIENDLY":
        apiCall = api.games.updateFriendly;
        specificPayload.gameName = gameName;
        specificPayload.hasSpectators = hasSpectators;
        specificPayload.maxSpectators = hasSpectators
          ? parseInt(maxSpectators)
          : undefined;
        specificPayload.minPlayers = parseInt(minPlayers);
        specificPayload.maxPlayers = parseInt(maxPlayers);
        break;
      case "CHAMPIONSHIP":
        apiCall = api.games.updateChampionship;
        specificPayload.gameName = gameName;
        specificPayload.hasSpectators = hasSpectators;
        specificPayload.maxSpectators = hasSpectators
          ? parseInt(maxSpectators)
          : undefined;
        specificPayload.minPlayers = parseInt(minPlayers);
        specificPayload.maxPlayers = parseInt(maxPlayers);
        break;
      case "CUP":
        apiCall = api.games.updateCup;
        specificPayload.championship = championship;
        specificPayload.round = round;
        specificPayload.homeTeamId = homeTeamId ? parseInt(homeTeamId) : null;
        specificPayload.awayTeamId = awayTeamId ? parseInt(awayTeamId) : null;
        break;
      default:
        setAlert({
          type: "error",
          message: "Tipo de jogo inválido para atualização.",
        });
        setSubmitting(false);
        return;
    }

    try {
      await apiCall(gameId, specificPayload);
      setAlert({ type: "success", message: "Jogo atualizado com sucesso!" });
      router.push("/games");
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Erro ao atualizar o jogo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGame = async () => {
    setSubmitting(true);
    setAlert(null);
    try {
      await api.games.delete(gameId);
      setAlert({ type: "success", message: "Jogo excluído com sucesso!" });
      router.push("/games");
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Erro ao excluir o jogo.",
      });
    } finally {
      setSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const isGameCreator =
    user &&
    gameData &&
    String(user.id || user.playerId) === String(gameData.hostId);

  return {
    formData,
    handleInputChange,
    handleSubmit,
    handleDeleteGame,
    alert,
    loading,
    submitting,
    gameData,
    gameTypeOptions,
    isGameCreator,
    showDeleteModal,
    setShowDeleteModal,
    teams,
    loadingTeams,
  };
};
