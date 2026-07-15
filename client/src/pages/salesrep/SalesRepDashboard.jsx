import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Package, TrendingUp, DollarSign, Menu, X, Bell, Moon, Sun,
    LogOut, User, ShoppingCart, BarChart3, Search, ChevronRight, Star, Target,
    Zap, Award, Calendar, Clock, Activity, ChevronLeft
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Overview from './Overview';
import OrdersQueue from './OrdersQueue';
import MyOrders from './MyOrders';
import Earnings from './Earnings';

const navigation = [
    { path: '/sales-rep/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { path: '/sales-rep/dashboard/queue', icon: Clock, label: 'Orders Queue', badge: '5' },
    { path: '/sales-rep/dashboard/my-orders', icon: ShoppingCart, label: 'My Orders', badge: '23' },
    { path: '/sales-rep/dashboard/earnings', icon: DollarSign, label: 'Earnings' },
];

const SalesRepDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('srSidebarCollapsed') === 'true');
    const [showNotifications, setShowNotifications] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const notifRef = useRef(null);

    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
    useEffect(() => { localStorage.setItem('srSidebarCollapsed', sidebarCollapsed); }, [sidebarCollapsed]);
    useEffect(() => {
        const handleClick = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };
    const unreadCount = 3;

    const getPageTitle = () => {
        for (const item of navigation) {
            if (location.pathname === item.path || (item.end && location.pathname === '/sales-rep/dashboard')) return item.label;
        }
        return 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-brand-950 border-r border-slate-200 dark:border-brand-800 shadow-2xl transition-all duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
        ${sidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-64'}`}>

                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-brand-800">
                    <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/30">
                            <Star className="h-5 w-5 text-white" />
                        </div>
                        {!sidebarCollapsed && (
                            <div className="hidden lg:block">
                                <h1 className="font-extrabold text-brand-800 dark:text-white text-lg">SalesPro</h1>
                                <p className="text-[10px] text-gold-600 dark:text-gold-400 uppercase tracking-widest font-bold">Sales Rep</p>
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
                ${isActive ? 'bg-gradient-to-r from-gold-50 to-gold-100 dark:from-gold-900/20 dark:to-gold-900/10 text-gold-700 dark:text-gold-400 shadow-sm border border-gold-200/50'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-brand-800/30'}
                ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`}>
                            {({ isActive }) => (
                                <>
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
                                    {!sidebarCollapsed && item.badge && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 rounded-full">{item.badge}</span>
                                    )}
                                    {isActive && <motion.div layoutId="srActiveNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-gold-400 to-gold-500 rounded-r-full" transition={{ type: 'spring', stiffness: 300 }} />}
                                    {sidebarCollapsed && (
                                        <div className="absolute left-full ml-3 px-3 py-2 bg-brand-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl font-medium">
                                            {item.label} {item.badge && <span className="text-gold-400">({item.badge})</span>}
                                            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-brand-900 rotate-45" />
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-slate-200 dark:border-brand-800 space-y-2">
                    {!sidebarCollapsed && (
                        <button onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors text-sm text-slate-600 dark:text-slate-400">
                            {isDark ? <Sun className="h-4 w-4 text-gold-500" /> : <Moon className="h-4 w-4 text-brand-600" />}
                            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                    )}
                    <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0 hidden lg:block">
                                <p className="text-sm font-semibold text-brand-800 dark:text-white truncate">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-slate-500 truncate">Sales Rep</p>
                            </div>
                        )}
                        {!sidebarCollapsed && (
                            <button onClick={handleLogout} className="p-1.5 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-lg">
                                <LogOut className="h-4 w-4 text-slate-400 hover:text-rose-500 transition-colors" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-[88px]' : 'lg:pl-64'}`}>
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-brand-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-brand-800">
                    <div className="flex items-center justify-between px-4 lg:px-6 h-16">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl">
                                <Menu className="h-5 w-5 text-slate-600" />
                            </button>
                            <h2 className="text-lg font-bold text-brand-800 dark:text-white">{getPageTitle()}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative" ref={notifRef}>
                                <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl">
                                    <Bell className="h-5 w-5 text-slate-500" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 h-5 w-5 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">{unreadCount}</span>
                                    )}
                                </button>
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-72 bg-white dark:bg-brand-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-700 overflow-hidden z-50">
                                            <div className="p-4 border-b"><h3 className="font-semibold">Notifications</h3></div>
                                            <div className="max-h-60 overflow-y-auto">
                                                {['New order assigned #4521', 'Commission earned: $45.00', 'Target achieved!'].map((n, i) => (
                                                    <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-brand-800/50 cursor-pointer">
                                                        <p className="text-sm">{n}</p><p className="text-xs text-slate-500 mt-1">{i + 1}h ago</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl">
                                {isDark ? <Sun className="h-5 w-5 text-gold-500" /> : <Moon className="h-5 w-5 text-brand-600" />}
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-4 lg:p-6">
                    <AnimatePresence mode="wait">
                        <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                            <Routes>
                                <Route index element={<Overview />} />
                                <Route path="queue" element={<OrdersQueue />} />
                                <Route path="my-orders" element={<MyOrders />} />
                                <Route path="earnings" element={<Earnings />} />
                            </Routes>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default SalesRepDashboard;