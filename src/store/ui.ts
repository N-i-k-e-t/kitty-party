import { create } from "zustand";
import type { ReactNode } from "react";

export type ToastItem = { id: string; title: string; description?: string };

interface UiState {
  toasts: ToastItem[];
  sheetOpen: boolean;
  sheetContent: ReactNode | null;
  pushToast: (t: Omit<ToastItem, "id">) => void;
  dismissToast: (id: string) => void;
  openSheet: (node: ReactNode) => void;
  closeSheet: () => void;
}

let toastCounter = 0;

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  sheetOpen: false,
  sheetContent: null,
  pushToast: (t) =>
    set((s) => {
      toastCounter += 1;
      const id = `toast_${toastCounter}`;
      return { toasts: [...s.toasts, { id, ...t }] };
    }),
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  openSheet: (node) => set({ sheetOpen: true, sheetContent: node }),
  closeSheet: () => set({ sheetOpen: false, sheetContent: null }),
}));
