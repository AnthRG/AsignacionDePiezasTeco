
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env vars
dotenv.config();

// Initialize Firebase
// Note: We need to manually construct the config since import.meta.env is for Vite only
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize SQLite
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../asignacion.db');

console.log(`Opening SQLite database at ${dbPath}...`);
const sqlite = new Database(dbPath, { readonly: true });

async function migrate() {
    try {
        await migrateUsuarios();
        await migrateEstatus();
        await migratePiezas();
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

async function migrateUsuarios() {
    console.log('Migrating Usuarios...');
    const users = sqlite.prepare('SELECT * FROM Usuarios').all();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        await setDoc(doc(db, 'usuarios', user.Id), {
            nombre: user.Nombre,
            nombreUsuario: user.Username || null
        });
    }
    console.log('Usuarios migrated.');
}

async function migrateEstatus() {
    console.log('Migrating Estatus...');
    const statuses = sqlite.prepare('SELECT * FROM Estatus').all();
    console.log(`Found ${statuses.length} statuses.`);

    for (const status of statuses) {
        await setDoc(doc(db, 'estatus', status.Id), {
            nombre: status.Nombre
        });
    }
    console.log('Estatus migrated.');
}

async function migratePiezas() {
    console.log('Migrating Piezas...');
    const piezas = sqlite.prepare('SELECT * FROM Piezas').all();
    console.log(`Found ${piezas.length} pieces.`);

    for (const pieza of piezas) {
        const fechaRegistro = new Date(pieza.FechaRegistro);

        await setDoc(doc(db, 'piezas', pieza.Codigo), {
            codigo: pieza.Codigo,
            descripcion: pieza.Descripcion || '',
            usuarioId: pieza.UsuarioId || null,
            estatusId: pieza.EstatusId || null,
            fotoUrl: pieza.FotoPath || null, // Mapping FotoPath to fotoUrl as requested
            fechaRegistro: Timestamp.fromDate(fechaRegistro)
        });
    }
    console.log('Piezas migrated.');
}

migrate();
