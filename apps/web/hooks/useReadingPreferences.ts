"use client";

import * as React from "react";

export type FontSize = "small" | "medium" | "large" | "xlarge";
export type FontFamily = "sans" | "serif" | "mono";
export type LineHeight = "tight" | "normal" | "relaxed";

export interface ReadingPreferences {
  fontSize: FontSize;
  fontFamily: FontFamily;
  lineHeight: LineHeight;
  ambientSound: boolean;
}

const defaultPreferences: ReadingPreferences = {
  fontSize: "medium",
  fontFamily: "sans",
  lineHeight: "normal",
  ambientSound: false,
};

export function useReadingPreferences() {
  const [preferences, setPreferences] = React.useState<ReadingPreferences>(() => {
    if (typeof window === "undefined") return defaultPreferences;
    try {
      const saved = localStorage.getItem("foxstory-reading-prefs");
      if (saved) return JSON.parse(saved) as ReadingPreferences;
    } catch {
      // ignore corrupt storage
    }
    return defaultPreferences;
  });
  // isLoaded is true immediately on the client (lazy init reads localStorage synchronously)
  const isLoaded = typeof window !== "undefined";

  const updatePreference = React.useCallback(
    <K extends keyof ReadingPreferences>(key: K, value: ReadingPreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value };
        localStorage.setItem("foxstory-reading-prefs", JSON.stringify(next));
        return next;
      });
    },
    []
  );

  return { preferences, updatePreference, isLoaded };
}
