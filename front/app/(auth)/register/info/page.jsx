"use client";

import { Suspense, useMemo, useEffect } from "react";
import AuthLayout from "@/app/components/layout/AuthLayout";
import Link from "next/link";
import StepIndicator from "@/app/components/ui/StepIndicator";
// LoadingSpinner used via Button component; no direct import needed here
import Button from "@/app/components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRegisterForm } from "./useRegisterForm";
import PlayerSpectatorFormFields from "./PlayerSpectatorFormFields";
import OrganizationFormFields from "./OrganizationFormFields";

const stepLabels = [
  { title: "Passo 1", description: "Informações básicas" },
  { title: "Passo 2", description: "Detalhes do perfil" },
];

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
    fieldErrors,
    handleInputChange,
    handleNextStep,
    handlePreviousStep,
    brazilianStates,
  } = useRegisterForm();

  const isSecondStep = currentStep === 2;

  const roleLabel = useMemo(() => {
    if (role === "organizacao") return "organização";
    if (role === "jogadora") return "jogadora";
    return "espectador";
  }, [role]);

  if (!role) {
    return <div>Carregando...</div>;
  }

  // when fieldErrors appear, focus the first invalid field to help mobile users
  return (
    <AuthLayout>
      <div
        className="
          w-full
          max-w-3xl
          mx-auto
          bg-surface
          border
          border-default
          rounded-3xl
          p-6 sm:p-8 md:p-10
          shadow-elevated
          flex
          flex-col
          gap-6 sm:gap-8
          transition-transform duration-300 ease-in-out
        "
      >
        <header className="flex flex-col gap-4 text-left">
          <p className="text-sm font-medium uppercase tracking-wide text-secondary">
            Passa a Bola
          </p>
          <h1
            className="
              text-3xl sm:text-4xl md:text-5xl 
              font-extrabold 
              text-primary 
              leading-tight
            "
          >
            Crie sua conta
          </h1>
          <p className="text-base sm:text-lg text-secondary">
            Preencha os campos abaixo para criar sua conta no Passa a Bola.
          </p>
          <div className="flex flex-col gap-3">
            <StepIndicator steps={stepLabels} currentStep={currentStep} />
            <p className="text-sm text-secondary">Passo {currentStep} de 2</p>
          </div>
        </header>

        <form
          onSubmit={handleNextStep}
          className="flex flex-col gap-6"
          noValidate
        >
          {error && (
            <div
              className="bg-danger-soft border border-danger text-danger px-4 py-3 rounded-xl"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <div className="grid gap-4">
            {isOrganization ? (
              <OrganizationFormFields
                currentStep={currentStep}
                formData={formData}
                handleInputChange={handleInputChange}
                loading={loading}
                fieldsStep1={step1Fields}
                fieldsStep2={step2Fields}
                fieldErrors={fieldErrors}
                brazilianStates={brazilianStates}
              />
            ) : (
              <PlayerSpectatorFormFields
                currentStep={currentStep}
                formData={formData}
                handleInputChange={handleInputChange}
                loading={loading}
                fieldsStep1={step1Fields}
                fieldsStep2={step2Fields}
                fieldErrors={fieldErrors}
              />
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 justify-between pt-2">
            {isSecondStep ? (
              <button
                type="button"
                onClick={handlePreviousStep}
                className="
                  w-full sm:w-auto
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-4 py-3
                  rounded-xl
                  border
                  border-default
                  text-primary
                  font-medium
                  transition-all
                  duration-200
                  hover:border-accent
                  hover:text-accent
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-offset-2
                  focus-visible:ring-accent
                "
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                Voltar
              </button>
            ) : (
              <span />
            )}

            <Button
              type="submit"
              loading={loading}
              ariaLabel={isSecondStep ? "Criar conta" : "Continuar"}
              className="w-full sm:w-auto px-5"
            >
              <span className="font-semibold">
                {isSecondStep ? "Criar conta" : "Continuar"}
              </span>
              <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
            </Button>
          </div>
        </form>

        <footer className="pt-4 sm:pt-6 border-t border-default flex flex-col items-center gap-3 text-center">
          <p className="text-base sm:text-lg font-medium text-secondary">
            Já tem cadastro?
          </p>
          <Link
            href="/login"
            className="
              text-accent 
              hover:text-accent-strong 
              font-semibold 
              text-base sm:text-lg
              transition-all 
              duration-200
              flex items-center gap-2
              hover:scale-105 active:scale-95
            "
          >
            Faça seu login
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
          </Link>
        </footer>
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
