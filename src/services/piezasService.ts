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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
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
                fechaRegistro: toDate(data.fechaRegistro)
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
                fechaRegistro: toDate(data.fechaRegistro)
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
                default:
                    aVal = a.fechaRegistro;
                    bVal = b.fechaRegistro;
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
            fechaRegistro: toDate(data.fechaRegistro)
        };
    },

    async addOrUpdate(pieza: AsignacionPieza): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, pieza.codigo);
        const existing = await getDoc(docRef);

        await setDoc(docRef, {
            descripcion: pieza.descripcion,
            usuarioId: pieza.usuarioId,
            estatusId: pieza.estatusId,
            fotoUrl: pieza.fotoUrl,
            fechaRegistro: existing.exists()
                ? existing.data().fechaRegistro
                : Timestamp.now()
        });
    },

    async uploadPhoto(file: File): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `fotos/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);

        return downloadUrl;
    }
};
