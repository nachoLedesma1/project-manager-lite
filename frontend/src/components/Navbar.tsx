import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, ChevronDown, LogOut, ArrowLeft, Users } from "lucide-react";
import { getCurrentUser } from "../services/authService";

interface NavbarProps {
  workspaceMode?: boolean;
  workspaceName?: string;
  workspaceMembers?: number;
  workspaceIcon?: React.ReactNode;
  onBack?: () => void;
  onManageMembers?: () => void;
}
// Interfaz para el usuario (ajusta según tus datos reales)
interface UserData {
  nombre?: string;
  username?: string;
  email: string;
}

const Navbar: React.FC<NavbarProps> = ({
  workspaceMode = false,
  workspaceName,
  workspaceMembers,
  workspaceIcon,
  onBack,
  onManageMembers,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<UserData | null>(null); // Estado para el usuario
  const navigate = useNavigate();

  // Cargar usuario al montar el componente
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Aquí llamamos a tu servicio que obtiene los datos (del token o localStorage)
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error("No se pudo cargar el usuario", error);
      }
    };
    fetchUser();
  }, []);

  // Lógica para obtener la inicial
  const getUserInitial = () => {
    if (!user) return "U";
    // Prioridad: Nombre -> Username -> Email
    const nameToUse = user.nombre || user.username || user.email;
    return nameToUse.charAt(0).toUpperCase();
  };

  // Lógica para obtener el nombre a mostrar (o el email si no hay nombre)
  const getDisplayName = () => {
    if (!user) return "Usuario";
    return user.nombre || user.username || "Usuario";
  };

  const handleProfile = () => { };
  const handleSettings = () => { };
  const handleLogout = () => {
    localStorage.removeItem("token");
    setShowUserMenu(false);
    navigate("/login");
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* === Sección izquierda === */}
        {workspaceMode ? (
          // --- Navbar Workspace ---
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="hover:bg-gray-100 p-2 rounded-lg transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              {workspaceIcon || "🧩"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{workspaceName}</h1>
              <p className="text-sm text-gray-500">
                {workspaceMembers ?? 0} miembros
              </p>
            </div>
          </div>
        ) : (
          // --- Navbar Home / General ---
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <LayoutGrid size={28} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Manager Lite</h1>
          </div>
        )}

        {/* === Sección derecha === */}
        <div className="flex items-center gap-2">
          {workspaceMode && onManageMembers && (
            <button
              onClick={onManageMembers}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Users size={16} />
              Gestionar Miembros
            </button>
          )}

          {/* Menú de usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
            >
              {/* Círculo con inicial dinámica */}
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                {getUserInitial()}
              </div>
              <ChevronDown size={16} />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "Cargando..."}
                    </p>
                  </div>

                  <button
                    onClick={handleProfile}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition"
                  >
                    Mi Perfil
                  </button>

                  <button
                    onClick={handleSettings}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition"
                  >
                    Configuración
                  </button>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
