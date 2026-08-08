"use client";

import { create } from "zustand";

type UIState = {
  search: string;
  activeModal?: string;
  setSearch: (search: string) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  search: "",
  setSearch: (search) => set({ search }),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: undefined })
}));
