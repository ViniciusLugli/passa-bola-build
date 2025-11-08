"use client";

import Input from "@/app/components/ui/Input";
import SelectInput from "@/app/components/ui/SelectInput";

const helperCopy = {
  password: {
    hint: "Use pelo menos 8 caracteres com letras e números.",
  },
  confirmPassword: {
    hint: "Repita a senha exatamente como digitou acima.",
  },
  cnpj: {
    hint: "Informe o CNPJ com 14 dígitos, apenas números.",
  },
  phone: {
    hint: "Opcional. Informe um telefone de contato.",
  },
  bio: {
    hint: "Conte brevemente sobre a organização (até 180 caracteres).",
  },
};

const autoCompleteMap = {
  name: "organization",
  email: "email",
  cnpj: "off",
  city: "address-level2",
  state: "address-level1",
  password: "new-password",
  confirmPassword: "new-password",
  username: "username",
  phone: "tel",
};

export default function OrganizationFormFields({
  currentStep,
  formData,
  handleInputChange,
  loading,
  fieldsStep1,
  fieldsStep2,
  fieldErrors,
  brazilianStates,
}) {
  const fields = currentStep === 1 ? fieldsStep1 : fieldsStep2;

  return fields.map((field) => {
    const helper = helperCopy[field.name] ?? {};
    const autoComplete = autoCompleteMap[field.name] ?? "off";

    if (field.type === "select") {
      return (
        <SelectInput
          key={field.name}
          label={field.placeholder}
          name={field.name}
          value={formData[field.name]}
          onChange={handleInputChange}
          disabled={loading}
          required={field.required}
          error={fieldErrors[field.name]}
          hint={helper.hint}
          options={brazilianStates.map((state) => ({
            value: state.uf,
            label: state.nome,
          }))}
        />
      );
    }

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
        />
      </div>
    );
  });
}
