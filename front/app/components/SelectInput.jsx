"use client";

import { useState, memo, useRef, useEffect } from "react";

const SelectInput = ({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
  placeholder = "Selecione uma opção",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef(null);

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

  const handleSelect = (option) => {
    onChange({ target: { name: name, value: option.value } });
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchTerm("");
    }
  };

  return (
    <div className="relative w-full">
      <label className="block text-md font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div
        className="
          w-full 
          p-4 sm:p-5 
          rounded-xl 
          border-2 
          border-gray-200 
          bg-white
          text-lg sm:text-xl
          text-gray-800
          flex 
          justify-between 
          items-center 
          cursor-pointer
          transition-colors 
          duration-200
          hover:border-purple-500
        "
        onClick={handleToggle}
      >
        <span>{selectedOption.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`
            w-5 h-5 
            transition-transform 
            duration-200 
            ${isOpen ? "rotate-180" : "rotate-0"}
          `}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>

      {isOpen && (
        <div
          className="
          absolute 
          top-full 
          left-0 
          mt-2 
          w-full 
          bg-white 
          border 
          border-gray-200 
          rounded-xl 
          shadow-lg 
          z-20
          max-h-60
          flex
          flex-col
        "
        >
          {/* Barra de busca */}
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
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
                border-gray-300 
                rounded-lg 
                focus:outline-none 
                focus:border-purple-500
                transition-colors
              "
            />
          </div>

          {/* Lista de opções filtradas */}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="
                    p-4 sm:p-5 
                    text-lg sm:text-xl 
                    text-gray-800
                    cursor-pointer 
                    hover:bg-gray-100 
                    transition-colors 
                    duration-200
                  "
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="p-4 sm:p-5 text-lg sm:text-xl text-gray-500 text-center">
                Nenhum resultado encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(SelectInput);
