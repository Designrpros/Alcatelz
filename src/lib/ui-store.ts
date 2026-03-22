"use client";

import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isInspectorOpen: boolean;
  setInspectorOpen: (open: boolean) => void;
  centerActions: React.ReactNode | null;
  setCenterActions: (actions: React.ReactNode | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  isInspectorOpen: false,
  setInspectorOpen: (open) => set({ isInspectorOpen: open }),
  centerActions: null,
  setCenterActions: (actions) => set({ centerActions: actions }),
}));
