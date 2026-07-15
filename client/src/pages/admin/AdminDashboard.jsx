import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Package, Users, Truck, DollarSign,
    Settings, Menu, X, Bell, Moon, Sun, ChevronLeft,
    BarChart3, ShoppingCart, LogOut, TrendingUp, Zap,
    Layers, UserCheck, Building2, Megaphone, Percent,
    Search, Command, ChevronRight, Home, Globe, Activity
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// Import all page components
import AdminOverview from './AdminOverview';
import ProductManagement from './ProductManagement';
import AdSetup from './AdSetup';
import SalesRepManagement from './SalesRepManagement';
import DispatchPartnerManagement from './DispatchPartnerManagement';
import PaymentSettings from './PaymentSettings';
import CommissionSettings from './CommissionSettings';
import OrderManagement from './OrderManagement';

const navigation = [
    {
        section: 'DASHBOARD',
        items: [
            { path: '/admin/dashboard', icon: Home, label: 'Home', end: true },
            { path: '/admin/dashboard/analytics', icon: Activity, label: 'Analytics' },
        ]
    },
    {
        section: 'OPERATIONS',
        items: [
            { path: '/admin/dashboard/products', icon: Package, label: 'Products' },
            { path: '/admin/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
            { path: '/admin/dashboard/ads', icon: Globe, label: 'Marketing' },
        ]
    },
    {
        section: 'PEOPLE',
        items: [
            { path: '/admin/dashboard/sales-reps', icon: UserCheck, label: 'Sales Team' },
            { path: '/admin/dashboard/dispatch', icon: Truck, label: 'Dispatch' },
        ]
    },
    {
        section: 'FINANCE',
        items: [
            { path: '/admin/dashboard/commissions', icon: Percent, label: 'Commissions' },
            { path: '/admin/dashboard/payments', icon: DollarSign, label: 'Payments' },
        ]
    },
    {
        section: 'SYSTEM',
        items: [
            { path: '/admin/dashboard/settings', icon: Settings, label: 'Settings' },
        ]
    },
];

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
    const [searchOpen, setSearchOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef(null);
    const notificationRef = useRef(null);
    const userMenuRef = useRef(null);

    const notifications = [
        { id: 1, text: 'New order #4521 received', time: '2m ago', unread: true },
        { id: 2, text: 'Low stock alert: Wireless Headphones', time: '15m ago', unread: true },
        { id: 3, text: 'Sales rep Emma Johnson hit target', time: '1h ago', unread: false },
        { id: 4, text: 'Dispatch partner verified', time: '3h ago', unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
    useEffect(() => { localStorage.setItem('sidebarCollapsed', sidebarCollapsed); }, [sidebarCollapsed]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notificationRef.current && !notificationRef.current.contains(e.target)) setShowNotifications(false);
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setSearchOpen(false);
                setShowNotifications(false);
                setShowUserMenu(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    const getPageTitle = () => {
        for (const section of navigation) {
            for (const item of section.items) {
                if (location.pathname === item.path || (item.end && location.pathname === '/admin/dashboard' && item.label === 'Home')) return item.label;
            }
        }
        // Check if we're on any admin dashboard sub-route
        if (location.pathname.includes('/admin/dashboard/')) {
            const parts = location.pathname.split('/');
            const lastPart = parts[parts.length - 1];
            return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
        }
        return 'Dashboard';
    };

    const getBreadcrumbs = () => {
        const crumbs = [{ label: 'Home', path: '/admin/dashboard' }];
        if (location.pathname !== '/admin/dashboard') {
            const title = getPageTitle();
            crumbs.push({ label: title, path: location.pathname });
        }
        return crumbs;
    };

    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}
            </AnimatePresence>

            {/* Global Search Modal */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
                        <motion.div initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }}
                            ref={searchRef} onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-brand-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-brand-700">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-brand-700">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input type="text" placeholder="Search products, orders, sales reps..." autoFocus
                                    value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-brand-800 dark:text-white placeholder-slate-400" />
                                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 dark:bg-brand-800 rounded-lg text-slate-500 font-mono">
                                    <span className="text-xs">ESC</span>
                                </kbd>
                            </div>
                            <div className="max-h-80 overflow-y-auto p-2">
                                {globalSearch ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p>Search results for "{globalSearch}"</p>
                                    </div>
                                ) : (
                                    <div className="p-4 text-center">
                                        <p className="text-sm text-slate-500">Start typing to search across the system</p>
                                        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-400">
                                            <span className="flex items-center gap-1"><Command className="w-3 h-3" />K</span>
                                            <span>to open search</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-brand-950 border-r border-slate-200 dark:border-brand-800 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-72'}`}>

                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-brand-800">
                    <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
                        <motion.div whileHover={{ scale: 1.05 }} className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-gold-500/30">
                            <Layers className="h-5 w-5 text-white" />
                        </motion.div>
                        {!sidebarCollapsed && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden lg:block">
                                <h1 className="font-extrabold text-brand-800 dark:text-white text-lg leading-tight tracking-tight">SalesPro</h1>
                                <p className="text-[10px] text-gold-600 dark:text-gold-400 uppercase tracking-[0.2em] font-bold">Enterprise</p>
                            </motion.div>
                        )}
                    </div>
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden lg:flex p-1.5 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-lg transition-colors">
                        <ChevronLeft className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-lg">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {/* Quick Search */}
                {!sidebarCollapsed && (
                    <div className="px-3 pt-3">
                        <button onClick={() => setSearchOpen(true)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-100 dark:bg-brand-800 rounded-xl text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-brand-700 transition-colors">
                            <Search className="w-4 h-4" />
                            <span className="flex-1 text-left">Quick search...</span>
                            <kbd className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-brand-700 rounded text-slate-400 font-mono">⌘K</kbd>
                        </button>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
                    {navigation.map((section) => (
                        <div key={section.section}>
                            {!sidebarCollapsed && (
                                <p className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
                                    {section.section}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {section.items.map((item) => (
                                    <NavLink key={item.path} to={item.path} end={item.end}
                                        className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group relative
                      ${isActive
                                                ? 'bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-800/40 dark:to-brand-800/20 text-brand-700 dark:text-gold-400 shadow-sm border border-brand-200/50 dark:border-brand-700/50'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-brand-800/30 hover:text-brand-700 dark:hover:text-slate-200'
                                            }
                      ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}
                    `}>
                                        {({ isActive }) => (
                                            <>
                                                <div className={`relative ${isActive ? 'text-brand-600 dark:text-gold-400' : ''}`}>
                                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                                </div>
                                                {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
                                                {isActive && (
                                                    <motion.div layoutId="activeNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-brand-600 to-gold-500 dark:from-gold-400 dark:to-gold-500 rounded-r-full"
                                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                                                )}
                                                {sidebarCollapsed && (
                                                    <div className="absolute left-full ml-3 px-3 py-2 bg-brand-900 dark:bg-brand-700 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-xl font-medium">
                                                        {item.label}
                                                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-brand-900 dark:bg-brand-700 rotate-45" />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User Section */}
                <div className="p-3 border-t border-slate-200 dark:border-brand-800 space-y-2">
                    {!sidebarCollapsed && (
                        <button onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors text-sm text-slate-600 dark:text-slate-400">
                            {isDark ? <Sun className="h-4 w-4 text-gold-500" /> : <Moon className="h-4 w-4 text-brand-600" />}
                            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                    )}
                    <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center' : ''}`} ref={userMenuRef}>
                        <button onClick={() => setShowUserMenu(!showUserMenu)}
                            className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg transition-shadow">
                            <span className="text-white text-sm font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                        </button>
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0 hidden lg:block">
                                <p className="text-sm font-semibold text-brand-800 dark:text-white truncate">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-slate-500 truncate capitalize">{user?.role?.replace(/_/g, ' ')}</p>
                            </div>
                        )}
                        {!sidebarCollapsed && (
                            <button onClick={handleLogout} className="p-1.5 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-lg">
                                <LogOut className="h-4 w-4 text-slate-400 hover:text-rose-500 transition-colors" />
                            </button>
                        )}
                    </div>

                    {/* User Dropdown */}
                    <AnimatePresence>
                        {showUserMenu && !sidebarCollapsed && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="bg-white dark:bg-brand-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-700 overflow-hidden">
                                <div className="p-3 border-b border-slate-200 dark:border-brand-700">
                                    <p className="font-semibold text-brand-800 dark:text-white text-sm">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-xs text-slate-500">{user?.email}</p>
                                </div>
                                <div className="p-1">
                                    <button onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-[88px]' : 'lg:pl-72'}`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-brand-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-brand-800">
                    <div className="flex items-center justify-between px-4 lg:px-6 h-16">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl transition-colors">
                                <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </button>

                            {/* Breadcrumbs */}
                            <div className="hidden sm:flex items-center gap-1.5 text-sm">
                                {getBreadcrumbs().map((crumb, i) => (
                                    <React.Fragment key={crumb.path}>
                                        {i > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                                        {i === getBreadcrumbs().length - 1 ? (
                                            <span className="font-semibold text-brand-800 dark:text-white">{crumb.label}</span>
                                        ) : (
                                            <button onClick={() => navigate(crumb.path)} className="text-slate-500 hover:text-brand-600 transition-colors">{crumb.label}</button>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button onClick={() => setSearchOpen(true)}
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-brand-800 rounded-lg text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-brand-700 transition-colors mr-2">
                                <Search className="w-3.5 h-3.5" />
                                <span>Search</span>
                                <kbd className="text-[10px] px-1 py-0.5 bg-white dark:bg-brand-700 rounded text-slate-400 font-mono">⌘K</kbd>
                            </button>

                            <div className="relative" ref={notificationRef}>
                                <button onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl transition-colors">
                                    <Bell className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    {unreadCount > 0 && (
                                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            className="absolute top-1 right-1 h-5 w-5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/25">
                                            {unreadCount}
                                        </motion.span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-80 bg-white dark:bg-brand-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-brand-700 overflow-hidden z-50">
                                            <div className="p-4 border-b border-slate-200 dark:border-brand-700 flex items-center justify-between">
                                                <h3 className="font-semibold text-brand-800 dark:text-white">Notifications</h3>
                                                <span className="text-xs text-gold-600 font-medium">{unreadCount} unread</span>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.map(notif => (
                                                    <div key={notif.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-brand-800/50 transition-colors cursor-pointer ${notif.unread ? 'bg-brand-50/50 dark:bg-brand-800/20' : ''}`}>
                                                        <div className="flex gap-3">
                                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.unread ? 'bg-gold-500' : 'bg-slate-300'}`} />
                                                            <div className="flex-1">
                                                                <p className="text-sm text-brand-800 dark:text-white">{notif.text}</p>
                                                                <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl transition-colors lg:hidden">
                                {isDark ? <Sun className="h-5 w-5 text-gold-500" /> : <Moon className="h-5 w-5 text-brand-600" />}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 12, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -12, scale: 0.99 }}
                            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}>
                            <Routes>
                                <Route index element={<AdminOverview />} />
                                <Route path="analytics" element={<AnalyticsPage />} />
                                <Route path="products" element={<ProductManagement />} />
                                <Route path="orders" element={<OrderManagement />} />
                                <Route path="ads" element={<AdSetup />} />
                                <Route path="sales-reps" element={<SalesRepManagement />} />
                                <Route path="dispatch" element={<DispatchPartnerManagement />} />
                                <Route path="commissions" element={<CommissionSettings />} />
                                <Route path="payments" element={<PaymentSettings />} />
                                <Route path="settings" element={<SettingsPage />} />
                                <Route path="*" element={<AdminOverview />} />
                            </Routes>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

// Inline placeholder pages
const AnalyticsPage = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-brand-100 to-gold-100 dark:from-brand-800 dark:to-gold-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Activity className="w-12 h-12 text-brand-600 dark:text-gold-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-brand-800 dark:text-white mb-2">Advanced Analytics</h3>
            <p className="text-slate-500 max-w-md mx-auto">Coming soon with predictive insights, trend analysis, and performance forecasting.</p>
        </div>
    </div>
);

const SettingsPage = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-brand-800 dark:to-brand-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Settings className="w-12 h-12 text-slate-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-brand-800 dark:text-white mb-2">System Settings</h3>
            <p className="text-slate-500 max-w-md mx-auto">Global application configuration and preferences coming soon.</p>
        </div>
    </div>
);

export default AdminDashboard;