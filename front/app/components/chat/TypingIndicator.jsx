"use client";

export default function TypingIndicator({ userName }) {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-surface-muted border border-default">
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">
            {userName} está digitando
          </span>
          <div className="flex gap-1">
            <div
              className="w-2 h-2 bg-accent rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-accent rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-accent rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
