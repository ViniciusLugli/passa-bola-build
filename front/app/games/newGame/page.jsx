"use client";

import Header from "@/app/components/Header";
import Alert from "@/app/components/Alert";
import GameForm from "./components/GameForm";
import { useNewGameForm } from "./useNewGameForm";

export default function NewGamePage() {
  const {
    formData,
    handleInputChange,
    handleSubmit,
    alert,
    loading,
    gameTypeOptions,
  } = useNewGameForm();

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
          />
        </div>
      </main>
    </div>
  );
}
