"use client";

import Header from "@/app/components/Header";
import CreateTeamForm from "@/app/components/CreateTeamForm";
import PrivateRoute from "@/app/components/PrivateRoute";

export default function NewTeamPage() {
  return (
    <PrivateRoute allowedRoles={["PLAYER"]}>
      <Header />
      <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Criar Novo Time
        </h1>
        <CreateTeamForm />
      </main>
    </PrivateRoute>
  );
}
