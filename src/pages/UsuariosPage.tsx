import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, X, Users, Loader2 } from 'lucide-react';
import { usuariosService } from '../services/usuariosService';
import type { Usuario } from '../types';
export function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ nombre: '', nombreUsuario: '' });
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        loadUsuarios();
    }, []);
    const loadUsuarios = async () => {
        try {
            setLoading(true);
            const data = await usuariosService.getAll();
            setUsuarios(data);
        } catch (err) {
            setError('Error al cargar usuarios');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleNew = () => {
        setSelectedId(null);
        setFormData({ nombre: '', nombreUsuario: '' });
    };
    const handleSelect = (usuario: Usuario) => {
        setSelectedId(usuario.id);
        setFormData({ nombre: usuario.nombre, nombreUsuario: usuario.nombreUsuario });
    };
    const handleSave = async () => {
        if (!formData.nombre.trim()) {
            setError('El nombre es obligatorio');
            return;
        }
        try {
            setSaving(true);
            setError(null);
            if (selectedId) {
                await usuariosService.update(selectedId, formData);
            } else {
                await usuariosService.add(formData);
            }
            handleNew();
            await loadUsuarios();
        } catch (err) {
            setError('Error al guardar usuario');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };
    const handleDelete = async () => {
        if (!selectedId) return;
        if (!confirm('¿Eliminar el usuario seleccionado?')) return;
        try {
            setSaving(true);
            await usuariosService.delete(selectedId);
            handleNew();
            await loadUsuarios();
        } catch (err) {
            setError('Error al eliminar usuario');
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Usuarios</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Administra los usuarios del sistema</p>
                </div>
            </div>
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 shadow-md shadow-red-100 dark:shadow-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Real</label>
                        <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} onKeyDown={handleKeyDown} placeholder="Ej: Juan Pérez" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre de Usuario</label>
                        <input type="text" value={formData.nombreUsuario} onChange={(e) => setFormData({ ...formData, nombreUsuario: e.target.value })} onKeyDown={handleKeyDown} placeholder="Ej: jperez" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar
                    </button>
                    <button onClick={handleNew} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                        <Plus className="w-4 h-4" />
                        Nuevo
                    </button>
                    {selectedId && (
                        <button onClick={handleDelete} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all disabled:opacity-50">
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                        </button>
                    )}
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                    </div>
                ) : usuarios.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">No hay usuarios registrados</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Nombre</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Usuario</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id} onClick={() => handleSelect(usuario)} className={`cursor-pointer transition-colors ${selectedId === usuario.id ? 'bg-violet-50 dark:bg-violet-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                        <td className="px-6 py-4 text-slate-800 dark:text-white">{usuario.nombre}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{usuario.nombreUsuario || '-'}</td>
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
