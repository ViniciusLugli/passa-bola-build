"use client";

import { Suspense } from "react";
import AuthLayout from "@/app/components/AuthLayout";
import Link from "next/link";
import { useRegisterForm } from "./useRegisterForm";
import PlayerSpectatorFormFields from "./PlayerSpectatorFormFields";
import OrganizationFormFields from "./OrganizationFormFields";

function RegisterForm() {
  const {
    role,
    currentStep,
    error,
    loading,
    formData,
    isOrganization,
    step1Fields,
    step2Fields,
    orgStep1Fields,
    orgStep2Fields,
    handleInputChange,
    handleNextStep,
    brazilianStates,
  } = useRegisterForm();

  if (!role) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthLayout>
      <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl text-center flex flex-col gap-6 sm:gap-8 md:gap-10 w-full transition-transform duration-300 ease-in-out">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4 sm:mb-6">
          Bem-vindo ao <span className="text-purple-700">Passa a Bola</span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-semibold mb-4 sm:mb-6">
          Insira suas informações de{" "}
          {role === "organizacao" ? "organização" : role}...
        </p>

        <form
          onSubmit={handleNextStep}
          className="flex flex-col gap-4 sm:gap-6"
        >
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Oops! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {isOrganization ? (
            <OrganizationFormFields
              currentStep={currentStep}
              formData={formData}
              handleInputChange={handleInputChange}
              loading={loading}
              orgStep1Fields={orgStep1Fields}
              orgStep2Fields={orgStep2Fields}
              brazilianStates={brazilianStates}
            />
          ) : (
            <PlayerSpectatorFormFields
              currentStep={currentStep}
              formData={formData}
              handleInputChange={handleInputChange}
              loading={loading}
              step1Fields={step1Fields}
              step2Fields={step2Fields}
            />
          )}

          <div className="mt-4 sm:mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-800 hover:bg-purple-900 text-white font-bold py-4 sm:py-5 rounded-xl text-xl sm:text-2xl transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {loading
                ? "CRIANDO..."
                : currentStep === 1
                ? "CONTINUAR"
                : "CRIAR CONTA"}
            </button>
          </div>
        </form>

        <div className="mt-6 sm:mt-8 md:mt-10 pt-6 border-t border-gray-200 flex flex-col items-center gap-3">
          <p className="text-lg sm:text-xl font-semibold text-gray-700">
            Já tem cadastro?
          </p>
          <Link
            href="/login"
            className="text-purple-600 hover:text-purple-800 font-bold text-lg sm:text-xl transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            Faça seu login!
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function RegisterInfoPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
