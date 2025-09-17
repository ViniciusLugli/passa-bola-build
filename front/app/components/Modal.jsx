"use client";

import { memo } from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  // Adicionar 'title'
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {title && ( // Renderizar título se existir
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default memo(Modal);
