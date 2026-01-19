import axios from "axios";
import type { UsuarioBackend } from "../types/Types";

const API_URL_USUARIO = "http://localhost:8080/api/usuarios"; 

export interface UserSearchResult {
    id: number;
    email: string;
    nombre?: string;
    username?: string;
}

// obtenemos tocken del localStorage
const getAuthToken = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Funciones para interactuar con la API RESTful

export const getUsuarios = async (): Promise<UsuarioBackend[]> => {
    const response = await axios.get(API_URL_USUARIO, {
        headers: {
            ...getAuthToken(),
        },
    });
    return response.data;
};

export const createUsuario = async (data: UsuarioBackend): Promise<UsuarioBackend> => {
    const response = await axios.post(API_URL_USUARIO, data, {
        headers: {
            "Content-Type": "application/json",
            ...getAuthToken(),
        },
    });
    return response.data;
};

export const updateUsuario = async (id: number, data: UsuarioBackend): Promise<UsuarioBackend> => {
    const response = await axios.put(`${API_URL_USUARIO}/${id}`, data, {
        headers: {
            "Content-Type": "application/json",
            ...getAuthToken(),
        },
    });
    return response.data;
};

export const deleteUsuario = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL_USUARIO}/${id}`, {
        headers: {
            ...getAuthToken(),
        },
    });
};


export const searchUsersByEmailPrefix = async (query: string): Promise<UserSearchResult[]> => {

    const response = await axios.get(`${API_URL_USUARIO}/buscar?email=${query}`, {
        headers: {
            ...getAuthToken(),
        },
    });
    return response.data; // Esto ahora es un Array: [{id: 1, email: "nacho..."}, ...]
};

