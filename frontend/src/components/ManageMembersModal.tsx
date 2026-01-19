import { useEffect, useState } from "react";
import { X, Search, UserPlus, Trash2, Loader2, Shield, ChevronDown } from "lucide-react";
import type { BackendMember, UsuarioBackend, Workspace, WorkspaceMember } from "../types/Types";
import { searchUsersByEmailPrefix, type UserSearchResult } from "../services/usuarioService";
import { addMemberToWorkspace, removeMemberFromWorkspace, updateMemberRole } from "../services/workspaceService";
import { getCurrentUser } from "../services/authService";

interface Props {
  workspace: Workspace;
  onClose: () => void;
  onUpdateWorkspace: (workspace: Workspace) => void;
}

// Configuración de roles y colores
const ROLE_OPTIONS = [
  { value: "admin", label: "Administrador", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "editor", label: "Editor", color: "bg-green-50 text-green-700 border-green-200" },
  { value: "member", label: "Miembro", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "viewer", label: "Visualizador", color: "bg-gray-50 text-gray-700 border-gray-200" },
];

const ManageMembersModal: React.FC<Props> = ({ workspace, onClose, onUpdateWorkspace }) => {
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Estados de carga
  const [isAdding, setIsAdding] = useState(false);
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null); // Para cambiar rol

  // Estado del usuario actual (para no auto-eliminarse)
  const [currentUser, setCurrentUser] = useState<UsuarioBackend | null>(null);

  //carga el usuario apenas se monta el componente
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error cargando usuario actual", error);
      }
    };
    loadUser();
  }, []);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchEmail(query);

    if (query.length > 1) {
      try {
        const results = await searchUsersByEmailPrefix(query);

        // Filtramos para NO mostrar usuarios que ya son miembros
        const currentEmails = workspace.members.map(m => m.email);
        const filtered = results.filter(u => !currentEmails.includes(u.email));

        setSuggestions(filtered);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error buscando usuarios", error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddUser = async (user: UserSearchResult) => {
    try {
      setIsAdding(true);
      setShowSuggestions(false); // Ocultar menú

      // Llamada al Backend
      const response = await addMemberToWorkspace(workspace.id, Number(user.id), "member");

      const newMemberBackend = response as unknown as BackendMember;

      // Adaptar respuesta al frontend
      const newMember: WorkspaceMember = {
        id: newMemberBackend.id.toString(), // ID de la relación
        name: newMemberBackend.usuario.nombre || newMemberBackend.usuario.username,
        email: newMemberBackend.usuario.email,
        role: newMemberBackend.role
      };

      // Actualizar estado visual
      onUpdateWorkspace({
        ...workspace,
        members: [...workspace.members, newMember]
      });

      // Limpiar input
      setSearchEmail("");
      setSuggestions([]);

    } catch (error) {
      console.error("Error al agregar miembro:", error);
      alert("No se pudo agregar al usuario.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      setUpdatingRoleId(memberId);

      // Llamada al backend
      await updateMemberRole(memberId, newRole);

      // Actualizar estado local
      const updatedMembers = workspace.members.map(m =>
        m.id.toString() === memberId ? { ...m, role: newRole } : m
      );

      onUpdateWorkspace({ ...workspace, members: updatedMembers });

    } catch (error) {
      console.error("Error actualizando rol:", error);
      alert("No se pudo cambiar el rol.");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleRemoveMember = async (memberId: string | number) => {
    if (!window.confirm("¿Seguro que quieres eliminar a este miembro?")) return;

    try {
      setLoadingMemberId(memberId.toString());

      // Convertimos a string para la URL por seguridad
      await removeMemberFromWorkspace(memberId.toString());

      onUpdateWorkspace({
        ...workspace,
        // Filtramos asegurándonos de comparar ambos como cadena
        members: workspace.members.filter(m => m.id.toString() !== memberId.toString())
      });

    } catch (error) {
      console.error("Error al eliminar miembro:", error);
      alert("No se pudo eliminar al miembro.");
    } finally {
      setLoadingMemberId(null);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Gestionar Miembros</h3>
            <p className="text-sm text-gray-500 mt-1">{workspace.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* BUSCADOR */}
          <div className="mb-8 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Agregar nuevo miembro</label>
            <div className="relative">
              <input
                type="text"
                value={searchEmail}
                onChange={handleSearchChange}
                placeholder="Buscar por email o nombre..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoComplete="off"
                disabled={isAdding}
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              {isAdding && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="animate-spin text-blue-600" size={18} />
                </div>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  {suggestions.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAddUser(user)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center justify-between group transition-colors border-b last:border-0 border-gray-50"
                    >
                      <div className="flex items-center gap-3">
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
                      <UserPlus size={18} className="text-gray-300 group-hover:text-blue-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* LISTA DE MIEMBROS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700">Miembros del equipo</h4>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{workspace.members.length}</span>
            </div>

            <div className="space-y-3">
              {workspace.members.map((member) => {
                // Verificar si este miembro es el usuario logueado
                const isSelf = currentUser && currentUser.email === member.email;
                const roleConfig = ROLE_OPTIONS.find(r => r.value === member.role) || ROLE_OPTIONS[2]; // Default: member

                return (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm flex items-center gap-2">
                          {member.name}
                          {isSelf && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">Tú</span>}
                        </p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">

                      {/* SELECTOR DE ROL */}
                      <div className="relative">
                        {updatingRoleId === member.id.toString() ? (
                          <div className="px-3 py-1 bg-gray-50 border rounded-md">
                            <Loader2 size={14} className="animate-spin text-gray-500" />
                          </div>
                        ) : (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id.toString(), e.target.value)}
                            // Deshabilitar cambio de rol propio si es el último admin (lógica opcional, aquí lo dejamos libre o bloqueado según prefieras)
                            disabled={loadingMemberId === member.id.toString()}
                            className={`appearance-none cursor-pointer text-xs font-medium py-1.5 pl-3 pr-7 rounded-md border outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${roleConfig.color}`}
                          >
                            {ROLE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value} className="bg-white text-gray-700">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                        {!updatingRoleId && (
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <ChevronDown size={12} />
                          </div>
                        )}
                      </div>

                      {/* BOTÓN ELIMINAR */}
                      <button
                        onClick={() => handleRemoveMember(member.id.toString())}
                        disabled={loadingMemberId === member.id.toString() || !!isSelf} // <--- BLOQUEO SI SOY YO
                        className={`p-1.5 rounded-lg transition-colors ${isSelf
                            ? "text-gray-200 cursor-not-allowed" // Estilo deshabilitado
                            : "text-gray-300 hover:text-red-500 hover:bg-red-50" // Estilo normal
                          }`}
                        title={isSelf ? "No puedes eliminarte a ti mismo" : "Eliminar usuario"}
                      >
                        {loadingMemberId === member.id.toString() ? (
                          <Loader2 size={18} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageMembersModal;
