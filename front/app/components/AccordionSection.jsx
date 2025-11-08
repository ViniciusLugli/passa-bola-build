"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function AccordionSection({
  id,
  title,
  children,
  defaultOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef(null);

  // Load saved state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      const savedState = localStorage.getItem(`accordion-${id}`);
      if (savedState !== null) {
        setIsOpen(savedState === "true");
      }
    }
  }, [id]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      localStorage.setItem(`accordion-${id}`, String(isOpen));
    }
  }, [isOpen, id]);

  const toggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleAccordion();
    }
  };

  return (
    <div className="bg-surface border border-default rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={toggleAccordion}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
        id={`accordion-header-${id}`}
        className="w-full flex items-center justify-between p-4 md:p-5 cursor-pointer hover:bg-surface-elevated transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
      >
        <h3 className="text-lg md:text-xl font-semibold text-primary">
          {title}
        </h3>
        <ChevronDown
          className={`h-5 w-5 md:h-6 md:w-6 text-secondary transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Content */}
      <div
        ref={contentRef}
        id={`accordion-content-${id}`}
        role="region"
        aria-labelledby={`accordion-header-${id}`}
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 md:p-6 border-t border-default">{children}</div>
      </div>
    </div>
  );
}
