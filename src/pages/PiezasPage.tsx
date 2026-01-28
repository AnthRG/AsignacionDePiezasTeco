import { useState, useEffect, useRef } from 'react';
import { Package, Save, Search, Plus, Filter, X, ImagePlus, Loader2 } from 'lucide-react';
import { piezasService } from '../services/piezasService';
import { usuariosService } from '../services/usuariosService';
import { estatusService } from '../services/estatusService';
import type { AsignacionPieza, Usuario, EstatusPieza, PiezaFilters } from '../types';

export function PiezasPage() {
    const [piezas, setPiezas] = useState<AsignacionPieza[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [estatus, setEstatus] = useState<EstatusPieza[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<AsignacionPieza>>({
        codigo: '',
        descripcion: '',
        usuarioId: null,
        estatusId: null,
        fotoUrl: null,
    });
    const [displayDate, setDisplayDate] = useState<string>('(auto)');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter state
    const [filters, setFilters] = useState<PiezaFilters>({
        codigo: '',
        usuarioId: null,
        estatusId: null,
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

    const loadPiezas = async (f?: PiezaFilters) => {
        try {
            const data = await piezasService.getAll(f || filters);
            setPiezas(data);
        } catch (err) {
            setError('Error al cargar piezas');
            console.error(err);
        }
    };

    const handleClearForm = () => {
        setFormData({
            codigo: '',
            descripcion: '',
            usuarioId: null,
            estatusId: null,
            fotoUrl: null,
        });
        setDisplayDate('(auto)');
        setPhotoFile(null);
        setPhotoPreview(null);
    };

    const handleSearch = async () => {
        if (!formData.codigo?.trim()) {
            setError('Escribe un código para buscar');
            return;
        }
        try {
            const pieza = await piezasService.getByCodigo(formData.codigo.trim());
            if (!pieza) {
                setError('No se encontró la pieza');
                return;
            }
            loadPieceIntoForm(pieza);
        } catch (err) {
            setError('Error al buscar pieza');
            console.error(err);
        }
    };

    const loadPieceIntoForm = (pieza: AsignacionPieza) => {
        setFormData({
            codigo: pieza.codigo,
            descripcion: pieza.descripcion,
            usuarioId: pieza.usuarioId,
            estatusId: pieza.estatusId,
            fotoUrl: pieza.fotoUrl,
        });
        setDisplayDate(pieza.fechaRegistro.toLocaleString());
        setPhotoPreview(pieza.fotoUrl);
        setPhotoFile(null);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!formData.codigo?.trim()) {
            setError('El código de pieza es obligatorio');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            let fotoUrl = formData.fotoUrl;
            if (photoFile) {
                fotoUrl = await piezasService.uploadPhoto(photoFile);
            }

            const pieza: AsignacionPieza = {
                codigo: formData.codigo.trim(),
                descripcion: formData.descripcion || '',
                usuarioId: formData.usuarioId || null,
                estatusId: formData.estatusId || null,
                fotoUrl: fotoUrl || null,
                fechaRegistro: new Date(),
            };

            await piezasService.addOrUpdate(pieza);
            await loadPiezas();
            setError(null);
            alert('Registro guardado');
        } catch (err) {
            setError('Error al guardar pieza');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleApplyFilters = () => {
        loadPiezas(filters);
    };

    const handleClearFilters = () => {
        const clearedFilters = { codigo: '', usuarioId: null, estatusId: null };
        setFilters(clearedFilters);
        loadPiezas(clearedFilters);
    };

    const getUsuarioNombre = (id: string | null) => {
        if (!id) return '-';
        return usuarios.find(u => u.id === id)?.nombre || '-';
    };

    const getEstatusNombre = (id: string | null) => {
        if (!id) return '-';
        return estatus.find(e => e.id === id)?.nombre || '-';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Asignación de Piezas</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Gestiona las piezas del sistema</p>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Form Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Form Fields */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Código de Pieza *
                                </label>
                                <input
                                    type="text"
                                    value={formData.codigo || ''}
                                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                    placeholder="Ej: P-001"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Descripción
                                </label>
                                <input
                                    type="text"
                                    value={formData.descripcion || ''}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    placeholder="Descripción de la pieza"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Usuario
                                </label>
                                <select
                                    value={formData.usuarioId || ''}
                                    onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value || null })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Seleccionar usuario</option>
                                    {usuarios.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nombre} {u.nombreUsuario ? `(${u.nombreUsuario})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Estatus
                                </label>
                                <select
                                    value={formData.estatusId || ''}
                                    onChange={(e) => setFormData({ ...formData, estatusId: e.target.value || null })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Seleccionar estatus</option>
                                    {estatus.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Fecha/hora: {displayDate}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Guardar
                            </button>
                            <button
                                onClick={handleSearch}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                            >
                                <Search className="w-4 h-4" />
                                Buscar
                            </button>
                            <button
                                onClick={handleClearForm}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Nuevo
                            </button>
                        </div>
                    </div>

                    {/* Right: Photo */}
                    <div className="flex flex-col items-center">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full aspect-square max-w-[200px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all overflow-hidden"
                        >
                            {photoPreview ? (
                                <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <ImagePlus className="w-10 h-10 text-slate-400 mb-2" />
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Agregar foto</span>
                                </>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                        {photoPreview && (
                            <button
                                onClick={() => { setPhotoPreview(null); setPhotoFile(null); setFormData({ ...formData, fotoUrl: null }); }}
                                className="mt-2 text-sm text-red-500 hover:text-red-600"
                            >
                                Eliminar foto
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-violet-500" />
                    <h2 className="font-semibold text-slate-800 dark:text-white">Filtros</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        value={filters.codigo || ''}
                        onChange={(e) => setFilters({ ...filters, codigo: e.target.value })}
                        placeholder="Código"
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                    <select
                        value={filters.usuarioId || ''}
                        onChange={(e) => setFilters({ ...filters, usuarioId: e.target.value || null })}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    >
                        <option value="">Todos los usuarios</option>
                        {usuarios.map((u) => (
                            <option key={u.id} value={u.id}>{u.nombre}</option>
                        ))}
                    </select>
                    <select
                        value={filters.estatusId || ''}
                        onChange={(e) => setFilters({ ...filters, estatusId: e.target.value || null })}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    >
                        <option value="">Todos los estatus</option>
                        {estatus.map((e) => (
                            <option key={e.id} value={e.id}>{e.nombre}</option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <button
                            onClick={handleApplyFilters}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl transition-all"
                        >
                            Aplicar
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                    </div>
                ) : piezas.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        No hay piezas registradas
                    </div>
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
                                {piezas.map((pieza) => (
                                    <tr
                                        key={pieza.codigo}
                                        onClick={() => loadPieceIntoForm(pieza)}
                                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{pieza.codigo}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{pieza.descripcion || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{getUsuarioNombre(pieza.usuarioId)}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                {getEstatusNombre(pieza.estatusId)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-500 text-sm">
                                            {pieza.fechaRegistro.toLocaleDateString()}
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
