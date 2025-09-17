"use client";

import { useState } from "react";
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
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
          hostId: user.userId,
          hostUsername: user.username,
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
          hostId: user.userId,
          hostUsername: user.username,
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
      await apiCall(gamePayload);
      setAlert({ type: "success", message: "Jogo publicado com sucesso!" });
      router.push("/games");
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Erro ao publicar o jogo.",
      });
    } finally {
      setLoading(false);
    }
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
  };
};
