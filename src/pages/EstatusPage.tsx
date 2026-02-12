import { useState, useEffect } from 'react';
import { Plus, Save, Tag, Loader2, X } from 'lucide-react';
import { estatusService } from '../services/estatusService';
import type { EstatusPieza } from '../types';
export function EstatusPage() {
    const [estatus, setEstatus] = useState<EstatusPieza[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        loadEstatus();
    }, []);
    const loadEstatus = async () => {
        try {
            setLoading(true);
            const data = await estatusService.getAll();
            setEstatus(data);
        } catch (err) {
            setError('Error al cargar estatus');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        if (!nombre.trim()) {
            setError('El nombre es obligatorio');
            return;
        }
        try {
            setSaving(true);
            setError(null);
            await estatusService.add(nombre.trim());
            setNombre('');
            await loadEstatus();
        } catch (err) {
            setError('Error al guardar estatus');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Tag className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Estatus de Piezas</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Define los estados disponibles para las piezas</p>
                </div>
            </div>
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 shadow-md shadow-red-100 dark:shadow-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded"><X className="w-4 h-4" /></button>
                </div>
            )}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Estatus</label>
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ej: En progreso" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" />
                    </div>
                    <div className="flex items-end gap-2">
                        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Guardar
                        </button>
                        <button onClick={() => setNombre('')} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                            <Plus className="w-4 h-4" />
                            Nuevo
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-violet-500 animate-spin" /></div>
                ) : estatus.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">No hay estatus registrados</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Nombre</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {estatus.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                <span className="text-slate-800 dark:text-white">{item.nombre}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
