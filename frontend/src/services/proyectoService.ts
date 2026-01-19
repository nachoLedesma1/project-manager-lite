import axios from "axios";
import type { BackendProyecto } from "../types/Types";

// 1. Configuración base de Axios
const API_URL = "http://localhost:8080/api/proyectos";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 2. INTERCEPTOR DE PETICIÓN (Request)
// Antes de que salga la petición, le pegamos el token automáticamente
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
// Si el backend nos responde con error, revisamos si fue por token vencido
api.interceptors.response.use(
    (response) => response, // Si todo sale bien, pasa
    (error) => {
        // Detectamos errores de autenticación (401 o 403)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Sesión expirada o inválida. Cerrando sesión...");
            
            // Borramos el token "podrido"
            localStorage.removeItem("token");
            
            // Redirigimos al login (fuerza bruta para asegurar que se limpie el estado)
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// --- FUNCIONES DEL SERVICIO (Ahora mucho más limpias) ---

export const getProyectos = async (): Promise<BackendProyecto[]> => {
    // Ya no necesitas pasar headers manuales, 'api' lo hace solo
    const response = await api.get("/mis-proyectos");
    return response.data;
};

// Esto significa: "Pásame un proyecto, pero NO necesito que traiga ID"
export const createProyecto = async (data: Omit<BackendProyecto, 'id'>): Promise<BackendProyecto> => {
    const response = await api.post("", data);
    return response.data;
};

export const updateProyecto = async (id: number, data: BackendProyecto): Promise<BackendProyecto> => {
    const response = await api.put(`/${id}`, data);
    return response.data;
};

export const deleteProyecto = async (id: number): Promise<void> => {
    await api.delete(`/${id}`);
};