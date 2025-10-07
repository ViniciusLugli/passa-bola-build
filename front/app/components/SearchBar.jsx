"use client";
import Image from "next/image";
import { memo, useState, useEffect } from "react";

const FILTERS = [
  { key: "posts", label: "Post" },
  { key: "spectators", label: "Espectador" },
  { key: "organizations", label: "Organização" },
  { key: "players", label: "Jogadora" },
];

const SearchBar = ({ value, onChange, onFiltersChange, selectedFilters }) => {
  const [localSelected, setLocalSelected] = useState(() =>
    Array.isArray(selectedFilters) ? selectedFilters : []
  );

  useEffect(() => {
    const next = Array.isArray(selectedFilters) ? selectedFilters : [];
    setLocalSelected((prev) => {
      const equal =
        prev.length === next.length && prev.every((v, i) => v === next[i]);
      return equal ? prev : next;
    });
  }, [selectedFilters]);

  const toggleFilter = (key) => {
    const exists = localSelected.includes(key);
    const next = exists
      ? localSelected.filter((k) => k !== key)
      : [...localSelected, key];
    setLocalSelected(next);
    if (onFiltersChange) onFiltersChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Pesquise..."
            value={value}
            onChange={onChange}
            className="w-full py-4 px-6 rounded-full border border-gray-300 bg-white focus:outline-none focus:border-purple-500"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            <Image
              src="/icons/lupa.svg"
              alt="lupa"
              width={24}
              height={24}
              priority
            />
          </button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        {FILTERS.map((f) => {
          const active = localSelected.includes(f.key);
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => toggleFilter(f.key)}
              className={`py-1.5 px-3 rounded-full border transition-colors text-sm ${
                active
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default memo(SearchBar);
