"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "passabola_chat_preferences";

const DEFAULT_PREFERENCES = {
  sidebarWidth: 320,
  lastActiveConversation: null,
  notifications: true,
};

export function useChatPreferences() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error("Error loading chat preferences:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  const updatePreferences = (newPrefs) => {
    try {
      const updated = { ...preferences, ...newPrefs };
      setPreferences(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving chat preferences:", error);
    }
  };

  const resetPreferences = () => {
    try {
      setPreferences(DEFAULT_PREFERENCES);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error resetting chat preferences:", error);
    }
  };

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    isLoaded,
  };
}
