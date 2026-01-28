import {
    collection,
    getDocs,
    addDoc,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { EstatusPieza } from '../types';

const COLLECTION_NAME = 'estatus';

export const estatusService = {
    async getAll(): Promise<EstatusPieza[]> {
        const q = query(collection(db, COLLECTION_NAME), orderBy('nombre'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as EstatusPieza));
    },

    async add(nombre: string): Promise<string> {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), { nombre });
        return docRef.id;
    }
};
