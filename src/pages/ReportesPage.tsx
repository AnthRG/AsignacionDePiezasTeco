import { useState, useEffect } from 'react';
import { FileText, Filter, Download, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { piezasService } from '../services/piezasService';
import { usuariosService } from '../services/usuariosService';
import { estatusService } from '../services/estatusService';
import type { AsignacionPieza, Usuario, EstatusPieza, ReporteFilters } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
export function ReportesPage() {
    const [piezas, setPiezas] = useState<AsignacionPieza[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [estatus, setEstatus] = useState<EstatusPieza[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [filters, setFilters] = useState<ReporteFilters>({
        codigo: '',
        descripcion: '',
        usuarioId: null,
        estatusId: null,
        fechaDesde: null,
        fechaHasta: null,
        orderBy: 'fecha',
        orderDesc: true,
    });
    useEffect(() => {
        loadInitialData();
    }, []);
    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [usuariosData, estatusData] = await Promise.all([
                usuariosService.getAll(),
                estatusService.getAll(),
            ]);
            setUsuarios(usuariosData);
            setEstatus(estatusData);
            await loadPiezas();
        } catch (err) {
            setError('Error al cargar datos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const loadPiezas = async () => {
        try {
            const data = await piezasService.getAdvanced(filters);
            setPiezas(data);
        } catch (err) {
            setError('Error al cargar piezas');
            console.error(err);
        }
    };
    const handleApplyFilters = () => {
        setCurrentPage(1);
        loadPiezas();
    };
    const handleFilterKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleApplyFilters();
        }
    };
    const getUsuarioNombre = (id: string | null) => {
        if (!id) return '-';
        return usuarios.find(u => u.id === id)?.nombre || '-';
    };
    const getEstatusNombre = (id: string | null) => {
        if (!id) return '-';
        return estatus.find(e => e.id === id)?.nombre || '-';
    };
    const handleExportPdf = () => {
        if (piezas.length === 0) {
            setError('No hay datos para exportar');
            return;
        }
        try {
            setExporting(true);
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.setTextColor(88, 28, 135);
            doc.text('Informe de Piezas', 14, 22);
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            const filterLines = [];
            if (filters.codigo) filterLines.push(`Código: ${filters.codigo}`);
            if (filters.descripcion) filterLines.push(`Descripción: ${filters.descripcion}`);
            if (filters.usuarioId) filterLines.push(`Usuario: ${getUsuarioNombre(filters.usuarioId)}`);
            if (filters.estatusId) filterLines.push(`Estatus: ${getEstatusNombre(filters.estatusId)}`);
            if (filters.fechaDesde) filterLines.push(`Desde: ${new Date(filters.fechaDesde).toLocaleDateString()}`);
            if (filters.fechaHasta) filterLines.push(`Hasta: ${new Date(filters.fechaHasta).toLocaleDateString()}`);
            if (filterLines.length > 0) {
                doc.text(`Filtros: ${filterLines.join(' | ')}`, 14, 30);
            }
            doc.text(`Generado: ${new Date().toLocaleString()}`, 14, filterLines.length > 0 ? 36 : 30);
            const tableData = piezas.map(p => [
                p.codigo, p.descripcion || '-', getUsuarioNombre(p.usuarioId), getEstatusNombre(p.estatusId), p.fechaRegistro.toLocaleDateString()
            ]);
            autoTable(doc, {
                head: [['Código', 'Descripción', 'Usuario', 'Estatus', 'Fecha']],
                body: tableData,
                startY: filterLines.length > 0 ? 42 : 36,
                theme: 'striped',
                headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                styles: { fontSize: 9 }
            });
            doc.save(`informe_piezas_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            setError('Error al exportar PDF');
            console.error(err);
        } finally {
            setExporting(false);
        }
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Crear Informes</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Genera reportes con filtros avanzados y exporta a PDF</p>
                </div>
            </div>
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 shadow-md shadow-red-100 dark:shadow-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded"><X className="w-4 h-4" /></button>
                </div>
            )}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-orange-500" />
                    <h2 className="font-semibold text-slate-800 dark:text-white">Filtros Avanzados</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código</label>
                        <input type="text" value={filters.codigo || ''} onChange={(e) => setFilters({ ...filters, codigo: e.target.value })} onKeyDown={handleFilterKeyDown} placeholder="Buscar código" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
                        <input type="text" value={filters.descripcion || ''} onChange={(e) => setFilters({ ...filters, descripcion: e.target.value })} onKeyDown={handleFilterKeyDown} placeholder="Buscar descripción" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usuario</label>
                        <select value={filters.usuarioId || ''} onChange={(e) => setFilters({ ...filters, usuarioId: e.target.value || null })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all">
                            <option value="">Todos</option>
                            {usuarios.map((u) => (<option key={u.id} value={u.id}>{u.nombre}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estatus</label>
                        <select value={filters.estatusId || ''} onChange={(e) => setFilters({ ...filters, estatusId: e.target.value || null })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all">
                            <option value="">Todos</option>
                            {estatus.map((e) => (<option key={e.id} value={e.id}>{e.nombre}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha Desde</label>
                        <input type="date" value={filters.fechaDesde ? new Date(filters.fechaDesde).toISOString().slice(0, 10) : ''} onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value ? new Date(e.target.value) : null })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha Hasta</label>
                        <input type="date" value={filters.fechaHasta ? new Date(filters.fechaHasta).toISOString().slice(0, 10) : ''} onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value ? new Date(e.target.value) : null })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ordenar por:</label>
                        <select value={filters.orderBy} onChange={(e) => setFilters({ ...filters, orderBy: e.target.value as ReporteFilters['orderBy'] })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm">
                            <option value="codigo">Código</option>
                            <option value="descripcion">Descripción</option>
                            <option value="usuario">Usuario</option>
                            <option value="estatus">Estatus</option>
                            <option value="fecha">Fecha Registro</option>
                            <option value="modificacion">Fecha Modificación</option>
                        </select>
                        <select value={filters.orderDesc ? 'desc' : 'asc'} onChange={(e) => setFilters({ ...filters, orderDesc: e.target.value === 'desc' })} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm">
                            <option value="asc">Ascendente</option>
                            <option value="desc">Descendente</option>
                        </select>
                    </div>
                    <div className="flex gap-2 ml-auto">
                        <button onClick={handleApplyFilters} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all">
                            <Filter className="w-4 h-4" />
                            Aplicar Filtros
                        </button>
                        <button onClick={handleExportPdf} disabled={exporting || piezas.length === 0} className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Exportar PDF
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-700/30">
                    <h3 className="font-semibold text-slate-800 dark:text-white">Vista Previa ({piezas.length} registros)</h3>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
                ) : piezas.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">No hay datos con los filtros aplicados</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Código</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Descripción</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Usuario</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Estatus</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {piezas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((pieza) => (
                                    <tr key={pieza.codigo} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{pieza.codigo}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{pieza.descripcion || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{getUsuarioNombre(pieza.usuarioId)}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                {getEstatusNombre(pieza.estatusId)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-500 text-sm">{pieza.fechaRegistro.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && piezas.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-700/30">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, piezas.length)} - {Math.min(currentPage * itemsPerPage, piezas.length)} de {piezas.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Página {currentPage} de {Math.ceil(piezas.length / itemsPerPage)}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(piezas.length / itemsPerPage), p + 1))} disabled={currentPage >= Math.ceil(piezas.length / itemsPerPage)} className="p-2 rounded-lg shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
