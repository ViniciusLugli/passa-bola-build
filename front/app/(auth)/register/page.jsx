"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/app/components/layout/AuthLayout";
import Link from "next/link";
import StepIndicator from "@/app/components/ui/StepIndicator";
import Button from "@/app/components/ui/Button";
import { ArrowRight, ShieldCheck, Trophy, UserRound } from "lucide-react";

const roleOptions = [
  {
    value: "organizacao",
    label: "Organização",
    description: "Gerencie equipes, jogos e torneios.",
    icon: ShieldCheck,
  },
  {
    value: "jogadora",
    label: "Jogadora",
    description: "Mostre seu talento e encontre novos jogos.",
    icon: Trophy,
  },
  {
    value: "espectador",
    label: "Espectador",
    description: "Acompanhe partidas e apoie o futebol feminino.",
    icon: UserRound,
  },
];

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [formError, setFormError] = useState("");
  const router = useRouter();

  const steps = useMemo(
    () => [
      {
        title: "Passo 1",
        description: "Selecione o seu perfil",
      },
      {
        title: "Passo 2",
        description: "Preencha suas informações",
      },
    ],
    []
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedRole) {
      setFormError("Selecione o perfil que melhor representa você.");
      return;
    }

    router.push(`/register/info?role=${selectedRole}`);
  };

  const handleSelectRole = (value) => {
    setSelectedRole(value);
    if (formError) setFormError("");
  };

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
            Escolha como você quer participar da comunidade.
          </p>
          <StepIndicator steps={steps} currentStep={1} />
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          noValidate
        >
          <div
            className="grid gap-4"
            role="radiogroup"
            aria-label="Selecione seu perfil"
          >
            {roleOptions.map(
              ({ value, label, description, icon: Icon }, idx) => {
                const isSelected = selectedRole === value;
                const cardId = `role-${value}`;

                return (
                  <label
                    key={value}
                    htmlFor={cardId}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        handleSelectRole(value);
                      }
                    }}
                    className={`
                    flex flex-col sm:flex-row sm:items-center
                    gap-4
                    p-4 sm:p-5 
                    rounded-2xl 
                    border-2 
                    transition-all 
                    duration-200 
                    shadow-sm
                    cursor-pointer
                    focus-visible:ring-2
                    focus-visible:ring-accent
                    focus-visible:ring-offset-2
                    ${
                      isSelected
                        ? "border-accent bg-accent-soft text-accent-strong"
                        : "border-default bg-surface text-primary hover:border-accent hover:bg-accent-soft/50"
                    }
                  `}
                  >
                    <input
                      id={cardId}
                      type="radio"
                      name="userRole"
                      value={value}
                      checked={isSelected}
                      onChange={() => handleSelectRole(value)}
                      className="sr-only"
                    />
                    <div
                      className={`
                      flex items-center justify-center
                      h-12 w-12 rounded-xl
                      transition-colors duration-200
                      ${
                        isSelected
                          ? "bg-accent text-on-brand"
                          : "bg-surface-muted text-accent"
                      }
                    `}
                      aria-hidden="true"
                    >
                      <Icon className="h-6 w-6" strokeWidth={2.2} />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-lg sm:text-xl font-semibold">
                        {label}
                      </span>
                      <span className="text-sm sm:text-base text-secondary">
                        {description}
                      </span>
                    </div>
                    <ArrowRight
                      className={`
                      h-5 w-5 sm:h-6 sm:w-6
                      ml-auto
                      transition-transform duration-200
                      ${
                        isSelected
                          ? "translate-x-1 text-accent-strong"
                          : "text-secondary"
                      }
                    `}
                      aria-hidden="true"
                    />
                  </label>
                );
              }
            )}
          </div>

          {formError && (
            <p
              className="text-sm text-danger"
              role="alert"
              aria-live="assertive"
            >
              {formError}
            </p>
          )}

          <Button
            type="submit"
            disabled={!selectedRole}
            variant={selectedRole ? "primary" : "secondary"}
            ariaLabel="Continuar"
          >
            Continuar
          </Button>
        </form>

        <div className="pt-4 sm:pt-6 border-t border-default flex flex-col items-center gap-3 text-center">
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
        </div>
      </div>
    </AuthLayout>
  );
}
