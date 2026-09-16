'use client';

import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Footer from '@/components/layout/Footer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(() => new QueryClient());
    const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
    const isHydrated = useAuthStore((state) => state.isHydrated);

    if (!isHydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f4f6fa]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 smooth-loader text-indigo-600" />
                    <p className="text-slate-500 animate-pulse text-sm font-medium">Establishing secure connection...</p>
                </div>
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            {/* Root wrapper — flex row on desktop, block on mobile */}
            <div className="flex h-screen bg-[#f4f6fa] text-foreground overflow-hidden relative">
                <SearchOverlay />

                {/* Sidebar — takes natural width on desktop, overlays on mobile */}
                <Sidebar />

                {/* Mobile Sidebar Backdrop */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* Main content — full width on mobile (sidebar is overlaid), shares space on desktop */}
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    <TopBar />
                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-150 ease-out">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </QueryClientProvider>
    );
}
