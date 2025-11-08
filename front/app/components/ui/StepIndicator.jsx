"use client";

import { memo } from "react";

/**
 * Simple horizontal/stacked step indicator that adapts to screen size.
 */
const StepIndicator = ({ steps = [], currentStep = 1 }) => {
  if (!Array.isArray(steps) || steps.length === 0) return null;

  return (
    <nav aria-label="Progresso" className="w-full">
      <ol className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <li key={stepNumber} className="flex items-start gap-3 sm:items-center">
              <div
                className={`
                  flex
                  items-center
                  justify-center
                  h-9 w-9
                  rounded-full
                  border-2
                  font-semibold
                  transition-colors
                  duration-200
                  ${
                    isCompleted
                      ? "bg-accent border-accent text-on-brand"
                      : isActive
                      ? "border-accent text-accent bg-surface"
                      : "border-default text-secondary bg-surface-muted"
                  }
                `}
                aria-hidden="true"
              >
                {isCompleted ? "✓" : stepNumber}
              </div>
              <div className="flex flex-col">
                <span
                  className={`
                    text-sm
                    uppercase
                    tracking-wide
                    ${
                      isActive || isCompleted
                        ? "text-primary"
                        : "text-secondary"
                    }
                  `}
                >
                  {step?.title ?? `Step ${stepNumber}`}
                </span>
                {step?.description && (
                  <span className="text-sm text-secondary">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default memo(StepIndicator);
