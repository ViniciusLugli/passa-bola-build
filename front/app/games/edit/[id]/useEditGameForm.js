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
  });

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    if (!user || !gameData || user.userId !== gameData.hostId) {
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
        break;
      case "CHAMPIONSHIP":
        apiCall = api.games.updateChampionship;
        specificPayload.gameName = gameName;
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

  const isGameCreator = user && gameData && user.userId === gameData.hostId;

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
  };
};
