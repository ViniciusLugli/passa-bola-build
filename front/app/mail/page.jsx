"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Alert from "@/app/components/Alert";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/api";
import TeamInviteList from "@/app/components/TeamInviteList";

export default function MailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameInvites, setGameInvites] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push("/login"); // Redirecionar se não estiver autenticado
      return;
    }

    const fetchInvites = async () => {
      setLoading(true);
      try {
        // Buscar convites de jogos (se o usuário for uma ORGANIZATION)
        if (user.userType === "ORGANIZATION") {
          const gameInvitesResponse = await api.gameInvites.getPending();
          setGameInvites(gameInvitesResponse.content || []);
        }
      } catch (err) {
        console.error("Erro ao buscar avisos:", err);
        setAlert({
          type: "error",
          message: err.message || "Erro ao carregar avisos.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvites();
  }, [user, router]);

  const handleAcceptGameInvite = async (inviteId) => {
    setLoading(true);
    try {
      await api.gameInvites.accept(inviteId);
      setAlert({ type: "success", message: "Convite de jogo aceito!" });
      // Atualizar a lista de convites
      setGameInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
    } catch (err) {
      console.error("Erro ao aceitar convite de jogo:", err);
      setAlert({
        type: "error",
        message: err.message || "Erro ao aceitar convite de jogo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectGameInvite = async (inviteId) => {
    setLoading(true);
    try {
      await api.gameInvites.reject(inviteId);
      setAlert({ type: "success", message: "Convite de jogo rejeitado!" });
      // Atualizar a lista de convites
      setGameInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
    } catch (err) {
      console.error("Erro ao rejeitar convite de jogo:", err);
      setAlert({
        type: "error",
        message: err.message || "Erro ao rejeitar convite de jogo.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header />
        <main className="container mx-auto p-4 mt-8 max-w-2xl">
          <div className="relative bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-gray-900 text-center mt-4">
              Avisos
            </h1>
            <p className="text-center text-gray-600">Carregando avisos...</p>
          </div>
        </main>
      </div>
    );
  }

  const hasInvites = gameInvites.length > 0;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <main className="container mx-auto p-4 mt-8 max-w-2xl">
        <div className="relative bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
          <button
            onClick={() => router.back()}
            className="absolute top-8 right-8 text-gray-500 hover:text-gray-800 transition-colors duration-200"
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

          <h1 className="text-4xl font-bold text-gray-900 text-center mt-4">
            Avisos
          </h1>

          {alert && <Alert type={alert.type} message={alert.message} />}

          {!hasInvites && (
            <p className="text-center text-gray-600">
              Você não tem novos avisos.
            </p>
          )}

          {user?.userType === "PLAYER" && <TeamInviteList />}

          {gameInvites.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Convites de Jogos
              </h2>
              {gameInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-gray-50 p-4 rounded-lg shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      Você foi convidado para o jogo{" "}
                      <span className="font-bold">{invite.gameName}</span> (
                      {invite.teamPosition === "HOME"
                        ? "Time da Casa"
                        : "Time Visitante"}
                      ) por{" "}
                      <span className="font-bold">
                        {invite.organizationName}
                      </span>
                      .
                    </p>
                    <p className="text-sm text-gray-500">
                      Mensagem: {invite.message}
                    </p>
                    <p className="text-sm text-gray-500">
                      Data do Jogo:{" "}
                      {new Date(invite.gameDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptGameInvite(invite.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleRejectGameInvite(invite.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
