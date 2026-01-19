import axios from 'axios';

export const getCurrentUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const response = await axios.get("http://localhost:8080/api/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error  obteniendo usuario", error);
        return null;
    }
}