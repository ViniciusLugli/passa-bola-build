"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import Modal from "@/app/components/ui/Modal";
import JoinGameModal from "@/app/components/ui/JoinGameModal";
import GameForm from "./components/GameForm";
import { useNewGameForm } from "./useNewGameForm";
import { useAuth } from "@/app/context/AuthContext";

export default function NewGamePage() {
  const router = useRouter();
  const { user: loggedInUser, isAuthenticated } = useAuth();
  const {
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
  } = useNewGameForm();

  const { showToast } = useToast();

  const [showJoinModal, setShowJoinModal] = useState(false);

  // Redirecionar SPECTATORs que acessarem a página de criação
  useEffect(() => {
    if (isAuthenticated && loggedInUser) {
      const role = String(loggedInUser.userType || "").toUpperCase();
      if (role === "SPECTATOR") {
        router.replace("/games");
      }
    }
  }, [isAuthenticated, loggedInUser]);

  // exibir alert (do useNewGameForm) via toast
  useEffect(() => {
    if (alert && alert.message) {
      showToast(alert.message, alert.type || "info");
    }
  }, [alert, showToast]);

  const handleHostWantsToJoin = () => {
    setShowHostParticipationModal(false);
    setShowJoinModal(true);
  };

  const handleJoinSuccess = () => {
    router.push("/games");
  };

  return (
    <div className="bg-page min-h-screen">
      <main
        className="
        container 
        mx-auto 
        p-4
        mt-8
        max-w-2xl
      "
      >
        <div
          className="
          relative 
          bg-surface 
          border 
          border-default 
          rounded-2xl 
          shadow-elevated 
          p-8
          flex 
          flex-col 
          gap-6
        "
        >
          <button
            onClick={() => window.history.back()}
            className="
              absolute 
              top-8
              right-8
              text-gray-500 
              hover:text-gray-800
              transition-colors 
              duration-200
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h1
            className="
            text-4xl 
            font-bold 
            text-primary 
            text-center 
            mt-4
          "
          >
            Novo Jogo
          </h1>

          <GameForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            alert={alert}
            loading={loading}
            gameTypeOptions={gameTypeOptions}
            teams={teams}
            loadingTeams={loadingTeams}
          />
        </div>
      </main>

      <Modal
        isOpen={showHostParticipationModal}
        onClose={() => setShowHostParticipationModal(false)}
        title="Participar do Jogo?"
      >
        <p className="text-secondary mb-6">
          Deseja participar do jogo que você acabou de criar?
        </p>
        <div className="flex gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleHostParticipationResponse(false);
            }}
            className="flex-1 bg-surface-muted border border-default hover:bg-surface-elevated text-secondary font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Não
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleHostWantsToJoin();
            }}
            className="flex-1 bg-accent hover:bg-accent-strong font-bold py-2 px-4 rounded-lg transition-colors shadow-elevated"
          >
            Sim
          </button>
        </div>
      </Modal>

      {createdGameId && createdGame && (
        <JoinGameModal
          isOpen={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            router.push("/games");
          }}
          gameId={createdGameId}
          game={createdGame}
          onSuccess={handleJoinSuccess}
        />
      )}
    </div>
  );
}
