"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface UIState {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isInspectorOpen: boolean;
  setInspectorOpen: (open: boolean) => void;
  centerActions: React.ReactNode | null;
  setCenterActions: (actions: React.ReactNode | null) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      isInspectorOpen: false,
      setInspectorOpen: (open) => set({ isInspectorOpen: open }),
      centerActions: null,
      setCenterActions: (actions) => set({ centerActions: actions }),
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "alcatelz-ui-store",
    }
  )
);
