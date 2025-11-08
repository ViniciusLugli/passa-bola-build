"use client";

import { useRef, useEffect } from "react";

export default function ProfileTabs({
  activeTab,
  onTabChange,
  counts = {},
  showRankingTab = false,
}) {
  const tabsRef = useRef(null);
  const activeTabRef = useRef(null);

  // Define all possible tabs
  const allTabs = [
    { id: "ranking", label: "Ranking", showIf: showRankingTab },
    { id: "posts", label: "Posts", count: counts.posts },
    { id: "teams", label: "Times", count: counts.teams },
    { id: "games", label: "Jogos", count: counts.games },
  ];

  // Filter tabs based on showIf condition
  const tabs = allTabs.filter((tab) => {
    if (tab.id === "ranking") {
      return tab.showIf;
    }
    return true; // Show all other tabs
  });

  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const tabElement = activeTabRef.current;
      const containerElement = tabsRef.current;

      if (containerElement.scrollWidth > containerElement.clientWidth) {
        const tabRect = tabElement.getBoundingClientRect();
        const containerRect = containerElement.getBoundingClientRect();

        if (
          tabRect.left < containerRect.left ||
          tabRect.right > containerRect.right
        ) {
          tabElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      }
    }
  }, [activeTab]);

  const handleKeyDown = (e, tabId, index) => {
    let newIndex = index;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        newIndex = index > 0 ? index - 1 : tabs.length - 1;
        break;
      case "ArrowRight":
        e.preventDefault();
        newIndex = index < tabs.length - 1 ? index + 1 : 0;
        break;
      case "Home":
        e.preventDefault();
        newIndex = 0;
        break;
      case "End":
        e.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    const newTab = tabs[newIndex];
    onTabChange(newTab.id);

    // Focus the new tab
    setTimeout(() => {
      const tabElements = tabsRef.current?.querySelectorAll('[role="tab"]');
      if (tabElements && tabElements[newIndex]) {
        tabElements[newIndex].focus();
      }
    }, 0);
  };

  return (
    <div className="border-b border-default">
      <div
        ref={tabsRef}
        role="tablist"
        aria-label="Seções do perfil"
        className="flex overflow-x-auto scrollbar-hide -mb-px gap-1 md:gap-2 md:justify-center"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const hasCount = tab.count !== undefined;
          const displayCount = hasCount ? tab.count : 0;

          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabRef : null}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id, index)}
              className={`flex items-center gap-1.5 px-4 py-3 md:px-6 md:py-4 font-semibold text-sm md:text-base whitespace-nowrap border-b-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-secondary hover:text-primary hover:border-default"
              }`}
              aria-label={
                hasCount ? `${tab.label} (${displayCount})` : tab.label
              }
            >
              <span>{tab.label}</span>
              {hasCount && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors duration-200 ${
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "bg-surface-elevated text-secondary"
                  }`}
                  aria-hidden="true"
                >
                  {displayCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add custom CSS to hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
