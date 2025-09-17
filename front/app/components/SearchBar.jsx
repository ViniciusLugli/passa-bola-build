"use client";
import Image from "next/image";
import { memo } from "react";

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-4">
      <div
        className="
            relative 
            flex-grow
          "
      >
        <input
          type="text"
          placeholder="Pesquise..."
          value={value}
          onChange={onChange}
          className="
                w-full 
                py-4 
                px-6 
                rounded-full 
                border 
                border-gray-300 
                bg-white 
                focus:outline-none 
                focus:border-purple-500
              "
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
  );
};

export default memo(SearchBar);
