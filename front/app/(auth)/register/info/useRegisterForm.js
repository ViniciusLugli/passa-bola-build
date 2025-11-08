"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { brazilianStates } from "@/app/lib/brazilianStates";

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const useRegisterForm = () => {
  const router = useRouter();
  const { register } = useAuth();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
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

  const isOrganization = role === "organizacao";

  const step1Fields = [
    {
      name: "name",
      type: "text",
      placeholder: isOrganization ? "Nome da Organização *" : "Nome Completo *",
      required: true,
    },
    {
      name: "email",
      type: "email",
      placeholder: "Email *",
      required: true,
    },
    ...(isOrganization
      ? [
          { name: "cnpj", type: "text", placeholder: "CNPJ *", required: true },
          {
            name: "city",
            type: "text",
            placeholder: "Cidade *",
            required: true,
          },
          {
            name: "state",
            type: "select",
            placeholder: "Estado *",
            required: true,
          },
        ]
      : []),
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

  const step2Fields = isOrganization
    ? [
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
      ]
    : [
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

  const resetFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const validateEmail = (value) => {
    if (!value) return "Informe um email.";
    return emailRegex.test(value) ? "" : "Informe um email válido.";
  };

  const validatePasswordValue = (value) => {
    if (!value) return "Informe uma senha.";
    if (value.length < 8) {
      return "A senha deve ter no mínimo 8 caracteres.";
    }
    return "";
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });

    if (error) setError(null);
    // Remove o erro do campo quando o usuário começa a digitar
    resetFieldError(name);
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

  const validateStep = (step) => {
    const errors = {};
    const requiredMessage = "Campo obrigatório.";

    if (step === 1) {
      step1Fields.forEach((field) => {
        if (field.required) {
          const value = formData[field.name];
          if (!value || (typeof value === "string" && value.trim() === "")) {
            errors[field.name] = requiredMessage;
          }
        }
      });

      const emailMessage = validateEmail(formData.email);
      if (emailMessage) errors.email = emailMessage;

      const passwordMessage = validatePasswordValue(formData.password);
      if (passwordMessage) errors.password = passwordMessage;

      if (!errors.confirmPassword) {
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = "As senhas não coincidem.";
        }
      }
    }

    if (step === 2) {
      step2Fields.forEach((field) => {
        if (field.required) {
          const value = formData[field.name];
          if (!value || (typeof value === "string" && value.trim() === "")) {
            errors[field.name] = requiredMessage;
          }
        }
      });

      if (!isOrganization && formData.birthDate) {
        const dateValue = new Date(formData.birthDate);
        if (Number.isNaN(dateValue.getTime())) {
          errors.birthDate = "Informe uma data válida.";
        }
      }
    }

    return errors;
  };

  const handleFinalSubmit = async () => {
    setError(null);
    setLoading(true);

    const stepErrors = validateStep(2);
    if (Object.keys(stepErrors).length > 0) {
      setFieldErrors(stepErrors);
      setError("Revise os campos destacados antes de continuar.");
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

    try {
      const res = await register(payload, apiRole);
      router.push("/login");
      return res;
    } catch (err) {
      console.error("❌ Erro no registro:", err);
      console.error("📋 Detalhes do erro:", {
        status: err.status,
        body: err.body,
        message: err.message,
      });

      let errorMessage = "Falha no cadastro. ";

      if (err.body?.errors) {
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

  const handleNextStep = (event) => {
    event.preventDefault();
    const stepErrors = validateStep(currentStep);

    if (Object.keys(stepErrors).length > 0) {
      setFieldErrors(stepErrors);
      setError("Revise os campos destacados antes de continuar.");
      return;
    }

    setFieldErrors({});
    setError(null);

    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    setError(null);
  };

  return {
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
  };
};
