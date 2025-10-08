"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Alert from "@/app/components/Alert";
import Toast from "@/app/components/Toast";
import Modal from "@/app/components/Modal";
import JoinGameModal from "@/app/components/JoinGameModal";
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

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Redirecionar SPECTATORs que acessarem a página de criação
  useEffect(() => {
    if (isAuthenticated && loggedInUser) {
      const role = String(loggedInUser.userType || "").toUpperCase();
      if (role === "SPECTATOR") {
        router.replace("/games");
      }
    }
  }, [isAuthenticated, loggedInUser]);

  // Mostrar toast quando houver erro
  useEffect(() => {
    if (alert && alert.type === "error") {
      setShowToast(true);
    }
  }, [alert]);

  const handleHostWantsToJoin = () => {
    setShowHostParticipationModal(false);
    setShowJoinModal(true);
  };

  const handleJoinSuccess = () => {
    router.push("/games");
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
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
          bg-white 
          rounded-2xl 
          shadow-lg 
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
            text-gray-900 
            text-center 
            mt-4
          "
          >
            Novo Jogo
          </h1>

          {alert && <Alert type={alert.type} message={alert.message} />}

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
        <p className="text-gray-700 mb-6">
          Deseja participar do jogo que você acabou de criar?
        </p>
        <div className="flex gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleHostParticipationResponse(false);
            }}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Não
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleHostWantsToJoin();
            }}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
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

      {showToast && alert && alert.type === "error" && (
        <Toast
          message={alert.message}
          type="error"
          onClose={() => setShowToast(false)}
          duration={5000}
        />
      )}
    </div>
  );
}
