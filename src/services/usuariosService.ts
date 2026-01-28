import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Usuario } from '../types';

const COLLECTION_NAME = 'usuarios';

export const usuariosService = {
    async getAll(): Promise<Usuario[]> {
        const q = query(collection(db, COLLECTION_NAME), orderBy('nombre'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Usuario));
    },

    async add(data: Omit<Usuario, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
        return docRef.id;
    },

    async update(id: string, data: Partial<Omit<Usuario, 'id'>>): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, data);
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    }
};
