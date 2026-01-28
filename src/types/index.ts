// Data Models

export interface Usuario {
    id: string;
    nombre: string;
    nombreUsuario: string;
}

export interface EstatusPieza {
    id: string;
    nombre: string;
}

export interface AsignacionPieza {
    codigo: string; // Primary Key
    descripcion: string;
    usuarioId: string | null;
    estatusId: string | null;
    fotoUrl: string | null;
    fechaRegistro: Date;
}

// Form filter types
export interface PiezaFilters {
    codigo?: string;
    usuarioId?: string | null;
    estatusId?: string | null;
}

export interface ReporteFilters extends PiezaFilters {
    descripcion?: string;
    fechaDesde?: Date | null;
    fechaHasta?: Date | null;
    orderBy: 'codigo' | 'descripcion' | 'usuario' | 'estatus' | 'fecha';
    orderDesc: boolean;
}
