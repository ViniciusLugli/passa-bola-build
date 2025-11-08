"use client";

import { createContext, useContext, useState } from "react";
import Toast from "@/app/components/ui/Toast";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info", duration = 3000, onClose) => {
    setToast({ message, type, duration, onClose });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => {
            hideToast();
            if (typeof toast.onClose === "function") {
              try {
                toast.onClose();
              } catch (e) {
                console.error("Toast onClose callback error:", e);
              }
            }
          }}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }
  return context;
}
