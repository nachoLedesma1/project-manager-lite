import axios from "axios";
import type { Card, Board } from "../types/Types";

// 1. Configuración base de Axios
const API_URL = "http://localhost:8080/api";//ver si no va cards 

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json", 
    },
});
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

// DTO para crear/editar (puedes reutilizar Partial<Card>)
interface CardDTO {
    title?: string;
    description?: string;
    status?: string;
    position?: number;
}

export const createCard = async (listId: string | number, cardData: CardDTO): Promise<Card> => {
    // Backend espera: POST /api/cards/list/{tareaId}
    const response = await api.post(`/cards/list/${listId}`, cardData);
    return response.data;
};

export const updateCard = async (cardId: string | number, cardData: CardDTO): Promise<Card> => {
    // Backend espera: PUT /api/cards/{id}
    const response = await api.put(`/cards/${cardId}`, cardData);
    return response.data;
};

export const deleteCard = async (cardId: string | number): Promise<void> => {
    // Backend espera: DELETE /api/cards/{id}
    await api.delete(`/cards/${cardId}`);
};

export const moveCard = async (cardId: string | number, newListId: string | number): Promise<Card> => {
    // Backend espera: PUT /api/cards/{id}/move/{newTareaId}
    const response = await api.put(`/cards/${cardId}/move/${newListId}`);
    return response.data;
};

export const getBoardById = async (id: string | number): Promise<Board> => {
    // Busca el proyecto por la id (ponele)
    //console.log("Intentando buscar proyecto con ID:", id);
    const response = await api.get(`/proyectos/${id}`); 
    //console.log("Respuesta recibida del backend:", response.data);
    return response.data; 
};