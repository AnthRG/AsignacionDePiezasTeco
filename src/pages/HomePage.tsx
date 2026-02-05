import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, Tag, FileText, ArrowRight } from 'lucide-react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip,
    LineChart, Line,
    ResponsiveContainer, Legend
} from 'recharts';
import { piezasService } from '../services/piezasService';
import { usuariosService } from '../services/usuariosService';
import { estatusService } from '../services/estatusService';
import type { AsignacionPieza, Usuario, EstatusPieza } from '../types';

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

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#f59e0b', '#64748b', '#ec4899', '#06b6d4'];

const isFinalized = (nombreEstatus: string) =>
    nombreEstatus.toLowerCase().includes('final');

const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        days.push(date);
    }
    return days;
};

const formatDayLabel = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
};

// Modern custom tooltip component
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-xl border border-slate-700/50">
                {label && <p className="text-slate-400 text-xs mb-1">{label}</p>}
                {payload.map((entry, index) => (
                    <p key={index} className="text-white font-semibold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function HomePage() {
    const [counts, setCounts] = useState({ piezas: 0, usuarios: 0, finalizadas: 0 });
    const [loading, setLoading] = useState(true);
    const [piezas, setPiezas] = useState<AsignacionPieza[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [estatus, setEstatus] = useState<EstatusPieza[]>([]);
    const [activeDonutIndex, setActiveDonutIndex] = useState<number | null>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [piezasData, usuariosData, estatusData] = await Promise.all([
                    piezasService.getAll(),
                    usuariosService.getAll(),
                    estatusService.getAll()
                ]);

                setPiezas(piezasData);
                setUsuarios(usuariosData);
                setEstatus(estatusData);

                // Count finalized pieces
                const estatusMapTemp: Record<string, string> = {};
                estatusData.forEach(e => { estatusMapTemp[e.id] = e.nombre; });
                const finalizadasCount = piezasData.filter(p =>
                    p.estatusId && isFinalized(estatusMapTemp[p.estatusId] || '')
                ).length;

                setCounts({
                    piezas: piezasData.length,
                    usuarios: usuariosData.length,
                    finalizadas: finalizadasCount
                });
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Create a map of estatus id -> nombre
    const estatusMap = useMemo(() => {
        const map: Record<string, string> = {};
        estatus.forEach(e => { map[e.id] = e.nombre; });
        return map;
    }, [estatus]);

    // Create a map of usuario id -> nombre
    const usuarioMap = useMemo(() => {
        const map: Record<string, string> = {};
        usuarios.forEach(u => { map[u.id] = u.nombre; });
        return map;
    }, [usuarios]);

    // Pie Chart Data: Piezas por Estado (No Finalizados)
    const pieChartData = useMemo(() => {
        const statusCount: Record<string, number> = {};

        piezas.forEach(pieza => {
            if (pieza.estatusId) {
                const nombre = estatusMap[pieza.estatusId] || 'Desconocido';
                if (!isFinalized(nombre)) {
                    statusCount[nombre] = (statusCount[nombre] || 0) + 1;
                }
            }
        });

        return Object.entries(statusCount).map(([name, value]) => ({
            name,
            value
        }));
    }, [piezas, estatusMap]);

    // Total for donut center
    const donutTotal = useMemo(() => {
        return pieChartData.reduce((sum, item) => sum + item.value, 0);
    }, [pieChartData]);

    // Bar Chart Data: Piezas Finalizadas por Día (últimos 7 días)
    const finalizedByDayData = useMemo(() => {
        const last7Days = getLast7Days();

        return last7Days.map(day => {
            const nextDay = new Date(day);
            nextDay.setDate(nextDay.getDate() + 1);

            const count = piezas.filter(pieza => {
                if (!pieza.fechaModificacion || !pieza.estatusId) return false;
                const nombre = estatusMap[pieza.estatusId] || '';
                if (!isFinalized(nombre)) return false;

                const modDate = new Date(pieza.fechaModificacion);
                return modDate >= day && modDate < nextDay;
            }).length;

            return {
                day: formatDayLabel(day),
                finalizadas: count
            };
        });
    }, [piezas, estatusMap]);

    // Line Chart Data: Actividad por Día (últimos 7 días)
    const activityByDayData = useMemo(() => {
        const last7Days = getLast7Days();

        return last7Days.map(day => {
            const nextDay = new Date(day);
            nextDay.setDate(nextDay.getDate() + 1);

            const count = piezas.filter(pieza => {
                if (!pieza.fechaModificacion) return false;
                const modDate = new Date(pieza.fechaModificacion);
                return modDate >= day && modDate < nextDay;
            }).length;

            return {
                day: formatDayLabel(day),
                modificadas: count
            };
        });
    }, [piezas]);

    // Bar Chart Data: Piezas por Usuario (top 5)
    const piezasByUserData = useMemo(() => {
        const userCount: Record<string, number> = {};

        piezas.forEach(pieza => {
            if (pieza.usuarioId) {
                const nombre = usuarioMap[pieza.usuarioId] || 'Desconocido';
                userCount[nombre] = (userCount[nombre] || 0) + 1;
            }
        });

        return Object.entries(userCount)
            .map(([name, value]) => ({ name, piezas: value }))
            .sort((a, b) => b.piezas - a.piezas)
            .slice(0, 5);
    }, [piezas, usuarioMap]);

    // Get active donut data
    const activeDonutData = activeDonutIndex !== null ? pieChartData[activeDonutIndex] : null;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="py-6">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
                    Dashboard
                </h1>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md">
                    <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                        {loading ? '...' : counts.piezas}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Piezas</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {loading ? '...' : counts.usuarios}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Usuarios</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {loading ? '...' : counts.finalizadas}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Finalizadas</div>
                </div>
            </div>

            {/* Charts Section */}
            {!loading && (
                <div className="space-y-6">
                    {/* Row 1: Donut Chart + Bar Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Donut Chart - Piezas por Estado */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                                Piezas por Estado (No Finalizados)
                            </h3>
                            {pieChartData.length > 0 ? (
                                <div className="relative">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={110}
                                                paddingAngle={2}
                                                dataKey="value"
                                                onMouseEnter={(_, index) => setActiveDonutIndex(index)}
                                                onMouseLeave={() => setActiveDonutIndex(null)}
                                            >
                                                {pieChartData.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                        opacity={activeDonutIndex === null || activeDonutIndex === index ? 1 : 0.4}
                                                        style={{ transition: 'opacity 0.2s ease' }}
                                                    />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center text */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <div
                                                className="text-3xl font-bold text-slate-800 dark:text-white transition-all duration-200"
                                                style={{ color: activeDonutData ? CHART_COLORS[activeDonutIndex! % CHART_COLORS.length] : undefined }}
                                            >
                                                {activeDonutData ? activeDonutData.value : donutTotal}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 max-w-[80px] truncate">
                                                {activeDonutData ? activeDonutData.name : 'Total'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[280px] flex items-center justify-center text-slate-400">
                                    No hay datos disponibles
                                </div>
                            )}
                        </div>

                        {/* Bar Chart - Finalizadas por Día */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                                Piezas Finalizadas (Últimos 7 días)
                            </h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={finalizedByDayData}>
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 12 }}
                                        stroke="#94a3b8"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        stroke="#94a3b8"
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                                    <Bar dataKey="finalizadas" fill="#10b981" radius={[6, 6, 6, 6]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Row 2: Line Chart - Actividad por Día */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                            Actividad por Día (Últimos 7 días)
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={activityByDayData}>
                                <XAxis
                                    dataKey="day"
                                    tick={{ fontSize: 12 }}
                                    stroke="#94a3b8"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    stroke="#94a3b8"
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="modificadas"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
                                    activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Row 3: Bar Chart - Piezas por Usuario */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                            Top 5 Usuarios con más Piezas
                        </h3>
                        {piezasByUserData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={piezasByUserData} layout="vertical">
                                    <XAxis
                                        type="number"
                                        tick={{ fontSize: 12 }}
                                        stroke="#94a3b8"
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fontSize: 12 }}
                                        stroke="#94a3b8"
                                        width={100}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                                    <Bar dataKey="piezas" fill="#3b82f6" radius={[6, 6, 6, 6]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-slate-400">
                                No hay datos disponibles
                            </div>
                        )}
                    </div>
                </div>
            )}

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
        </div>
    );
}
