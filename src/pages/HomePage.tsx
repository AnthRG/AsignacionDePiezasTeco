import { Link } from 'react-router-dom';
import { Package, Users, Tag, FileText, ArrowRight } from 'lucide-react';

const menuItems = [
    {
        to: '/piezas',
        title: 'Asignación de Piezas',
        description: 'Gestiona las piezas, asigna usuarios y actualiza estados',
        icon: Package,
        color: 'from-violet-500 to-purple-600',
        shadowColor: 'shadow-violet-500/25',
    },
    {
        to: '/usuarios',
        title: 'Usuarios',
        description: 'Administra los usuarios del sistema',
        icon: Users,
        color: 'from-blue-500 to-cyan-600',
        shadowColor: 'shadow-blue-500/25',
    },
    {
        to: '/estatus',
        title: 'Estatus de Piezas',
        description: 'Define los estados disponibles para las piezas',
        icon: Tag,
        color: 'from-emerald-500 to-teal-600',
        shadowColor: 'shadow-emerald-500/25',
    },
    {
        to: '/reportes',
        title: 'Crear Informes',
        description: 'Genera reportes con filtros avanzados y exporta a PDF',
        icon: FileText,
        color: 'from-orange-500 to-amber-600',
        shadowColor: 'shadow-orange-500/25',
    },
];

export function HomePage() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center py-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3">
                    Sistema de Asignación de Piezas
                </h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Gestiona, asigna y genera informes de todas las piezas de tu inventario
                    de manera eficiente y organizada.
                </p>
            </div>

            {/* Menu Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map(({ to, title, description, icon: Icon, color, shadowColor }) => (
                    <Link
                        key={to}
                        to={to}
                        className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                    {title}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {description}
                                </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Stats Section (placeholder) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">--</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Piezas</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">--</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Usuarios</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">--</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Estados</div>
                </div>
            </div>
        </div>
    );
}
