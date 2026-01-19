// ==========================================
// 1. MODELOS DEL BACKEND (Lo que llega de Java)
// ==========================================

export interface UsuarioBackend {
    id: number;
    username: string;
    nombre: string | null;
    email: string;
    rol: string;
}

export interface BackendMember {
    id: number;
    role: string;
    usuario: {
        id: number;
        username: string;
        nombre?: string;
        email: string;
    };
}

export interface BackendWorkspace {
    id: string; // "ws-1"
    nombre: string;
    descripcion: string;
    type: string;
    members: BackendMember[];
}

export interface BackendCard {
    id: number;
    title: string;
    description?: string;
    status: string;
    position?: number;
}

export interface BackendTarea {
    id: number;
    titulo: string;
    cards: BackendCard[];
   
    proyecto?: { 
        id: number 
    };

}

// Este es el objeto principal que devuelve tu endpoint /mis-proyectos
export interface BackendProyecto {
    id: number;
    nombre: string;
    descripcion: string;
    tareas?: BackendTarea[]; // Estas actúan como tus columnas/listas iniciales
    usuario?: { id: number };
    workspace?: BackendWorkspaceNested;
}

export interface BackendWorkspaceNested {
  id: string;          // UUID es String
  name?: string;        // Java: private String name;
  description?: string; // Java: private String description;
  type?: string;        // Java: private String type;
  members?: BackendMember[];
}


// ==========================================
// 2. MODELOS DEL FRONTEND (Estado de React)
// ==========================================

// --- Tarjetas (Items dentro de las listas) ---
export type CardStatus = "pendiente" | "en-proceso" | "completado";

export interface Card {
    id: string;
    title: string;
    status?: CardStatus;
    assignees?: string[];
    owner?: string | null;
}

// --- Listas (Columnas del tablero) ---
export interface List {
    id: string;
    title: string;
    cards: Card[];
}

// --- Tableros (Proyectos visuales) ---
export interface Board {
    id: string; // Frontend prefiere IDs como string
    title: string;
    image?: string;
    lists: List[];
    workspaceId?: string; // Referencia opcional para saber a qué WS pertenece
}

// --- Miembros (Formato simplificado para mostrar en UI) ---
export interface WorkspaceMember {
    id: number | string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

// --- Espacios de Trabajo (Agrupador principal) ---
export interface Workspace {
    id: string;
    name: string;
    description: string;
    type: string;
    members: WorkspaceMember[];
    boards: Board[]; // Los proyectos que pertenecen a este workspace
}