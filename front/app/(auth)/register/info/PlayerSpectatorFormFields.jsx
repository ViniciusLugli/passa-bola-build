"use client";

import Input from "@/app/components/ui/Input";

const helperCopy = {
  password: {
    hint: "Use pelo menos 8 caracteres com letras e números.",
  },
  confirmPassword: {
    hint: "Repita a senha para confirmação.",
  },
  username: {
    hint: "Esse nome será exibido publicamente.",
  },
  birthDate: {
    hint: "Usamos para recomendar eventos adequados.",
  },
  phone: {
    hint: "Opcional. Deixe vazio se preferir não informar.",
  },
  bio: {
    hint: "Compartilhe um pouco sobre você (até 180 caracteres).",
  },
};

const autoCompleteMap = {
  name: "name",
  email: "email",
  password: "new-password",
  confirmPassword: "new-password",
  username: "username",
  birthDate: "bday",
  phone: "tel",
};

export default function PlayerSpectatorFormFields({
  currentStep,
  formData,
  handleInputChange,
  loading,
  fieldsStep1,
  fieldsStep2,
  fieldErrors,
}) {
  const fields = currentStep === 1 ? fieldsStep1 : fieldsStep2;

  return fields.map((field) => {
    const helper = helperCopy[field.name] ?? {};
    const autoComplete = autoCompleteMap[field.name] ?? "off";
    const maxDate =
      field.type === "date" ? new Date().toISOString().split("T")[0] : undefined;

    return (
      <div key={field.name}>
        <Input
          type={field.type}
          placeholder={field.placeholder}
          name={field.name}
          value={formData[field.name]}
          onChange={handleInputChange}
          disabled={loading}
          required={field.required}
          error={fieldErrors[field.name]}
          hint={helper.hint}
          autoComplete={autoComplete}
          max={maxDate}
        />
      </div>
    );
  });
}
