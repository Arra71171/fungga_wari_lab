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
  const [preferences, setPreferences] = React.useState<ReadingPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("foxstory-reading-prefs");
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
    setIsLoaded(true);
  }, []);

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
