import React, { useEffect, useState } from "react";
import { LayoutGrid, Plus, Users, Briefcase, Heart, ChevronDown, LogOut, X } from "lucide-react";
import { type Workspace, type WorkspaceMember, type Board as BoardType, type List, type BackendWorkspaceNested, type BackendMember } from "../types/Types";
import WorkspaceView from "./WorkspaceView";
import Board from "./Board";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@heroui/react";
import { getCurrentUser } from '../services/authService';
import { getProyectos } from '../services/proyectoService';
import { getTareas } from '../services/tereaService';
import { adaptProyectosToState } from '../utils/adapters';
import type { ReactNode } from 'react';
import HomeSkeleton from './skeletons/HomeSkeleton';
import { createWorkspaceService, deleteWorkspaceService, getWorkspaces, addMemberToWorkspace, updateWorkspaceService, getMisWorkspaces } from '../services/workspaceService';
import { createProyecto } from '../services/proyectoService';
import { type UserSearchResult, searchUsersByEmailPrefix } from '../services/usuarioService';


const Home: React.FC = () => {
    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);/*useState<Workspace[]>([
        {//workspace
            id: "ws-1",
            name: "Mi Empresa",
            description: "Proyectos corporativos",
            type: "empresa",
            members: [//workspace members
                { id: "user-1", name: "Tú", email: "usuario@ejemplo.com", role: "admin" },
                { id: "user-2", name: "Juan Pérez", email: "juan@ejemplo.com", role: "member" },
            ],
            boards: [//proyectos
                {
                    id: "board-ws-1",
                    title: "Desarrollo Q1",
                    workspaceId: "ws-1",
                    lists: [ //tareas
                        { id: "list-1", title: "Pendiente", cards: [] },
                        { id: "list-2", title: "En Progreso", cards: [] },
                        { id: "list-3", title: "Completado", cards: [] },
                    ],
                },
            ],
        },
    ]);*/

    const [personalBoards, setPersonalBoards] = useState<BoardType[]>([]);/*useState<BoardType[]>([
        {//proyectos
            id: "board-demo",
            title: "Proyecto Personal",
            image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=200&fit=crop",
            lists: [//tareas
                { id: "list-1", title: "Pendiente", cards: [] },
                { id: "list-2", title: "En Progreso", cards: [] },
                { id: "list-3", title: "Completado", cards: [] },
            ],
        },
    ]);*/

    const [selectedBoard, setSelectedBoard] = useState<BoardType | null>(null);
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
    const [showCreateBoard, setShowCreateBoard] = useState(false);
    const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState("");
    const [newBoardImage, setNewBoardImage] = useState("");
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [newWorkspaceType, setNewWorkspaceType] = useState<"empresa" | "proyecto" | "familia">("proyecto");
    const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
    const [newWorkspaceMembers, setNewWorkspaceMembers] = useState<string[]>([]);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [user, setUser] = useState<WorkspaceMember | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingProjects, setLoadingProjects] = useState<string | null>(null);
    const [projects, setProjects] = useState<BoardType[] | null>(null);
    const [tasks, setTasks] = useState<List[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);

    const [pendingMembers, setPendingMembers] = useState<UserSearchResult[]>([]);

    // Estado para el input de búsqueda
    const [searchEmail, setSearchEmail] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]); // Lista de sugerencias
    const [showSuggestions, setShowSuggestions] = useState(false); // Mostrar/Ocultar lista


    const workspaceIcons: Record<string, ReactNode> = {
        empresa: <Briefcase size={24} />,
        proyecto: <LayoutGrid size={24} />,
        familia: <Heart size={24} />,
    };

    const createPersonalBoard = async () => {
        if (!newBoardTitle.trim()) return;

        // Validación de seguridad: Necesitamos el usuario para asignarle el proyecto
        if (!user) {
            alert("Error: Usuario no identificado");
            return;
        }
        try {
            const newProjectPayload: BoardType = {
                id: `board-${Date.now()}`,
                title: newBoardTitle,
                image: newBoardImage || undefined,
                workspaceId: undefined, // Es personal
                lists: [
                    { id: `list-${Date.now()}-1`, title: "Pendiente", cards: [] },
                    { id: `list-${Date.now()}-2`, title: "En Progreso", cards: [] },
                    { id: `list-${Date.now()}-3`, title: "Completado", cards: [] },
                ],
            };

            // 3. Llamamos a la API (usando 'any' para evitar pelear con TypeScript si tus tipos no coinciden exacto)
            const savedProject: any = await createProyecto(newProjectPayload as any);

            // 4. Mapeo manual de la respuesta (Java -> Frontend)
            // Convertimos lo que vuelve del backend al formato que usa  home
            const newBoard: BoardType = {
                id: savedProject.id.toString(), // Convertimos ID numérico a string
                title: savedProject.nombre,     // Java: nombre -> React: title
                image: savedProject.image || undefined,
                // Mapeamos las tareas (Java) a lists (React)
                lists: (savedProject.tareas || []).map((t: any) => ({
                    id: t.id.toString(),
                    title: t.titulo, // Java: titulo -> React: title
                    cards: []
                })),
                workspaceId: undefined
            };

            // 5. Actualizamos el estado visual
            setPersonalBoards([...personalBoards, newBoard]);
            setNewBoardTitle("");
            setNewBoardImage("");
            setShowCreateBoard(false);
        } catch (error) {
            console.error("Error creando tablero personal:", error);
            alert("Hubo un error al crear el tablero.");
        }
    };

    const createWorkspaceBoard = async (title: string, image?: string) => {
        // Validaciones
        if (!selectedWorkspace) return;
        if (!user) {
            alert("No se pudo identificar al usuario.");
            return;
        }

        try {
            // 1. Payload para el Backend (Java)
            const newProjectPayload = {
                nombre: title,
                descripcion: "Tablero de Workspace",
                image: image || null,
                workspace: { id: selectedWorkspace.id }, // <--- VINCULACIÓN AL WORKSPACE
                usuario: { id: user.id }, // Dueño del tablero
                tareas: [
                    { titulo: "Pendiente", cards: [] },
                    { titulo: "En Progreso", cards: [] },
                    { titulo: "Completado", cards: [] },
                ]
            };

            // 2. Llamada a la API (createProyecto)
            const savedProject: any = await createProyecto(newProjectPayload as any);

            // 3. Mapeo Manual (Java -> Frontend)
            const newBoard: BoardType = {
                id: savedProject.id.toString(),
                title: savedProject.nombre,
                image: savedProject.image || undefined,
                workspaceId: selectedWorkspace.id,
                lists: (savedProject.tareas || []).map((t: any) => ({
                    id: t.id.toString(),
                    title: t.titulo,
                    cards: []
                })),
            };

            // 4. Actualizar Estado Local
            const updatedWorkspaces = workspaces.map(ws =>
                ws.id === selectedWorkspace.id
                    ? { ...ws, boards: [...(ws.boards || []), newBoard] } // (ws.boards || []) evita error si viene null
                    : ws
            );

            setWorkspaces(updatedWorkspaces);
            setSelectedWorkspace({
                ...selectedWorkspace,
                boards: [...(selectedWorkspace.boards || []), newBoard],
            });

        } catch (error) {
            console.error("Error creando tablero en workspace:", error);
            alert("No se pudo crear el tablero.");
        }
    };

    const createWorkspace = async () => {
        if (!newWorkspaceName.trim()) return;

        try {
            setLoading(true);

            // Extraemos solo los IDs de los usuarios seleccionados (chips)
            const memberIdsToSend = pendingMembers.map(u => Number(u.id));

            // Llamamos al servicio
            const result = await createWorkspaceService(
                newWorkspaceName,
                newWorkspaceDescription,
                newWorkspaceType,
                memberIdsToSend
            );

            console.log("Workspace creado:", result);

            // AQUÍ: Actualiza tu estado local para que se vea el nuevo workspace
            // setWorkspaces(prev => [...prev, result]); 
            // O recarga la lista completa si usas la función adaptProyectosToState

            // Limpieza

            //esto es para que sea más rápido el programa 
            const newWorkspaceFormatted: Workspace = {
                id: result.id,
                name: result.name,
                description: result.description,
                type: result.type as "empresa" | "proyecto" | "familia",
                // Convertimos los miembros del resultado al formato del frontend
                members: (result.members || []).map((m: any) => ({
                    id: m.usuario.id.toString(),
                    name: m.usuario.nombre || m.usuario.username,
                    email: m.usuario.email,
                    role: m.role
                })),
                boards: [] // Nace vacío
            };

            setWorkspaces(prev => [...prev, newWorkspaceFormatted]);

            setShowCreateWorkspace(false);
            setNewWorkspaceName("");
            setNewWorkspaceDescription("");
            setNewWorkspaceType("empresa");
            setPendingMembers([]);



        } catch (error) {
            console.error("Error creando workspace:", error);
            alert("Error al crear el espacio.");
        } finally {
            setLoading(false);
        }
    };

    const updateWorkspace = async (updatedWorkspaceData: Workspace) => {
        try {
            // 1. Llamada a la API
            const result = await updateWorkspaceService(updatedWorkspaceData.id, {
                name: updatedWorkspaceData.name,
                description: updatedWorkspaceData.description,
                type: updatedWorkspaceData.type
            });

            // 2. Fusionar respuesta del backend con datos locales (para no perder boards/members si el backend no los devuelve en el update)
            const mergedWorkspace = {
                ...updatedWorkspaceData, // Mantenemos los datos viejos (como los boards cargados)
                ...result,               // Sobreescribimos nombre/descripción nuevos
                boards: updatedWorkspaceData.boards, // Forzamos mantener los boards locales
                members: updatedWorkspaceData.members // Forzamos mantener los miembros locales
            };

            // 3. Actualizar Estado
            const updatedWorkspaces = workspaces.map(ws =>
                ws.id === mergedWorkspace.id ? mergedWorkspace : ws
            );

            setWorkspaces(updatedWorkspaces);
            setSelectedWorkspace(mergedWorkspace); // Actualizamos la vista actual

        } catch (error) {
            console.error("Error actualizando workspace:", error);
            alert("No se pudo actualizar el espacio.");
        }
    };

    /*if (selectedBoard) {
        /* return (
             <Board
                 board={selectedBoard}
                 setBoard={setSelectedBoard}
                 onBack={() => setSelectedBoard(null)}
             />
         );*/
     //   navigate(`/board/${selectedBoard.id}`, { state: { board: selectedBoard } });
       // return null; // evita doble render
    //}
    const handleSelectWorkspace = (workspace: Workspace) => {
        navigate(`/workspace/${workspace.id}`, { state: { workspace, type: workspace.type } });
    };

    //busqueda de miembros temporal 
    /*const handleAddMember = async () => {
        if (!searchEmail.trim()) return;

        // Evitar duplicados visuales
        if (pendingMembers.some(m => m.email === searchEmail)) {
            alert("Este usuario ya está en la lista de invitación.");
            return;
        }

        try {
            setSearchLoading(true);
            // 1. Buscamos en la BD real
            const foundUser = await searchUserByEmail(searchEmail);

            // 2. Si existe (no entró al catch), lo agregamos a la lista temporal
            setPendingMembers([...pendingMembers, foundUser]);
            setSearchEmail(""); // Limpiamos input

        } catch (error) {
            console.error("Usuario no encontrado", error);
            alert("No se encontró ningún usuario con ese email.");
        } finally {
            setSearchLoading(false);
        }
    };*/

    // buscador 
    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchEmail(query);

        // Solo buscamos si hay más de 1 caracter para no saturar
        if (query.length > 1) {
            try {
                // Llamamos al servicio nuevo
                const results = await searchUsersByEmailPrefix(query);

                // Filtramos los que YA están en la lista de pendientes para no sugerirlos de nuevo
                const filteredResults = results.filter(
                    u => !pendingMembers.some(p => p.id === u.id)
                );

                setSuggestions(filteredResults);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error buscando usuarios", error);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // seleccionar un usuario de la lista
    const selectUser = (user: UserSearchResult) => {
        setPendingMembers([...pendingMembers, user]); // Lo agregamos
        setSearchEmail(""); // Limpiamos input
        setSuggestions([]); // Limpiamos sugerencias
        setShowSuggestions(false); // Ocultamos lista
    };


    if (selectedWorkspace) {
        return (
            <WorkspaceView
                workspace={selectedWorkspace}
                workspaceIcons={workspaceIcons}
                onBack={() => setSelectedWorkspace(null)}
                onSelectBoard={setSelectedBoard}
                onCreateBoard={createWorkspaceBoard}
                onUpdateWorkspace={updateWorkspace}
            />
        );
    }
    useEffect(() => {
        // carga de usuario
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                console.log("datos usuarios ", userData);
                setUser(userData);

            } catch (err) {
                console.error(err);
                setError('No se pudo cargar la información del usuario.');
                // Aquí podrías redirigir al login si falla la autenticación
            } finally {
                setLoading(false);
            }
        };
        //carga de proyectos 
        const loadData = async () => {
            try {
                // 1. Ejecutamos ambas peticiones en paralelo para ganar velocidad
                const [rawWorkspaces, projectsUser] = await Promise.all([
                    getMisWorkspaces(), // Trae TODOS los workspaces (incluidos vacíos)
                    getProyectos()      // Trae los proyectos
                ]);

                // 2. Tu lógica actual: procesa proyectos y crea workspaces "rellenos"
                // 'populatedWorkspaces' solo tiene los workspaces que tienen al menos un proyecto
                const { personal, workspacesArray: populatedWorkspaces } = adaptProyectosToState(projectsUser);

                // 3. FUSIÓN: Creamos la lista final combinando ambas fuentes

                // Creamos un mapa rápido para buscar los workspaces que ya tienen datos
                const populatedMap = new Map(populatedWorkspaces.map(ws => [ws.id, ws]));

                const finalWorkspaces = rawWorkspaces.map((wsBackend: BackendWorkspaceNested) => {
                    // Buscamos si este workspace ya fue creado por el adaptador (porque tenía proyectos)
                    const existingPopulated = populatedMap.get(wsBackend.id);

                    if (existingPopulated) {
                        // CASO A: Tiene proyectos. Usamos el objeto que ya procesó 'adaptProyectosToState'
                        return existingPopulated;
                    } else {
                        // CASO B: Está vacío. Lo convertimos manualmente al formato del frontend.
                        // OJO: Aquí debes aplicar el mismo mapeo de miembros que usas en tu adaptador
                        return {
                            id: wsBackend.id,
                            // Usamos || "" por si vienen undefined del backend
                            name: wsBackend.name || "Sin nombre",
                            description: wsBackend.description || "",
                            type: wsBackend.type || "personal",

                            // Ahora TS sabe que 'members' es un array de BackendMember
                            members: (wsBackend.members || []).map((m: BackendMember) => ({
                                id: m.usuario.id.toString(),
                                name: m.usuario.nombre || m.usuario.username,
                                email: m.usuario.email,
                                role: m.role as "admin" | "member" | "viewer" // Casteo del rol
                            })),

                            boards: [] // <--- La clave: empieza con lista vacía
                        };
                    }
                });

                // 4. Seteamos los estados
                console.log("Tableros personales: ", personal);
                console.log("Workspaces finales (Fusión): ", finalWorkspaces);

                setPersonalBoards(personal);
                setWorkspaces(finalWorkspaces);

            } catch (err) {
                console.error(err);
                setError('No se pudo cargar los proyectos (por ahí no hay).');
            }
        };

        fetchUser();
        loadData();
    }, []);

    if (loading) {
        return <HomeSkeleton />;
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">


            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Workspaces Section */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Espacios de Trabajo</h2>
                            <p className="text-sm text-gray-500 mt-1">Compartidos con tu equipo</p>
                        </div>
                        <button
                            onClick={() => setShowCreateWorkspace(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Crear Espacio
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {workspaces.map((workspace) => (
                            <div
                                key={workspace.id}
                                onClick={() => handleSelectWorkspace(workspace)}
                                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-400"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                        {workspaceIcons[workspace.type] || <Briefcase size={24} />}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        <Users size={14} />
                                        <span>{workspace.members.length}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {workspace.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">{workspace.description || "Sin descripción"}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        {workspace.boards.length} tableros
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectWorkspace(workspace);
                                        }}
                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                    >
                                        Ver →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Personal Boards Section */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Tableros Personales</h2>
                            <p className="text-sm text-gray-500 mt-1">Solo visibles para ti</p>
                        </div>
                        <button
                            onClick={() => setShowCreateBoard(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Crear Tablero
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {personalBoards.map((board) => (
                            <div
                                key={board.id}
                                onClick={() => navigate(`/board/${board.id}`)}
                                className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                            >
                                {board.image ? (
                                    <div
                                        className="h-32 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${board.image})` }}
                                    >
                                        <div className="h-full bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                            <h3 className="text-lg font-bold text-white">{board.title}</h3>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
                                        <h3 className="text-lg font-bold text-white text-center">
                                            {board.title}
                                        </h3>
                                    </div>
                                )}
                                <div className="p-4 bg-white">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <LayoutGrid size={14} />
                                        <span>{board.lists.length} listas</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal: Crear Tablero Personal */}
            {showCreateBoard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Tablero</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del tablero
                                </label>
                                <input
                                    type="text"
                                    value={newBoardTitle}
                                    onChange={(e) => setNewBoardTitle(e.target.value)}
                                    placeholder="Ej: Proyecto de Marketing"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL de imagen (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={newBoardImage}
                                    onChange={(e) => setNewBoardImage(e.target.value)}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            {newBoardImage && (
                                <div className="rounded-lg overflow-hidden">
                                    <img
                                        src={newBoardImage}
                                        alt="Preview"
                                        className="w-full h-32 object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={createPersonalBoard}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition font-medium"
                            >
                                Crear Tablero
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateBoard(false);
                                    setNewBoardTitle("");
                                    setNewBoardImage("");
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Crear Workspace */}
            {showCreateWorkspace && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            Crear Espacio de Trabajo
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del espacio
                                </label>
                                <input
                                    type="text"
                                    value={newWorkspaceName}
                                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                                    placeholder="Ej: Equipo de Desarrollo"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de espacio
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setNewWorkspaceType("empresa")}
                                        className={`p-4 rounded-lg border-2 transition ${newWorkspaceType === "empresa"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <Briefcase
                                            size={24}
                                            className={`mx-auto mb-2 ${newWorkspaceType === "empresa" ? "text-blue-600" : "text-gray-400"
                                                }`}
                                        />
                                        <span className="text-xs font-medium">Empresa</span>
                                    </button>
                                    <button
                                        onClick={() => setNewWorkspaceType("proyecto")}
                                        className={`p-4 rounded-lg border-2 transition ${newWorkspaceType === "proyecto"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <LayoutGrid
                                            size={24}
                                            className={`mx-auto mb-2 ${newWorkspaceType === "proyecto" ? "text-blue-600" : "text-gray-400"
                                                }`}
                                        />
                                        <span className="text-xs font-medium">Proyecto</span>
                                    </button>
                                    <button
                                        onClick={() => setNewWorkspaceType("familia")}
                                        className={`p-4 rounded-lg border-2 transition ${newWorkspaceType === "familia"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <Heart
                                            size={24}
                                            className={`mx-auto mb-2 ${newWorkspaceType === "familia" ? "text-blue-600" : "text-gray-400"
                                                }`}
                                        />
                                        <span className="text-xs font-medium">Familia</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Agregar miembros (opcional)
                                </label>
                                <div className="relative"> {/* 'relative' es importante para posicionar el menú */}
                                    <input
                                        type="text" // Cambiamos a text para que no valide email mientras escribes
                                        value={searchEmail}
                                        onChange={handleSearchChange}
                                        placeholder="Busqueda por mail"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoComplete="off" // Desactiva el autocompletar del navegador
                                    />

                                    {/* LISTA DE SUGERENCIAS FLOTANTE */}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                                            {suggestions.map((user) => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => selectUser(user)}
                                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors"
                                                >
                                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                        {user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-800">
                                                            {user.nombre || "Usuario"}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* LISTA DE MIEMBROS YA SELECCIONADOS (CHIPS) */}
                                {pendingMembers.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                        {pendingMembers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm animate-fadeIn"
                                            >
                                                <span className="text-xs font-bold">
                                                    {user.email.charAt(0).toUpperCase()}
                                                </span>
                                                <span className="max-w-[150px] truncate">
                                                    {user.email}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setPendingMembers(pendingMembers.filter((m) => m.id !== user.id))
                                                    }
                                                    className="hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="max-w-full">
                                <Textarea
                                    value={newWorkspaceDescription}               // <-- valor actual
                                    onChange={(e) => setNewWorkspaceDescription(e.target.value)} // <-- actualización
                                    className="max-w-xs"
                                    description="Ingrese una breve descripción de tu proyecto."
                                    label="Descripción"
                                    placeholder="Ingrese su descripción"
                                    variant="faded"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={createWorkspace}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
                            >
                                Crear Espacio
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateWorkspace(false);
                                    setNewWorkspaceName("");
                                    setNewWorkspaceMembers([]);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;