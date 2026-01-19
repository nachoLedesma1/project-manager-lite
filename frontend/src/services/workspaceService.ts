import axios from 'axios';
import type { Workspace, WorkspaceMember } from '../types/Types';

// =================================================================
// 1. CONFIGURACIÓN AXIOS (Tu código)
// =================================================================

const API_URL = "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 2. INTERCEPTOR DE PETICIÓN (Request)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. INTERCEPTOR DE RESPUESTA (Response)
api.interceptors.response.use(
    (response) => response, // Si todo sale bien, pasa
    (error) => {
        // Detectamos errores de autenticación (401 o 403)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Sesión expirada o inválida. Cerrando sesión...");

            // Borramos el token "podrido"
            localStorage.removeItem("token");

            // Redirigimos al login
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// =================================================================
// 4. SERVICIOS DE WORKSPACE
// Conecta con: WorkSpaceController (@RequestMapping("/api/workspace"))
// =================================================================

// GET /api/workspace
export const getWorkspaces = async (): Promise<Workspace[]> => {
    const response = await api.get('/workspace');
    return response.data;
};

// GET /api/workspace/{id}
export const getWorkspaceById = async (id: string): Promise<Workspace> => {
    const response = await api.get(`/workspace/${id}`);
    return response.data;
};

// POST /api/workspace
// Backend espera: { name, description, type }
// No necesitamos una interfaz compleja, solo asegurarnos de enviar los campos que Java espera leer del Map
export const createWorkspaceService = async (
    name: string,
    description: string,
    type: string,
    memberIds: number[]
) => {
    const payload = {
        name,
        description,
        type,
        memberIds // Esto se enviará como un array de números [1, 2, 3]
    };

    // OJO: La URL debe coincidir con tu @RequestMapping("/api/workspace")
    const response = await api.post("/workspace", payload);
    return response.data;
};

// PUT /api/workspace/{id}
export const updateWorkspaceService = async (id: string, data: Partial<Workspace>): Promise<Workspace> => {
    const response = await api.put(`/workspace/${id}`, data);
    return response.data;
};

// DELETE /api/workspace/{id}
export const deleteWorkspaceService = async (id: string): Promise<void> => {
    await api.delete(`/workspace/${id}`);
};

// =================================================================
// 5. SERVICIOS DE MIEMBROS
// Conecta con: WorkspaceMemberController (@RequestMapping("/api/members"))
// =================================================================

// GET /api/members/workspace/{workspaceId}
export const getWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
    const response = await api.get(`/members/workspace/${workspaceId}`);
    return response.data;
};

// POST /api/members
// Backend espera: { workspaceId: string, usuarioId: number, role: string }
export const addMemberToWorkspace = async (workspaceId: string, usuarioId: number, role: string): Promise<WorkspaceMember> => {
    const response = await api.post('/members', {
        workspaceId,
        usuarioId,
        role
    });
    return response.data;
};

// DELETE /api/members/{id}
// Nota: Este ID es el ID de la relación (WorkspaceMember), NO del usuario.
export const removeMemberFromWorkspace = async (memberId: string): Promise<void> => {
    await api.delete(`/members/${memberId}`);
};

export const getMisWorkspaces = async () => {
    const response = await api.get("/workspace/mis-workspaces");
    return response.data;
};

export const updateMemberRole = async (memberId: string | number, newRole: string) => {
    // Asumo que tu backend acepta un PUT o PATCH a /members/{id} con el nuevo rol
    // Ajusta la URL según tu controlador Java
    const response = await api.put(`/members/${memberId}`, {
        role: newRole
    });
    return response.data;
};

// Exportamos la instancia por si se necesita usar directamente en otro lado
export default api;