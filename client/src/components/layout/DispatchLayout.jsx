import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Truck, DollarSign, Menu, X, Bell, Moon, Sun, LogOut, FileText, ChevronLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const navigation = [
    { path: '/dispatch/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { path: '/dispatch/dashboard/deliveries', icon: Truck, label: 'Deliveries' },
    { path: '/dispatch/dashboard/history', icon: FileText, label: 'History' },
    { path: '/dispatch/dashboard/earnings', icon: DollarSign, label: 'Earnings' },
];

const DispatchLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('dpSidebarCollapsed') === 'true');
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
    useEffect(() => { localStorage.setItem('dpSidebarCollapsed', sidebarCollapsed); }, [sidebarCollapsed]);
    const handleLogout = () => { logout(); navigate('/login'); };

    const getPageTitle = () => {
        for (const item of navigation) {
            if (location.pathname === item.path || (item.end && location.pathname === '/dispatch/dashboard')) return item.label;
        }
        return 'Dashboard';
    };

    return (
        <div className="flex h-screen overflow-hidden bg-surface-light dark:bg-surface-dark">
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}
            </AnimatePresence>

            <aside className={`fixed lg:relative z-50 h-full bg-white dark:bg-brand-950 border-r border-slate-200 dark:border-brand-800 shadow-2xl transition-all duration-300 flex flex-col flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${sidebarCollapsed ? 'w-[88px]' : 'w-64'}`}>

                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-brand-800 h-16 flex-shrink-0">
                    <div className={`flex items-center gap-3 overflow-hidden ${sidebarCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/30">
                            <Truck className="h-5 w-5 text-white" />
                        </div>
                        {!sidebarCollapsed && (
                            <div className="whitespace-nowrap">
                                <h1 className="font-extrabold text-brand-800 dark:text-white text-lg">DispatchPro</h1>
                                <p className="text-[10px] text-teal-600 dark:text-teal-400 uppercase tracking-widest font-bold">Partner</p>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex p-1.5 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-lg flex-shrink-0">
                        <ChevronLeft className={`h-4 w-4 text-slate-500 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 flex-shrink-0"><X className="h-5 w-5 text-slate-500" /></button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
                    {navigation.map(item => (
                        <NavLink key={item.path} to={item.path} end={item.end} onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                ${isActive ? 'bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/10 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-brand-800/30'}
                ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`}>
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!sidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-slate-200 dark:border-brand-800 flex-shrink-0 space-y-2">
                    {!sidebarCollapsed && (
                        <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors text-sm text-slate-600 dark:text-slate-400">
                            {isDark ? <Sun className="h-4 w-4 text-gold-500" /> : <Moon className="h-4 w-4 text-brand-600" />}
                            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-white text-sm font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-brand-800 dark:text-white truncate">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-slate-500 truncate">Dispatch Partner</p>
                            </div>
                        )}
                        {!sidebarCollapsed && (
                            <button onClick={handleLogout} className="p-1.5 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-lg flex-shrink-0">
                                <LogOut className="h-4 w-4 text-slate-400 hover:text-rose-500" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* STICKY Header */}
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-brand-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-brand-800 flex-shrink-0 shadow-sm">
                    <div className="flex items-center justify-between px-4 lg:px-6 h-16">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl">
                                <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </button>
                            <h2 className="text-lg font-bold text-brand-800 dark:text-white">{getPageTitle()}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl">
                                <Bell className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            </button>
                            <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl">
                                {isDark ? <Sun className="h-5 w-5 text-gold-500" /> : <Moon className="h-5 w-5 text-brand-600" />}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DispatchLayout;