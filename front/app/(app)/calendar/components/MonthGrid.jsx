"use client";
import DayCell from "./DayCell";

export default function MonthGrid({
  viewYear,
  viewMonth,
  cells,
  selectedDate,
  setSelectedDate,
  selectedTypes,
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <div className="min-w-[560px] sm:min-w-0 grid grid-cols-7 text-xs sm:text-sm text-secondary gap-1 sm:gap-2 mb-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="text-center font-medium text-xs sm:text-sm">
            {d}
          </div>
        ))}
      </div>

      <div className="min-w-[560px] sm:min-w-0 grid grid-cols-7 gap-2 sm:gap-3">
        {cells.map((cell, idx) => {
          const key = cell ? cell.date.toISOString().slice(0, 10) : null;
          const isSelected = selectedDate === key;
          return (
            <DayCell
              key={idx}
              cell={cell}
              isSelected={isSelected}
              onSelect={setSelectedDate}
              selectedTypes={selectedTypes}
            />
          );
        })}
      </div>
    </div>
  );
}
