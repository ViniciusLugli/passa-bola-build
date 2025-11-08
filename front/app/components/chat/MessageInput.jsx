"use client";

import { useState } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-surface">
      <div className="flex gap-3 items-end">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          disabled={disabled}
          rows={1}
          className="
            flex-1
            resize-none
            border
            border-default
            bg-surface
            text-primary
            placeholder:text-tertiary
            rounded-xl
            px-4
            py-3
            focus:outline-none
            focus:ring-2
            focus:ring-accent
            focus:border-accent
            disabled:bg-surface-muted
            disabled:cursor-not-allowed
            transition-all
            duration-200
            text-base
            leading-5
          "
          style={{ minHeight: "44px", maxHeight: "120px" }}
          onInput={(e) => {
            e.target.style.height = "44px";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
        />

        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="
            w-11
            h-11
            bg-accent
            text-on-brand
            rounded-xl
            font-medium
            hover:bg-accent-strong
            active:scale-95
            disabled:opacity-60
            disabled:cursor-not-allowed
            transition-all
            duration-200
            shrink-0
            flex
            items-center
            justify-center
            touch-manipulation
          "
          aria-label="Enviar mensagem"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
