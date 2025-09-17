"use client";

import { useState, memo } from "react";

const SelectInput = ({ label, name, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value) || {
    label: "Selecione o tipo",
    value: "",
  };

  const handleSelect = (option) => {
    onChange({ target: { name: name, value: option.value } });
    setIsOpen(false);
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
        onClick={() => setIsOpen(!isOpen)}
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
          overflow-y-auto
          max-h-60
        "
        >
          {options.map((option) => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(SelectInput);
