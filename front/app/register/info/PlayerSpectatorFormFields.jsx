"use client";

import Input from "@/app/components/Input";

export default function PlayerSpectatorFormFields({
  currentStep,
  formData,
  handleInputChange,
  loading,
  step1Fields,
  step2Fields,
}) {
  const fields = currentStep === 1 ? step1Fields : step2Fields;

  return fields.map((field) => (
    <div key={field.name}>
      <Input
        type={field.type}
        placeholder={field.placeholder}
        name={field.name}
        value={formData[field.name]}
        onChange={handleInputChange}
        disabled={loading}
      />
    </div>
  ));
}
