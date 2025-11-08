"use client";

import { useState, memo, useRef, useEffect, useId } from "react";
import { ChevronDown } from "lucide-react";

const SelectInput = ({
  label,
  name,
  options = [],
  value,
  onChange,
  required = false,
  placeholder = "Selecione uma opção",
  description,
  hint,
  error,
  success,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef(null);
  const generatedId = useId();
  const selectId = name ?? `select-${generatedId}`;
  const triggerId = `${selectId}-trigger`;
  const listboxId = `${selectId}-listbox`;
  const labelId = `${selectId}-label`;

  const defaultLabel = required ? `${placeholder} *` : placeholder;
  const selectedOption = options.find((opt) => opt.value === value) || {
    label: defaultLabel,
    value: "",
  };

  // Filtra opções baseado no termo de busca
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Foca no input de busca quando abre o dropdown
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    if (disabled) return;
    onChange({ target: { name: name, value: option.value } });
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  const describedByIds = [];
  if (description) describedByIds.push(`${selectId}-description`);
  if (hint) describedByIds.push(`${selectId}-hint`);
  if (error) describedByIds.push(`${selectId}-error`);
  if (!error && success) describedByIds.push(`${selectId}-success`);

  const triggerClasses = `
    w-full 
    p-4 sm:p-5 
    rounded-xl 
    border-2 
    bg-surface
    text-lg sm:text-xl
    text-primary
    flex 
    justify-between 
    items-center 
    transition-colors 
    duration-200
    ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
    ${
      error
        ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger"
        : success
        ? "border-success focus:border-success focus:ring-2 focus:ring-success"
        : "border-default hover:border-accent focus:border-accent focus:ring-2 focus:ring-accent"
    }
  `;

  return (
    <div className="relative w-full flex flex-col gap-1.5">
      {label && (
        <label
          id={labelId}
          htmlFor={triggerId}
          className="block text-md font-medium text-secondary"
        >
        {label}
          {required && (
            <span className="text-danger text-sm leading-none ml-1">*</span>
          )}
        </label>
      )}
      <button
        type="button"
        id={triggerId}
        data-testid={triggerId}
        className={triggerClasses}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-labelledby={label ? `${labelId} ${triggerId}` : undefined}
        aria-describedby={
          describedByIds.length ? describedByIds.join(" ") : undefined
        }
        aria-invalid={Boolean(error)}
        disabled={disabled}
      >
        <span
          className={`truncate ${
            !selectedOption.value ? "text-tertiary" : "text-primary"
          }`}
        >
          {selectedOption.label}
        </span>
        <ChevronDown
          className={`
            w-5 h-5 
            text-gray-800
            dark:text-gray-300
            transition-transform 
            duration-200 
            ${isOpen ? "rotate-180" : "rotate-0"}
          `}
          strokeWidth={2}
        />
      </button>

      {isOpen && (
        <div
          className="
          absolute 
          top-full 
          left-0 
          mt-2 
          w-full 
          bg-surface 
          border 
          border-default 
          rounded-xl 
          shadow-lg 
          z-20
          max-h-60
          flex
          flex-col
        "
          role="presentation"
        >
          <div className="p-3 border-b border-default sticky top-0 bg-surface rounded-t-xl">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Buscar..."
              className="
                w-full 
                p-2 sm:p-3
                text-base sm:text-lg
                border 
                border-default
                rounded-lg 
                focus:outline-none 
                focus:border-accent
                focus:ring-2
                focus:ring-accent
                transition-colors
              "
            />
          </div>

          <div
            className="overflow-y-auto max-h-48"
            role="listbox"
            id={listboxId}
            aria-labelledby={label ? labelId : undefined}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  className="
                    p-4 sm:p-5 
                    text-lg sm:text-xl 
                    text-primary
                    cursor-pointer 
                    hover:bg-surface-muted 
                    transition-colors 
                    duration-200
                    text-left
                  "
                  type="button"
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={option.value === selectedOption.value}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="p-4 sm:p-5 text-lg sm:text-xl text-secondary text-center">
                Nenhum resultado encontrado
              </div>
            )}
          </div>
        </div>
      )}
      {description && (
        <p id={`${selectId}-description`} className="text-sm text-secondary">
          {description}
        </p>
      )}
      {hint && !error && (
        <p id={`${selectId}-hint`} className="text-sm text-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${selectId}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
      {!error && success && (
        <p id={`${selectId}-success`} className="text-sm text-success">
          {success}
        </p>
      )}
    </div>
  );
};

export default memo(SelectInput);
