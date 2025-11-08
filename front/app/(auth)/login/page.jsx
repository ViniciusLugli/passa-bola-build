"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import AuthLayout from "@/app/components/layout/AuthLayout";
import Input from "@/app/components/ui/Input";
import Link from "next/link";
import { useToast } from "@/app/context/ToastContext";
import { ArrowRight } from "lucide-react";
// LoadingSpinner is intentionally not imported here — use Button (which uses LoadingSpinner internally)
import Button from "@/app/components/ui/Button";

const validateEmail = (value) => {
  if (!value) return "Informe seu email.";
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(value) ? "" : "Informe um email válido.";
};

const validatePassword = (value) => {
  if (!value) return "Informe sua senha.";
  if (value.length < 6) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  return "";
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const { login, loginErrorMessage, clearLoginError } = useAuth();
  const { showToast } = useToast();

  // autofocus on desktop / non-touch devices to improve UX,
  // avoid opening virtual keyboard on mobile devices.
  useEffect(() => {
    try {
      const isTouch =
        typeof window !== "undefined" &&
        ("ontouchstart" in window ||
          (navigator && navigator.maxTouchPoints > 0));
      const minDesktopWidth =
        typeof window !== "undefined" ? window.innerWidth >= 640 : false;
      if (!isTouch || minDesktopWidth) {
        const el = document.getElementById("email");
        if (el && typeof el.focus === "function") {
          // don't force focus if field already has value
          if (!el.value) el.focus();
        }
      }
    } catch (e) {
      // fail silently
    }
  }, []);

  // mostrar erro de login via toast quando a mensagem chegar do contexto
  useEffect(() => {
    if (loginErrorMessage) {
      // passa clearLoginError como callback para ser executado quando o toast fechar
      showToast(loginErrorMessage, "error", 4000, clearLoginError);
    }
  }, [loginErrorMessage, showToast, clearLoginError]);

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    }

    if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(password),
      }));
    }
  };

  const handleEmailChange = (event) => {
    const nextValue = event.target.value;
    setEmail(nextValue);
    if (loginErrorMessage) clearLoginError();

    if (touched.email) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(nextValue),
      }));
    }
  };

  const handlePasswordChange = (event) => {
    const nextValue = event.target.value;
    setPassword(nextValue);
    if (loginErrorMessage) clearLoginError();

    if (touched.password) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(nextValue),
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearLoginError();

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    const nextErrors = {
      email: emailValidation,
      password: passwordValidation,
    };

    setErrors(nextErrors);
    setTouched({ email: true, password: true });

    if (emailValidation || passwordValidation) {
      // focus first invalid field to improve UX on mobile
      if (emailValidation) {
        const el = document.getElementById("email");
        if (el && typeof el.focus === "function") {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else if (passwordValidation) {
        const el = document.getElementById("password");
        if (el && typeof el.focus === "function") {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div
        className="
          w-full
          max-w-md sm:max-w-lg
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
        <header className="flex flex-col gap-2 text-left">
          <h1
            className="
              text-3xl sm:text-4xl md:text-5xl 
              font-extrabold 
              text-primary
              leading-tight
            "
          >
            Faça login
          </h1>

          <p className="text-base sm:text-lg text-secondary">
            Bem-vindo de volta! Insira suas credenciais para continuar.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 text-left"
          noValidate
        >
          {/* Mostrar erro de login via Toast */}

          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            name="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleFieldBlur("email")}
            error={touched.email ? errors.email : ""}
            autoComplete="email"
            disabled={loading}
            required
          />

          <div className="flex flex-col gap-2">
            <Input
              label="Senha"
              type="password"
              placeholder="Sua senha"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleFieldBlur("password")}
              error={touched.password ? errors.password : ""}
              autoComplete="current-password"
              disabled={loading}
              required
            />
            <div className="flex justify-end">
              <Link
                href="#"
                className="
                  text-sm sm:text-base 
                  text-accent 
                  hover:text-accent-strong
                  transition-all 
                  duration-200 
                  font-medium
                  hover:scale-105 active:scale-95
                "
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </div>

          <Button type="submit" loading={loading} ariaLabel="Entrar">
            Entrar
          </Button>
        </form>

        <div className="pt-4 sm:pt-6 border-t border-default text-center flex flex-col items-center gap-3">
          <p className="text-base sm:text-lg font-medium text-secondary">
            Ainda não tem uma conta?
          </p>
          <Link
            href="/register"
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
            Faça seu cadastro!
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
