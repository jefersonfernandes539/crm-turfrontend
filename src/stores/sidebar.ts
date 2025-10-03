import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isExpanded: boolean;
  toggleSidebar: () => void;
  setExpanded: (isExpanded: boolean) => void;
}

const initalState = {
  isExpanded: false,
};

export const useSidebarStore = create(
  persist<SidebarState>(
    (set) => ({
      ...initalState,
      toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
      setExpanded: (isExpanded) => set({ isExpanded }),
    }),
    {
      name: "sidebar",
      partialize: (state) => ({ ...state }),
    }
  )
);
