"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/components/Header";
import UserListCard from "@/app/components/UserListCard";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export default function FollowingPage() {
  const {
    user: loggedInUser,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const router = useRouter();
  const { userType, id } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && id && userType) {
      fetchFollowingData();
    }
  }, [id, userType, isAuthenticated, authLoading, router, pagination.page]);

  const fetchFollowingData = async () => {
    if (!id || !userType) {
      setError("ID ou tipo de usuário não fornecido.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar informações básicas do usuário
      const lowerCaseUserType = userType.toLowerCase();
      let fetchedUser = null;

      switch (lowerCaseUserType) {
        case "player":
          fetchedUser = await api.players.getById(id);
          break;
        case "organization":
          fetchedUser = await api.organizations.getById(id);
          break;
        case "spectator":
          fetchedUser = await api.spectators.getById(id);
          break;
        default:
          throw new Error("Tipo de usuário inválido.");
      }

      if (!fetchedUser) {
        throw new Error("Usuário não encontrado.");
      }

      setProfileUser(fetchedUser);

      // Buscar quem o usuário está seguindo
      const isOwnProfile =
        loggedInUser &&
        loggedInUser.userId === fetchedUser.userId &&
        loggedInUser.userType.toLowerCase() === lowerCaseUserType;

      let followingResponse;

      if (isOwnProfile) {
        followingResponse = await api.follow.getMyFollowing({
          page: pagination.page,
          size: pagination.size,
        });
      } else {
        followingResponse = await api.follow.getFollowing(
          fetchedUser.userId,
          userType.toUpperCase(),
          {
            page: pagination.page,
            size: pagination.size,
          }
        );
      }

      setFollowing(followingResponse.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: followingResponse.totalPages || 0,
        totalElements: followingResponse.totalElements || 0,
      }));
    } catch (err) {
      console.error("Error fetching following:", err);
      setError(
        err.message || "Falha ao carregar lista de seguindo. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages - 1) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handlePreviousPage = () => {
    if (pagination.page > 0) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <Header />
        <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl">
          <p>Carregando...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl">
          <h1 className="text-red-500 text-2xl">Erro: {error}</h1>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl">
        {/* Cabeçalho */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-800 font-semibold mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {profileUser?.name} está seguindo
          </h1>
          <p className="text-gray-500 mt-2">
            {pagination.totalElements} usuário
            {pagination.totalElements !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Lista de usuários sendo seguidos */}
        {following.length === 0 ? (
          <div className="bg-gray-50 border border-zinc-200 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-lg">
              {profileUser?.name} ainda não está seguindo ninguém.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {following.map((user) => (
              <UserListCard key={user.userId} user={user} />
            ))}
          </div>
        )}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={pagination.page === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
            >
              Anterior
            </button>
            <span className="text-gray-700">
              Página {pagination.page + 1} de {pagination.totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
            >
              Próxima
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
