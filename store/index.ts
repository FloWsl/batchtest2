import { create } from 'zustand';

interface StoreState {
  activeMenuId: string | null;
  setActiveMenu: (menuId: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  activeMenuId: null,
  setActiveMenu: (menuId) => set({ activeMenuId: menuId }),
}));