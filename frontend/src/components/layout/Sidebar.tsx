'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { clearAuthSession } from '@/lib/auth';
import {
    LayoutDashboard,
    UserCheck,
    Users,
    BarChart3,
    Settings,
    LogOut,
    QrCode,
    ShieldCheck,
    Layers,
    Menu,
    X,
} from 'lucide-react';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const { isSidebarCollapsed, toggleSidebar, isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

    const getMenuItems = () => {
        const baseItems = [
            { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        ];

        switch (user?.role?.toUpperCase()) {
            case 'STUDENT':
                return [
                    ...baseItems,
                    { name: 'Scan Attendance', icon: QrCode, href: '/dashboard/attendance' },
                    { name: 'My History', icon: BarChart3, href: '/dashboard/history' },
                    { name: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
                ];
            case 'TEACHER':
                return [
                    ...baseItems,
                    { name: 'Generate QR', icon: QrCode, href: '/dashboard/qr' },
                    { name: 'Sections', icon: Layers, href: '/dashboard/sections' },
                    { name: 'Attendance List', icon: UserCheck, href: '/dashboard/attendance' },
                    { name: 'Students', icon: Users, href: '/dashboard/users' },
                    { name: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
                ];
            case 'INSTITUTION_ADMIN':
                return [
                    ...baseItems,
                    { name: 'Institutions', icon: ShieldCheck, href: '/admin/institutions' },
                    { name: 'User Management', icon: Users, href: '/admin/users' },
                    { name: 'Attendance & QR', icon: QrCode, href: '/admin/attendance' },
                    { name: 'Reports', icon: BarChart3, href: '/admin/reports' },
                ];
            case 'SUPER_ADMIN':
            case 'ADMIN':
                return [
                    ...baseItems,
                    { name: 'User Management', icon: Users, href: '/admin/users' },
                    { name: 'Institutions', icon: ShieldCheck, href: '/admin/institutions' },
                    { name: 'Attendance & QR', icon: QrCode, href: '/admin/attendance' },
                    { name: 'Reports', icon: BarChart3, href: '/admin/reports' },
                    { name: 'Audit Log', icon: ShieldCheck, href: '/admin/audit-logs' },
                    { name: 'Settings', icon: Settings, href: '/admin/settings' },
                ];
            default:
                return baseItems;
        }
    };

    const menuItems = getMenuItems();

    // On mobile: sidebar is always a full drawer (never collapsed)
    // On desktop: sidebar can be collapsed (icon-only) or expanded
    const isDesktopCollapsed = isSidebarCollapsed;

    return (
        <aside
            className={cn(
                // Base styles
                'h-screen bg-white flex flex-col fixed inset-y-0 left-0 z-[60] transition-all duration-300 ease-in-out shadow-lg border-r border-slate-200',
                // Mobile: off-screen by default, slide in when open — always full width (w-72)
                isMobileMenuOpen
                    ? 'translate-x-0 w-72'
                    : '-translate-x-full',
                // Desktop: override to always visible, collapsed or expanded width
                isDesktopCollapsed
                    ? 'lg:translate-x-0 lg:w-20 lg:shadow-sm'
                    : 'lg:translate-x-0 lg:w-64 lg:shadow-sm',
                // Desktop sticky position
                'lg:sticky lg:top-0 lg:flex-shrink-0'
            )}
        >
            {/* ── Header ── */}
            <div className={cn(
                "h-16 flex items-center border-b border-slate-100 flex-shrink-0 transition-all duration-300 overflow-hidden",
                isDesktopCollapsed ? "justify-center px-0" : "justify-between px-5"
            )}>
                <Link
                    href="/"
                    className="flex items-center gap-3 group cursor-pointer transition-opacity hover:opacity-80"
                >
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                        <img
                            src="/qratten-logos/favicon1.png"
                            alt="QRatten"
                            className="brightness-0 invert"
                            style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                        />
                    </div>
                    {/* Brand name: hidden when desktop collapsed */}
                    <span className={cn(
                        "font-bold text-slate-900 text-lg tracking-tight whitespace-nowrap transition-all duration-300",
                        isDesktopCollapsed ? "hidden" : "block"
                    )}>
                        QRatten
                    </span>
                </Link>

                {/* Close button — mobile only */}
                <button
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                        "lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0",
                        isDesktopCollapsed ? "hidden" : "block"
                    )}
                >
                    <X size={20} />
                </button>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar py-3 px-2 space-y-0.5">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => {
                                if (isMobileMenuOpen) setMobileMenuOpen(false);
                            }}
                            title={isDesktopCollapsed ? item.name : ''}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium',
                                // Center icons when desktop collapsed
                                isDesktopCollapsed && 'lg:justify-center lg:px-2',
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'h-5 w-5 flex-shrink-0',
                                    isActive
                                        ? 'text-white'
                                        : 'text-slate-400 group-hover:text-indigo-600'
                                )}
                            />
                            {/* Label: always visible on mobile drawer, hidden when desktop collapsed */}
                            <span
                                className={cn(
                                    'whitespace-nowrap transition-all duration-300',
                                    isDesktopCollapsed ? 'lg:hidden' : 'block'
                                )}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* ── Footer: Logout ── */}
            <div className="flex-shrink-0 p-2 border-t border-slate-100">
                <button
                    onClick={() => {
                        clearAuthSession();
                        useAuthStore.getState().logout();
                        router.replace('/login');
                    }}
                    title={isDesktopCollapsed ? 'Logout' : ''}
                    className={cn(
                        'flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-sm font-medium',
                        isDesktopCollapsed && 'lg:justify-center lg:px-2'
                    )}
                >
                    <LogOut size={18} className="flex-shrink-0" />
                    <span
                        className={cn(
                            'whitespace-nowrap transition-all duration-300',
                            isDesktopCollapsed ? 'lg:hidden' : 'block'
                        )}
                    >
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
}
