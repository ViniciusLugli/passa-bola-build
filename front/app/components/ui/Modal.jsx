"use client";

import { memo } from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-[rgba(15,23,42,0.35)] dark:bg-[rgba(10,13,20,0.65)] z-50 flex justify-center items-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-surface p-6 sm:p-8 rounded-2xl shadow-elevated max-w-md sm:max-w-lg lg:max-w-2xl w-full relative border border-default transform transition-transform duration-200 ease-out scale-100"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Modal"}
      >
        <div className="flex items-start justify-between mb-4">
          {title ? (
            <h2 className="text-2xl font-semibold text-primary">{title}</h2>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="ml-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full p-1"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <div className="divide-y divide-default/60">
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default memo(Modal);
