import { Outlet, NavLink } from 'react-router-dom';
import { Package, Users, Tag, FileText, Home } from 'lucide-react';

const navItems = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/piezas', label: 'Piezas', icon: Package },
    { to: '/usuarios', label: 'Usuarios', icon: Users },
    { to: '/estatus', label: 'Estatus', icon: Tag },
    { to: '/reportes', label: 'Reportes', icon: FileText },
];

export function Layout() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-violet-500/25">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                                    Asignación de Piezas
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Sistema de gestión
                                </p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map(({ to, label, icon: Icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50'
                                        }`
                                    }
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-around py-2">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${isActive
                                    ? 'text-violet-600 dark:text-violet-400'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
                <Outlet />
            </main>
        </div>
    );
}
