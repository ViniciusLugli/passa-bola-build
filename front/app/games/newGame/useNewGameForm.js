"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { getGameTypeLabel } from "@/app/lib/gameUtils";

export const useNewGameForm = () => {
  const router = useRouter();
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
    minPlayers: 10,
    maxPlayers: 22,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHostParticipationModal, setShowHostParticipationModal] =
    useState(false);
  const [createdGameId, setCreatedGameId] = useState(null);
  const [createdGame, setCreatedGame] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const { user } = useAuth();

  // Buscar equipes quando o tipo de jogo for CUP
  useEffect(() => {
    if (formData.gameType === "CUP") {
      fetchTeams();
    }
  }, [formData.gameType]);

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await api.teams.getAll({ page: 0, size: 1000 });
      const allTeams = response.content || response.teams || response || [];
      setTeams(Array.isArray(allTeams) ? allTeams : []);
    } catch (err) {
      console.error("Erro ao buscar equipes:", err);
      setAlert({
        type: "error",
        message: "Erro ao carregar as equipes disponíveis.",
      });
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    if (!user) {
      setAlert({ type: "error", message: "Usuário não autenticado." });
      setLoading(false);
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

    let gamePayload = {};
    let apiCall;

    switch (gameType) {
      case "FRIENDLY":
        if (user.userType.toLowerCase() !== "player") {
          setAlert({
            type: "error",
            message: "Apenas jogadores podem criar jogos amistosos.",
          });
          setLoading(false);
          return;
        }
        gamePayload = {
          gameName,
          venue,
          gameDate: fullGameDate,
          description,
          hasSpectators,
          minPlayers: parseInt(minPlayers),
          maxPlayers: parseInt(maxPlayers),
        };
        apiCall = api.games.createFriendly;
        break;
      case "CHAMPIONSHIP":
        if (user.userType.toLowerCase() !== "player") {
          setAlert({
            type: "error",
            message: "Apenas jogadores podem criar jogos de campeonato.",
          });
          setLoading(false);
          return;
        }
        gamePayload = {
          gameName,
          venue,
          gameDate: fullGameDate,
          description,
          hasSpectators,
          minPlayers: parseInt(minPlayers),
          maxPlayers: parseInt(maxPlayers),
        };
        apiCall = api.games.createChampionship;
        break;
      case "CUP":
        if (user.userType.toLowerCase() !== "organization") {
          setAlert({
            type: "error",
            message: "Apenas organizações podem criar jogos de copa.",
          });
          setLoading(false);
          return;
        }
        gamePayload = {
          homeTeamId: parseInt(homeTeamId),
          awayTeamId: parseInt(awayTeamId),
          gameDate: fullGameDate,
          venue,
          championship,
          round,
        };
        apiCall = api.games.createCup;
        break;
      default:
        setAlert({
          type: "error",
          message: "Selecione um tipo de jogo válido.",
        });
        setLoading(false);
        return;
    }

    try {
      const gameResponse = await apiCall(gamePayload);
      setAlert({ type: "success", message: "Jogo publicado com sucesso!" });

      if (gameType === "FRIENDLY" || gameType === "CHAMPIONSHIP") {
        setCreatedGameId(gameResponse.id);
        setCreatedGame(gameResponse);
        setShowHostParticipationModal(true);
      } else {
        router.push("/games");
      }
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Erro ao publicar o jogo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHostParticipationResponse = (wantsToParticipate) => {
    setShowHostParticipationModal(false);
    if (!wantsToParticipate) {
      router.push("/games");
    }
    // Se wantsToParticipate === true, o modal padrão será aberto na página
  };

  const gameTypeOptions = [
    { label: getGameTypeLabel("FRIENDLY"), value: "FRIENDLY" },
    { label: getGameTypeLabel("CHAMPIONSHIP"), value: "CHAMPIONSHIP" },
    { label: getGameTypeLabel("CUP"), value: "CUP" },
  ];

  return {
    formData,
    handleInputChange,
    handleSubmit,
    alert,
    loading,
    gameTypeOptions,
    showHostParticipationModal,
    setShowHostParticipationModal,
    handleHostParticipationResponse,
    createdGameId,
    createdGame,
    teams,
    loadingTeams,
  };
};
