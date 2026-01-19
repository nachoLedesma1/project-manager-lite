import type { BackendProyecto, Workspace, Board, List, Card, CardStatus } from '../types/Types';

export const adaptProyectosToState = (proyectosBackend: BackendProyecto[]) => {

    const personal: Board[] = [];
    // Usamos un Objeto (Map) para agrupar workspaces por ID y evitar duplicados
    const workspaceMap: Record<string, Workspace> = {};

    proyectosBackend.forEach((proj) => {
        // 1. Transformamos las tareas/listas del proyecto
        const formattedLists: List[] = (proj.tareas || []).map(t => ({
            id: t.id.toString(),
            title: t.titulo,
            cards: t.cards ? t.cards.map(c => ({
                id: c.id.toString(),
                title: c.title,
                status: (c.status as CardStatus) || "pendiente",
            })) : []
        }));

        // 2. Creamos el objeto Board (Proyecto)
        const board: Board = {
            id: proj.id.toString(),
            title: proj.nombre,
            image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=200&fit=crop", // Imagen dummy
            lists: formattedLists,
            workspaceId: proj.workspace?.id
        };

        // 3. CLASIFICACIÓN
        if (!proj.workspace) {
            // A) Es personal
            personal.push(board);
        } else {
            // B) Es de Workspace
            const wsData = proj.workspace;
            const wsId = wsData.id;

            // Si este workspace no lo hemos procesado aún, lo inicializamos
            if (!workspaceMap[wsId]) {
                workspaceMap[wsId] = {
                    id: wsId,
                    name: wsData.name || "Sin Nombre",
                    description: wsData.description || "",
                    type: wsData.type || "personal",

                    // --- AQUÍ ESTABA EL ERROR ---
                    members: (wsData.members || []).map(m => ({
                        // CORRECCIÓN: Usamos m.id (ID de la Membresía) en vez de m.usuario.id
                        id: m.id.toString(),

                        name: m.usuario.nombre || m.usuario.username,
                        email: m.usuario.email,
                        role: m.role as "admin" | "member" | "viewer"
                    })),

                    boards: []
                };
            }

            // Agregamos el proyecto actual y le ponemos la ref al workspace
            workspaceMap[wsId].boards.push({
                ...board,
                workspaceId: wsId
            });
        }
    });

    // Convertimos el Map de workspaces de vuelta a un Array
    const workspacesArray = Object.values(workspaceMap);

    return { personal, workspacesArray };
};

//para el board nomá
export const adaptBackendToBoard = (proj: any): Board => {
    // 1. Transformamos tareas -> lists
    // Usamos (proj.tareas || []) para evitar error si viene null

    if (!proj) {
        throw new Error("El proyecto recibido es nulo");
    }

    const formattedLists: List[] = (proj.tareas || []).map((t: any) => ({
        id: t.id.toString(),
        title: t.titulo,
        cards: t.cards ? t.cards.map((c: any) => ({
            id: c.id.toString(),
            title: c.title,
            status: (c.status as CardStatus) || "pendiente",
        })) : []
    }));

    // 2. Retornamos el Board con el formato que el Frontend entiende
    return {
        id: proj.id.toString(),
        title: proj.nombre, // El backend manda 'nombre', el front quiere 'title'
        image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=200&fit=crop",
        lists: formattedLists, // Aquí ya se llaman 'lists',
        // CORRECCIÓN CRÍTICA:
        // Usamos el operador ?. (optional chaining). 
        // Si proj.workspace es null, esto devuelve undefined (correcto para personal).
        // Si proj.workspace existe, devuelve el ID.
        workspaceId: proj.workspace?.id
    };
};