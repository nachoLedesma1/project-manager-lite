import React, { useState } from "react";
import { LayoutGrid, Plus, Users, ArrowLeft, ChevronDown, LogOut } from "lucide-react";
import type { Workspace, Board } from "../types/Types";
import { useLocation, useNavigate } from "react-router-dom";
import ManageMembersModal from "./ManageMembersModal";
import { createProyecto } from "../services/proyectoService";


interface WorkspaceViewProps {
  workspace: Workspace;
  workspaceIcons: { [key: string]: React.ReactNode };
  onBack: () => void;
  onSelectBoard: (board: Board) => void;
  onCreateBoard: (title: string, image?: string) => void;
  onUpdateWorkspace: (workspace: Workspace) => void;
}

const WorkspaceView: React.FC<WorkspaceViewProps> = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const workspace = (location.state as { workspace: Workspace })?.workspace;


  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  //const [showUserMenu, setShowUserMenu] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardImage, setNewBoardImage] = useState("");
  const [currentWorkspace, setCurrentWorkspace] = useState(workspace);
  const [isCreating, setIsCreating] = useState(false); // Estado para loading

  // Si entran directo sin pasar state
  if (!workspace) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold mb-2">Workspace no encontrado</h1>
        <button
          onClick={() => navigate("/home")}
          className="text-blue-600 hover:underline"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const handleUpdateWorkspace = (updatedWorkspace: Workspace) => {
    setCurrentWorkspace(updatedWorkspace);
  };

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;

    try {
      setIsCreating(true);


      // --- CORRECCIÓN CLAVE ---
      // Llamamos al servicio pasando UN objeto, no variables sueltas.
      const savedProyecto = await createProyecto({
        nombre: newBoardTitle,
        descripcion: newBoardImage || "", // Usamos descripción para la imagen por ahora
        workspace: { id: currentWorkspace.id.toString() }, // Vinculamos al workspaces
        tareas: []
      });

      // Mapeamos la respuesta del backend (Java) a tu frontend (React Board)
      const newBoard: Board = {
        id: savedProyecto.id.toString(), // ID real de la BD
        title: savedProyecto.nombre,
        lists: [],
        image: newBoardImage || undefined,
      };

      // Actualizamos el estado visual
      setCurrentWorkspace({
        ...currentWorkspace!,
        boards: [...currentWorkspace!.boards, newBoard],
      });

      // Limpiamos
      setNewBoardTitle("");
      setNewBoardImage("");
      setShowCreateBoard(false);

    } catch (error) {
      console.error("Error creando el tablero:", error);
      alert("No se pudo crear el tablero.");
    } finally {
      setIsCreating(false);
    }
  };

  // Funciones internas
  const onBack = () => navigate("/home");

  const onSelectBoard = (board: Board) => {
    //console.log("Seleccionaste board:", board);
    navigate(`/board/${board.id}`, { state: { board } });
    //return null; // evita doble render
  };

  const onCreateBoard = (title: string, image?: string) => {
    console.log("Crear board:", title, image);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tableros del Espacio</h2>
          <button
            onClick={() => setShowCreateBoard(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <Plus size={18} />
            Crear Tablero
          </button>
        </div>

        {currentWorkspace.boards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay tableros en este espacio de trabajo</p>
            <button
              onClick={() => setShowCreateBoard(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
            >
              Crear primer tablero
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentWorkspace.boards.map((board) => (
              <div
                key={board.id}
                onClick={() => onSelectBoard(board)}
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
        )}
      </div>

      {/* Modal: Crear Tablero */}
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
                onClick={handleCreateBoard}
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

      {/* Modal: Gestionar Miembros */}
      {showManageMembers && (
        <ManageMembersModal
          workspace={currentWorkspace}
          onClose={() => setShowManageMembers(false)}
          onUpdateWorkspace={handleUpdateWorkspace}
        />
      )}
    </div>
  );
};

export default WorkspaceView;