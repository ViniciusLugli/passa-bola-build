"use client";

import Header from "@/app/components/Header";
import TeamList from "@/app/components/TeamList";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function TeamsPage() {
  const { user } = useAuth();

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl">
        <div className="bg-white border border-zinc-300 rounded-lg shadow-xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Equipes</h1>
            {user?.userType === "PLAYER" && (
              <Link
                href="/teams/newTeam"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Criar Nova Equipe
              </Link>
            )}
          </div>
          <TeamList />
        </div>
      </main>
    </div>
  );
}
