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
      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12 max-w-7xl">
        <div className="bg-white border border-zinc-300 rounded-lg shadow-xl p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
              Equipes
            </h1>
            {user?.userType === "PLAYER" && (
              <Link
                href="/teams/newTeam"
                className="w-full sm:w-auto text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 sm:py-2.5 px-4 sm:px-5 rounded-lg transition duration-300 text-sm sm:text-base"
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
