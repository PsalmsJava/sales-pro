import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Truck, Package, DollarSign, Menu, X, Bell, Moon, Sun,
    LogOut, User, FileText, MapPin, ChevronLeft, Star, Clock, Navigation
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import DispatchOverview from './DispatchOverview';
import AssignedDeliveries from './AssignedDeliveries';
import DeliveryHistory from './DeliveryHistory';
import DispatchEarnings from './DispatchEarnings';

const navigation = [
    { path: '/dispatch/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { path: '/dispatch/dashboard/deliveries', icon: Truck, label: 'Deliveries', badge: '2' },
    { path: '/dispatch/dashboard/history', icon: FileText, label: 'History' },
    { path: '/dispatch/dashboard/earnings', icon: DollarSign, label: 'Earnings' },
];

const DispatchDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('dpSidebarCollapsed') === 'true');
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
    useEffect(() => { localStorage.setItem('dpSidebarCollapsed', sidebarCollapsed); }, [sidebarCollapsed]);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}
            </AnimatePresence>

            <aside className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-brand-950 border-r border-slate-200 dark:border-brand-800 shadow-2xl transition-all duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
        ${sidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-64'}`}>

                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-brand-800">
                    <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/30">
                            <Truck className="h-5 w-5 text-white" />
                        </div>
                        {!sidebarCollapsed && (
                            <div className="hidden lg:block">
                                <h1 className="font-extrabold text-brand-800 dark:text-white text-lg">DispatchPro</h1>
                                <p className="text-[10px] text-teal-600 dark:text-teal-400 uppercase tracking-widest font-bold">Partner</p>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex p-1.5 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-lg">
                        <ChevronLeft className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5"><X className="h-5 w-5 text-slate-500" /></button>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1">
                    {navigation.map((item) => (
                        <NavLink key={item.path} to={item.path} end={item.end}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group relative
                ${isActive ? 'bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/10 text-teal-700 dark:text-teal-400 shadow-sm border border-teal-200/50'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-brand-800/30'}
                ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`}>
                            {({ isActive }) => (
                                <>
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
                                    {!sidebarCollapsed && item.badge && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full">{item.badge}</span>
                                    )}
                                    {isActive && <motion.div layoutId="dpActiveNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-teal-400 to-teal-500 rounded-r-full" />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-slate-200 dark:border-brand-800 space-y-2">
                    {!sidebarCollapsed && (
                        <button onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors text-sm">
                            {isDark ? <Sun className="h-4 w-4 text-gold-500" /> : <Moon className="h-4 w-4 text-brand-600" />}
                            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                    )}
                    <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0 hidden lg:block">
                                <p className="text-sm font-semibold text-brand-800 dark:text-white truncate">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-slate-500 truncate">Dispatch Partner</p>
                            </div>
                        )}
                        {!sidebarCollapsed && (
                            <button onClick={handleLogout} className="p-1.5 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-lg">
                                <LogOut className="h-4 w-4 text-slate-400 hover:text-rose-500" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-[88px]' : 'lg:pl-64'}`}>
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-brand-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-brand-800">
                    <div className="flex items-center justify-between px-4 lg:px-6 h-16">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl">
                            <Menu className="h-5 w-5 text-slate-600" />
                        </button>
                        <h2 className="text-lg font-bold text-brand-800 dark:text-white">Dispatch Dashboard</h2>
                        <div className="flex items-center gap-2">
                            <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl">
                                <Bell className="h-5 w-5 text-slate-500" />
                                <span className="absolute top-1 right-1 h-2 w-2 bg-teal-500 rounded-full" />
                            </button>
                            <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl">
                                {isDark ? <Sun className="h-5 w-5 text-gold-500" /> : <Moon className="h-5 w-5 text-brand-600" />}
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-4 lg:p-6">
                    <Routes>
                        <Route index element={<DispatchOverview />} />
                        <Route path="deliveries" element={<AssignedDeliveries />} />
                        <Route path="history" element={<DeliveryHistory />} />
                        <Route path="earnings" element={<DispatchEarnings />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default DispatchDashboard;