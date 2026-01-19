import axios from "axios";
import type { BackendTarea } from "../types/Types";


const API_URL_TAREA = "http://localhost:8080/api/tareas"; 

// obtener tocken del localStorage
const getAuthTocken = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Funciones para interactuar con la API RESTful

export const getTareas = async (): Promise<BackendTarea[]> =>{
    const response = await axios.get(`${API_URL_TAREA}/mis-tareas`, {
        headers: {
            ...getAuthTocken(), 
        },
    });
    return response.data;
};



export const createTarea = async (data: Omit<BackendTarea, 'id'>): Promise<BackendTarea> => {
    const response = await axios.post(API_URL_TAREA, data, {
        headers: {
            "Content-Type": "application/json",
            ...getAuthTocken(),
        },
    });
    return response.data;
};

export const updateTarea = async (id: number, data: Partial<BackendTarea>): Promise<BackendTarea> => {
    const response = await axios.put(`${API_URL_TAREA}/${id}`, data, {
        headers: {
            "Content-Type": "application/json",
            ...getAuthTocken(),
        },
    });
    return response.data;
};

export const deleteTarea = async (id: number): Promise<void> =>{
    await axios.delete(`${API_URL_TAREA}/${id}`, {
        headers: {
            ...getAuthTocken(),
        },
    });
};