"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { brazilianStates } from "@/app/lib/brazilianStates";

export const useRegisterForm = () => {
  const router = useRouter();
  const { register, login } = useAuth();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
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

    // Limpar erro ao começar a digitar
    if (error) setError(null);

    // Validação em tempo real das senhas
    if (name === "password" || name === "confirmPassword") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword =
        name === "confirmPassword" ? value : formData.confirmPassword;

      if (password.length > 0 && password.length < 8) {
        setPasswordError("A senha deve ter no mínimo 8 caracteres");
      } else if (confirmPassword.length > 0 && password !== confirmPassword) {
        setPasswordError("As senhas não coincidem");
      } else {
        setPasswordError("");
      }
    }
  };

  const removeEmptyFields = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => {
        return (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          (typeof value !== "string" || value.trim() !== "")
        );
      })
    );
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
        payload = removeEmptyFields({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          birthDate: formData.birthDate,
          phone: formData.phone,
        });
        break;
      case "organizacao":
        apiRole = "organization";
        payload = removeEmptyFields({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          cnpj: formData.cnpj,
          password: formData.password,
          bio: formData.bio,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
        });
        break;
      case "espectador":
        apiRole = "spectator";
        payload = removeEmptyFields({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          birthDate: formData.birthDate,
          phone: formData.phone,
        });
        break;
      default:
        setError("Tipo de usuário inválido.");
        setLoading(false);
        return;
    }

    // debug logs removed

    try {
      const res = await register(payload, apiRole);

      // Fazer login automaticamente após o registro bem-sucedido
      await login({ email: formData.email, password: formData.password });

      return res;
    } catch (err) {
      console.error("❌ Erro no registro:", err);
      console.error("📋 Detalhes do erro:", {
        status: err.status,
        body: err.body,
        message: err.message,
      });

      // Mensagem de erro mais detalhada
      let errorMessage = "Falha no cadastro. ";

      if (err.body?.errors) {
        // Se houver erros de validação específicos
        const errors = err.body.errors;
        errorMessage += Object.values(errors).join(", ");
      } else if (err.body?.message) {
        errorMessage += err.body.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += "Verifique os dados e tente novamente.";
      }

      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();

    // Validar senhas no step 1 antes de avançar
    if (currentStep === 1) {
      // Validações do step 1
      if (!formData.name || !formData.email || !formData.password) {
        setError("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      if (formData.password.length < 8) {
        setError("A senha deve ter no mínimo 8 caracteres");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem");
        return;
      }

      // Validações específicas para organização no step 1
      if (isOrganization) {
        if (!formData.cnpj) {
          setError("CNPJ é obrigatório para organizações.");
          return;
        }
        if (!formData.city || !formData.state) {
          setError("Cidade e Estado são obrigatórios para organizações.");
          return;
        }
      }
    }

    // Validações do step 2
    if (currentStep === 2) {
      if (!formData.username) {
        setError("Nome de usuário é obrigatório.");
        return;
      }

      // Validações específicas para jogadora e espectador
      if (!isOrganization && !formData.birthDate) {
        setError("Data de nascimento é obrigatória.");
        return;
      }
    }

    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const isOrganization = role === "organizacao";

  const step1Fields = [
    {
      name: "name",
      type: "text",
      placeholder: "Nome Completo *",
      required: true,
    },
    { name: "email", type: "email", placeholder: "Email *", required: true },
    {
      name: "password",
      type: "password",
      placeholder: "Senha *",
      required: true,
    },
    {
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirme sua senha *",
      required: true,
    },
  ];

  const step2Fields = [
    {
      name: "username",
      type: "text",
      placeholder: "Nome de usuário *",
      required: true,
    },
    {
      name: "birthDate",
      type: "date",
      placeholder: "Data de nascimento *",
      required: true,
    },
    {
      name: "phone",
      type: "tel",
      placeholder: "Telefone (opcional)",
      required: false,
    },
    {
      name: "bio",
      type: "text",
      placeholder: "Sua bio (opcional)",
      required: false,
    },
  ];

  const orgStep1Fields = [
    {
      name: "name",
      type: "text",
      placeholder: "Nome da Organização *",
      required: true,
    },
    {
      name: "email",
      type: "email",
      placeholder: "Email de Contato *",
      required: true,
    },
    { name: "cnpj", type: "text", placeholder: "CNPJ *", required: true },
    { name: "city", type: "text", placeholder: "Cidade *", required: true },
    { name: "state", type: "select", placeholder: "Estado *", required: true },
    {
      name: "password",
      type: "password",
      placeholder: "Senha *",
      required: true,
    },
    {
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirme sua senha *",
      required: true,
    },
  ];

  const orgStep2Fields = [
    {
      name: "username",
      type: "text",
      placeholder: "Nome de usuário *",
      required: true,
    },
    {
      name: "phone",
      type: "tel",
      placeholder: "Telefone (opcional)",
      required: false,
    },
    {
      name: "bio",
      type: "text",
      placeholder: "Bio da organização (opcional)",
      required: false,
    },
  ];

  return {
    role,
    currentStep,
    error,
    loading,
    formData,
    passwordError,
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
