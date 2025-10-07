"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import SearchBar from "@/app/components/SearchBar";
import { api } from "@/app/lib/api";
import Link from "next/link";
import Image from "next/image";

export default function UserListPage() {
  const { userType, id, listType } = useParams();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!id || !userType || !listType) {
        setLoading(false);
        setError("Parâmetros de URL incompletos.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let response;
        if (listType === "followers") {
          response = await api.follow.getFollowers(id, userType.toUpperCase());
        } else if (listType === "following") {
          response = await api.follow.getFollowing(id, userType.toUpperCase());
        } else {
          throw new Error("Tipo de lista inválido.");
        }

        if (response && response.content) {
          setUsers(response.content);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Error fetching user list:", err);
        setError(err.message || "Falha ao carregar a lista de usuários.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [id, userType, listType]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const title = listType === "followers" ? "Seguidores" : "Seguindo";

  if (loading) {
    return (
      <div>
        <Header />
        <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl">
          <p>Carregando {title}...</p>
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          {title}
        </h1>
        <div className="mb-6">
          <SearchBar value={searchTerm} onChange={handleSearchChange} />
        </div>
        {filteredUsers.length === 0 ? (
          <p className="text-gray-600">Nenhum usuário encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((userItem) => (
              <Link
                key={userItem.id}
                href={`/user/${userItem.userType.toLowerCase()}/${userItem.id}`}
                passHref
              >
                <div className="flex items-center bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={
                        userItem.profilePhotoUrl || "/icons/user-default.png"
                      }
                      alt="Avatar do usuário"
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">
                      {userItem.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      @{userItem.username}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
