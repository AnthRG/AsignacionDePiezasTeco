import {
    collection,
    getDocs,
    setDoc,
    getDoc,
    doc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { AsignacionPieza, PiezaFilters, ReporteFilters } from '../types';

const COLLECTION_NAME = 'piezas';

// Helper to convert Firestore timestamp to Date
const toDate = (timestamp: Timestamp | Date): Date => {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    return timestamp;
};

export const piezasService = {
    async getAll(filters?: PiezaFilters): Promise<AsignacionPieza[]> {
        // Firestore query - order by fechaRegistro since fechaModificacion may not exist in older docs
        let q = query(collection(db, COLLECTION_NAME), orderBy('fechaRegistro', 'desc'));

        const snapshot = await getDocs(q);
        let results = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                codigo: docSnap.id,
                descripcion: data.descripcion || '',
                usuarioId: data.usuarioId || null,
                estatusId: data.estatusId || null,
                fotoUrl: data.fotoUrl || null,
                fechaRegistro: toDate(data.fechaRegistro),
                fechaModificacion: data.fechaModificacion ? toDate(data.fechaModificacion) : toDate(data.fechaRegistro)
            } as AsignacionPieza;
        });

        // Client-side filtering (Firestore has limitations on compound queries)
        if (filters) {
            if (filters.codigo) {
                const codigoLower = filters.codigo.toLowerCase();
                results = results.filter(p => p.codigo.toLowerCase().includes(codigoLower));
            }
            if (filters.usuarioId) {
                results = results.filter(p => p.usuarioId === filters.usuarioId);
            }
            if (filters.estatusId) {
                results = results.filter(p => p.estatusId === filters.estatusId);
            }
        }

        // Client-side sort by modification date (latest first)
        results.sort((a, b) => {
            const aDate = a.fechaModificacion || a.fechaRegistro;
            const bDate = b.fechaModificacion || b.fechaRegistro;
            return bDate.getTime() - aDate.getTime();
        });

        return results;
    },

    async getAdvanced(filters: ReporteFilters): Promise<AsignacionPieza[]> {
        let q = query(collection(db, COLLECTION_NAME));

        const snapshot = await getDocs(q);
        let results = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                codigo: docSnap.id,
                descripcion: data.descripcion || '',
                usuarioId: data.usuarioId || null,
                estatusId: data.estatusId || null,
                fotoUrl: data.fotoUrl || null,
                fechaRegistro: toDate(data.fechaRegistro),
                fechaModificacion: data.fechaModificacion ? toDate(data.fechaModificacion) : toDate(data.fechaRegistro)
            } as AsignacionPieza;
        });

        // Apply filters
        if (filters.codigo) {
            const codigoLower = filters.codigo.toLowerCase();
            results = results.filter(p => p.codigo.toLowerCase().includes(codigoLower));
        }
        if (filters.descripcion) {
            const descLower = filters.descripcion.toLowerCase();
            results = results.filter(p => p.descripcion.toLowerCase().includes(descLower));
        }
        if (filters.usuarioId) {
            results = results.filter(p => p.usuarioId === filters.usuarioId);
        }
        if (filters.estatusId) {
            results = results.filter(p => p.estatusId === filters.estatusId);
        }
        if (filters.fechaDesde) {
            results = results.filter(p => p.fechaRegistro >= filters.fechaDesde!);
        }
        if (filters.fechaHasta) {
            results = results.filter(p => p.fechaRegistro <= filters.fechaHasta!);
        }

        // Sort
        const sortKey = filters.orderBy;
        results.sort((a, b) => {
            let aVal: string | Date = '';
            let bVal: string | Date = '';

            switch (sortKey) {
                case 'codigo':
                    aVal = a.codigo;
                    bVal = b.codigo;
                    break;
                case 'descripcion':
                    aVal = a.descripcion;
                    bVal = b.descripcion;
                    break;
                case 'usuario':
                    aVal = a.usuarioId || '';
                    bVal = b.usuarioId || '';
                    break;
                case 'estatus':
                    aVal = a.estatusId || '';
                    bVal = b.estatusId || '';
                    break;
                case 'fecha':
                    aVal = a.fechaRegistro;
                    bVal = b.fechaRegistro;
                    break;
                case 'modificacion':
                    aVal = a.fechaModificacion || a.fechaRegistro;
                    bVal = b.fechaModificacion || b.fechaRegistro;
                    break;
                default:
                    // Default to modification date for general ordering
                    aVal = a.fechaModificacion || a.fechaRegistro;
                    bVal = b.fechaModificacion || b.fechaRegistro;
                    break;
            }

            if (aVal < bVal) return filters.orderDesc ? 1 : -1;
            if (aVal > bVal) return filters.orderDesc ? -1 : 1;
            return 0;
        });

        return results;
    },

    async getByCodigo(codigo: string): Promise<AsignacionPieza | null> {
        const docRef = doc(db, COLLECTION_NAME, codigo);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        const data = docSnap.data();
        return {
            codigo: docSnap.id,
            descripcion: data.descripcion || '',
            usuarioId: data.usuarioId || null,
            estatusId: data.estatusId || null,
            fotoUrl: data.fotoUrl || null,
            fechaRegistro: toDate(data.fechaRegistro),
            fechaModificacion: data.fechaModificacion ? toDate(data.fechaModificacion) : toDate(data.fechaRegistro)
        };
    },

    async addOrUpdate(pieza: AsignacionPieza): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, pieza.codigo);
        const existing = await getDoc(docRef);

        await setDoc(docRef, {
            descripcion: pieza.descripcion,
            usuarioId: pieza.usuarioId,
            estatusId: pieza.estatusId,
            fotoUrl: pieza.fotoUrl, // Now expects a direct URL string
            fechaRegistro: existing.exists()
                ? existing.data().fechaRegistro
                : Timestamp.now(),
            fechaModificacion: Timestamp.now()
        });
    },

    // Helper to transform Google Drive links to viewable URLs
    transformGoogleDriveUrl(url: string): string | null {
        if (!url) return null;

        // Extract ID from common Google Drive URL patterns
        // Pattern 1: /file/d/ID/view
        // Pattern 2: id=ID
        let id = '';
        const patterns = [
            /\/file\/d\/([a-zA-Z0-9_-]+)/,
            /id=([a-zA-Z0-9_-]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                id = match[1];
                break;
            }
        }

        if (id) {
            // Return a direct download/thumbnail link that works for <img> tags
            // Using 'lh3.googleusercontent.com' is often more reliable for images than 'drive.google.com/uc'
            // but the standard export=view link is the official way.
            // Using the /uc?export=view&id=ID format for simplicity and general compatibility.
            return `https://drive.google.com/uc?export=view&id=${id}`;
        }

        // If no ID found, return original URL (might be a non-Drive link)
        return url;
    }
};
