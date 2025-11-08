"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function CommentForm({ initialValue = "", onSubmit, onCancel, submitting = false, autoFocus = false }) {
  const [value, setValue] = useState(initialValue);
  const { isAuthenticated } = useAuth();
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (!value.trim()) return;
    await onSubmit(value.trim());
    setValue("");
  };

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={isAuthenticated ? "Escreva um comentário..." : "Faça login para comentar"}
        className="w-full border rounded-md p-2 resize-none min-h-14 focus:outline-none focus:ring"
        maxLength={1000}
        disabled={!isAuthenticated || submitting}
      />

      <div className="flex items-center justify-end space-x-2 mt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-secondary px-3 py-1">
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={!isAuthenticated || submitting || !value.trim()}
          className="bg-primary text-white px-3 py-1 rounded disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Comentar"}
        </button>
      </div>
    </form>
  );
}
