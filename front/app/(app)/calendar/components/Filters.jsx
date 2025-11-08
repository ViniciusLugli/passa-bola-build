"use client";
import { getGameTypeLabel } from "@/app/lib/gameUtils";

export default function Filters({ availableTypes, selectedTypes, toggleType }) {
  if (!availableTypes || availableTypes.length === 0) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
      {availableTypes.map((t) => (
        <button
          key={t}
          onClick={() => toggleType(t)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            selectedTypes.includes(t)
              ? "bg-accent text-on-brand border-accent"
              : "bg-surface text-primary border-default"
          }`}
        >
          {getGameTypeLabel(t)}
        </button>
      ))}
    </div>
  );
}
