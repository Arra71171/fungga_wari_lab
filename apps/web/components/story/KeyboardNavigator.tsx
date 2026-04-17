"use client";

import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

export function KeyboardNavigator() {
  // Mounts the keyboard shortcut listeners
  useKeyboardNavigation();
  return null;
}
