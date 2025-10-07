"use client";

import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Alert from "@/app/components/Alert";
import Modal from "@/app/components/Modal";
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

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header />
        <main className="container mx-auto p-4 mt-8 max-w-2xl">
          <div className="relative bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-gray-900 text-center mt-4">
              Carregando Jogo...
            </h1>
          </div>
        </main>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header />
        <main className="container mx-auto p-4 mt-8 max-w-2xl">
          <div className="relative bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-gray-900 text-center mt-4">
              Jogo não encontrado.
            </h1>
          </div>
        </main>
      </div>
    );
  }

  if (!isGameCreator) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header />
        <main className="container mx-auto p-4 mt-8 max-w-2xl">
          <div className="relative bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-gray-900 text-center mt-4">
              Acesso Negado
            </h1>
            <p className="text-center text-gray-600">
              Você não tem permissão para editar este jogo.
            </p>
          </div>
        </main>
      </div>
    );
  }

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
            Editar Jogo
          </h1>

          {alert && <Alert type={alert.type} message={alert.message} />}

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
        <p className="text-gray-700 mb-4">
          Tem certeza que deseja excluir este jogo? Esta ação não pode ser
          desfeita.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
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
