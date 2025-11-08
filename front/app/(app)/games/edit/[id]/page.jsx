"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import Modal from "@/app/components/ui/Modal";
import EditGameForm from "./components/EditGameForm";
import { useEditGameForm } from "./useEditGameForm";

export default function EditGamePage() {
  const { id } = useParams();

  const {
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
  } = useEditGameForm(id);

  const { showToast } = useToast();

  // show alerts via toast
  useEffect(() => {
    if (alert && alert.message) {
      showToast(alert.message, alert.type || "info");
    }
  }, [alert, showToast]);

  if (loading) {
    return (
      <div className="bg-page min-h-screen">
        <main className="container mx-auto p-4 mt-8 max-w-2xl">
          <div className="relative bg-surface border border-default rounded-2xl shadow-elevated p-8 flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-primary text-center mt-4">
              Carregando Jogo...
            </h1>
          </div>
        </main>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="bg-page min-h-screen">
        <main className="container mx-auto p-4 mt-8 max-w-2xl">
          <div className="relative bg-surface border border-default rounded-2xl shadow-elevated p-8 flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-primary text-center mt-4">
              Jogo não encontrado.
            </h1>
          </div>
        </main>
      </div>
    );
  }

  if (!isGameCreator) {
    return (
      <div className="bg-page min-h-screen">
        <main className="container mx-auto p-4 mt-8 max-w-2xl">
          <div className="relative bg-surface border border-default rounded-2xl shadow-elevated p-8 flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-primary text-center mt-4">
              Acesso Negado
            </h1>
            <p className="text-center text-secondary">
              Você não tem permissão para editar este jogo.
            </p>
          </div>
        </main>
      </div>
    );
  }

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
            Editar Jogo
          </h1>

          {/* alerts shown via toast */}

          <EditGameForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            submitting={submitting}
            gameTypeOptions={gameTypeOptions}
            handleDeleteGame={handleDeleteGame}
            setShowDeleteModal={setShowDeleteModal}
            teams={teams}
            loadingTeams={loadingTeams}
          />
        </div>
      </main>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
      >
        <p className="text-secondary mb-4">
          Tem certeza que deseja excluir este jogo? Esta ação não pode ser
          desfeita.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-surface-muted border border-default rounded-md hover:bg-surface-elevated transition-colors"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleDeleteGame}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            disabled={submitting}
          >
            {submitting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
