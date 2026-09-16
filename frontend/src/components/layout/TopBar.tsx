'use client';

import { Bell, Search, User, ChevronDown, LogOut, Settings, BarChart, Moon, Sun, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { clearAuthSession } from '@/lib/auth';
import { Button, Input } from '@/components/ui';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn, getAvatarUrl } from '@/lib/utils';

export default function TopBar() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { searchQuery, setSearchQuery, isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<any>(null);
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Session Started', msg: 'A new QR session for Math 101 has begun.', time: '2m ago', type: 'info' },
        { id: 2, title: 'Low Attendance', msg: 'Section B attendance dropped below 75%.', time: '1h ago', type: 'warning' },
        { id: 3, title: 'System Update', msg: 'QRatten v1.2 is now live with profile photos!', time: '5h ago', type: 'success' },
    ]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                useUIStore.getState().setSearchQuery('');
                useUIStore.getState().setSearchOpen(false);
                searchInputRef.current?.blur();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };



    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-4 w-1/2 lg:w-1/3">
                {/* Mobile Toggle */}
                <button 
                    onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                    <Menu size={24} />
                </button>
                {/* Desktop Toggle */}
                <button 
                    onClick={() => useUIStore.getState().toggleSidebar()}
                    className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                    <Menu size={24} />
                </button>

                <div className="relative w-full max-w-sm hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        ref={searchInputRef}
                        placeholder="Search anything..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-12 bg-slate-100 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-indigo-400 focus-visible:border-indigo-300"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </div>
                {/* Mobile Search Icon only */}
                <button className="sm:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                    <Search size={20} />
                </button>
            </div>

            <div className="flex items-center gap-2 lg:gap-6">
                <div className="relative" ref={notificationsRef}>
                    <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={cn(
                            "relative p-2.5 rounded-full transition-all",
                            isNotificationsOpen 
                                ? "bg-indigo-100 text-indigo-600 shadow-inner" 
                                : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-500"
                        )}
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white" />
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 top-full mt-3 w-[340px] bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="p-4 flex items-center justify-between border-b border-indigo-100 bg-[#E8E9FF]">
                                <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
                                <button 
                                    onClick={() => setNotifications([])}
                                    className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"
                                >
                                    Mark all as read
                                </button>
                            </div>
                            
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div 
                                            key={n.id} 
                                            className="p-4 border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer group"
                                            onClick={() => {
                                                setSelectedNotification(n);
                                                setIsNotificationsOpen(false);
                                            }}
                                        >
                                        <div className="flex gap-3">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                                n.type === 'info' ? "bg-primary" :
                                                n.type === 'warning' ? "bg-amber-500" : "bg-green-500"
                                            )} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                                                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{n.msg}</p>
                                            </div>
                                        </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500">
                                        <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm font-medium">No new notifications</p>
                                        <p className="text-xs mt-1 opacity-70">You&apos;re all caught up!</p>
                                    </div>
                                )}
                            </div>
                            
                            {notifications.length > 0 && (
                                <div className="flex border-t border-slate-100 divide-x divide-slate-100 bg-slate-50/50">
                                    <button 
                                        onClick={() => setNotifications([])}
                                        className="flex-1 p-3 text-[10px] font-bold text-center text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:text-red-500 transition-all"
                                    >
                                        Clear All
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsNotificationsOpen(false);
                                            router.push('/profile#notifications');
                                        }}
                                        className="flex-1 p-3 text-[10px] font-bold text-center text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:text-indigo-600 transition-all"
                                    >
                                        View All
                                    </button>
                                </div>
                            )}
                            {notifications.length === 0 && (
                                <button 
                                    onClick={() => {
                                        setIsNotificationsOpen(false);
                                        router.push('/profile#notifications');
                                    }}
                                    className="w-full p-3 text-[10px] font-bold text-center text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:text-indigo-600 transition-all border-t border-slate-100"
                                >
                                    View all notifications
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-border/50" />

                <div className="relative" ref={dropdownRef}>
                    <div 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-2 group cursor-pointer select-none"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold leading-none text-foreground">{user?.name || 'User Profile'}</p>
                            <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">{user?.role}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-primary overflow-hidden transition-transform group-hover:scale-105">
                            {((user as any)?.avatarUrl || (user as any)?.avatar_url) ? (
                                <img src={getAvatarUrl((user as any).avatarUrl || (user as any).avatar_url)} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold">{user?.name ? getInitials(user.name) : <User size={20} />}</span>
                            )}
                        </div>
                        <ChevronDown size={16} className={cn("text-muted-foreground transition-all duration-300 hidden xs:block", isProfileOpen && "rotate-180 text-primary")} />
                    </div>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-3 w-72 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                            {/* Section 1: Identity */}
                             <div className="p-5 flex items-center gap-4 bg-gradient-to-br from-accent/10 to-transparent border-b border-border/50">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold border border-primary/20 overflow-hidden">
                                    {((user as any)?.avatarUrl || (user as any)?.avatar_url) ? (
                                        <img src={getAvatarUrl((user as any).avatarUrl || (user as any).avatar_url)} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name ? getInitials(user.name) : 'U'
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-foreground truncate">{user?.name}</h4>
                                    <p className="text-xs text-muted-foreground truncate mb-1">{user?.email}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full uppercase tracking-tighter border border-primary/10">
                                            {user?.role}
                                        </span>
                                        {user?.id && (
                                            <span className="text-xs text-muted-foreground ml-2">
                                                ID: {user?.id?.toString().slice(0, 8)}...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-border/50" />

                            {/* Section 2: Navigation */}
                            <div className="p-2 space-y-1">
                                {[
                                    { icon: User, label: 'My Profile', sub: 'View and edit your details', href: '/profile' },
                                    { icon: BarChart, label: 'My Activity', sub: 'Sessions and attendance', href: '/profile#activity' },
                                    { icon: Bell, label: 'Notifications', sub: 'Manage your alerts', href: '/profile#notifications' },
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            router.push(item.href);
                                        }}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all text-left group"
                                    >
                                        <div className="p-2 bg-accent/30 rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
                                            <item.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground leading-tight">{item.label}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">{item.sub}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="h-px bg-border/50" />

                            {/* Section 3: Logout */}
                            <div className="p-2">
                                <button
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        clearAuthSession();
                                        useAuthStore.getState().logout();
                                        router.replace('/login');
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 transition-all text-left group"
                                >
                                    <div className="p-2 bg-destructive/10 rounded-lg text-destructive/70 group-hover:text-destructive transition-colors">
                                        <LogOut size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-destructive leading-tight">Logout</p>
                                        <p className="text-[10px] text-destructive/50 mt-0.5 leading-none">Sign out of QRatten</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notification Modal */}
            {selectedNotification && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-start gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                selectedNotification.type === 'info' ? "bg-indigo-100 text-indigo-600" :
                                selectedNotification.type === 'warning' ? "bg-amber-100 text-amber-600" : 
                                "bg-emerald-100 text-emerald-600"
                            )}>
                                <Bell size={20} />
                            </div>
                            <div className="flex-1 pt-1">
                                <h2 className="text-lg font-bold text-slate-800 leading-tight mb-1">{selectedNotification.title}</h2>
                                <p className="text-xs text-slate-500 font-medium">{selectedNotification.time}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedNotification(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 min-h-[100px]">
                            <p className="text-slate-600 text-[15px] leading-relaxed">
                                {selectedNotification.msg}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setSelectedNotification(null)}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
