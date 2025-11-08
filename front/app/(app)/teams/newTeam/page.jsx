"use client";

import CreateTeamForm from "@/app/components/forms/CreateTeamForm";
import PrivateRoute from "@/app/components/layout/PrivateRoute";

export default function NewTeamPage() {
  return (
    <PrivateRoute allowedRoles={["PLAYER"]}>
      <div className="bg-page min-h-screen">
        <main className="container mx-auto p-4 md:p-8 lg:p-12 max-w-4xl">
          <h1 className="text-3xl font-bold text-primary mb-6">
            Criar Novo Time
          </h1>
          <CreateTeamForm />
        </main>
      </div>
    </PrivateRoute>
  );
}
