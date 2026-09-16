import { create } from 'zustand';

interface UIState {
    searchQuery: string;
    isSearchOpen: boolean;
    isSidebarCollapsed: boolean;
    isMobileMenuOpen: boolean;
    setSearchQuery: (query: string) => void;
    setSearchOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    searchQuery: '',
    isSearchOpen: false,
    isSidebarCollapsed: false,
    isMobileMenuOpen: false,
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSearchOpen: (open) => set({ isSearchOpen: open }),
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
    setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
}));
