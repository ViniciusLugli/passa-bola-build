"use client";

import Input from "@/app/components/Input";
import SelectInput from "@/app/components/SelectInput";

export default function OrganizationFormFields({
  currentStep,
  formData,
  handleInputChange,
  loading,
  orgStep1Fields,
  orgStep2Fields,
  brazilianStates,
}) {
  const fields = currentStep === 1 ? orgStep1Fields : orgStep2Fields;

  return fields.map((field) => (
    <div key={field.name}>
      {field.type === "select" ? (
        <SelectInput
          label={field.placeholder}
          name={field.name}
          value={formData[field.name]}
          onChange={handleInputChange}
          disabled={loading}
          required={field.required}
          options={brazilianStates.map((state) => ({
            value: state.uf,
            label: state.nome,
          }))}
        />
      ) : (
        <Input
          type={field.type}
          placeholder={field.placeholder}
          name={field.name}
          value={formData[field.name]}
          onChange={handleInputChange}
          disabled={loading}
          required={field.required}
        />
      )}
    </div>
  ));
}
