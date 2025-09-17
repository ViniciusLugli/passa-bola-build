"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { brazilianStates } from "@/app/lib/brazilianStates";

export const useRegisterForm = () => {
  const router = useRouter();
  const { register } = useAuth();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    username: "",
    name: "",
    cnpj: "",
    phone: "",
    bio: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    if (!role || !["jogadora", "organizacao", "espectador"].includes(role)) {
      router.push("/register");
    }
  }, [role, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFinalSubmit = async () => {
    setError(null);
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      setLoading(false);
      return;
    }

    let apiRole;
    let payload;

    switch (role) {
      case "jogadora":
        apiRole = "player";
        payload = {
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          birthDate: formData.birthDate,
          phone: formData.phone,
        };
        break;
      case "organizacao":
        apiRole = "organization";
        payload = {
          username: formData.username,
          name: formData.name,
          email: formData.email,
          cnpj: formData.cnpj,
          password: formData.password,
          bio: formData.bio,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
        };
        break;
      case "espectador":
        apiRole = "spectator";
        payload = {
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          birthDate: formData.birthDate,
          phone: formData.phone,
        };
        break;
      default:
        setError("Tipo de usuário inválido.");
        setLoading(false);
        return;
    }

    try {
      await register(payload, apiRole);
    } catch (err) {
      setError(err.message || "Falha no cadastro. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const isOrganization = role === "organizacao";

  const step1Fields = [
    { name: "name", type: "text", placeholder: "Nome Completo" },
    { name: "email", type: "email", placeholder: "Email" },
    { name: "password", type: "password", placeholder: "Senha" },
    {
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirme sua senha",
    },
  ];

  const step2Fields = [
    { name: "username", type: "text", placeholder: "Nome de usuário" },
    { name: "birthDate", type: "date", placeholder: "Data de nascimento" },
    { name: "phone", type: "tel", placeholder: "Telefone" },
    { name: "bio", type: "text", placeholder: "Sua bio" },
  ];

  const orgStep1Fields = [
    { name: "name", type: "text", placeholder: "Nome da Organização" },
    { name: "email", type: "email", placeholder: "Email de Contato" },
    { name: "cnpj", type: "text", placeholder: "CNPJ" },
    { name: "city", type: "text", placeholder: "Cidade" },
    { name: "state", type: "select", placeholder: "Estado" },
    { name: "password", type: "password", placeholder: "Senha" },
    {
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirme sua senha",
    },
  ];

  const orgStep2Fields = [
    { name: "username", type: "text", placeholder: "Nome de usuário" },
    { name: "phone", type: "tel", placeholder: "Telefone" },
    { name: "bio", type: "text", placeholder: "Bio da organização" },
  ];

  return {
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
  };
};
