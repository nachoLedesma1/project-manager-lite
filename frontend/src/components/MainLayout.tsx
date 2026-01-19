import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import ManageMembersModal from "./ManageMembersModal";
import { LayoutGrid, Grid, Users } from "lucide-react";
import type { Workspace } from "../types/Types";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const workspaceIcons: { [key: string]: React.ReactNode } = {
    empresa: <LayoutGrid size={28} className="text-blue-600" />,
    proyecto: <Grid size={28} className="text-green-600" />,
    familia: <Users size={28} className="text-pink-600" />,
  };


  // Obtenemos workspace del state
  const initialWorkspace: Workspace | null = location.state?.workspace || null;
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(initialWorkspace);

  useEffect(() => {
    if (location.state?.workspace) {
      setCurrentWorkspace(location.state.workspace as Workspace);
    }
    else{
      setCurrentWorkspace(null);
    }
  }, [location.state]);

  const [showManageMembers, setShowManageMembers] = useState(false);
  const workspaceIcon = currentWorkspace ? workspaceIcons[currentWorkspace.type] : null;

  // Función para actualizar el workspace desde el modal
  const handleUpdateWorkspace = (updatedWorkspace: Workspace) => {
    setCurrentWorkspace(updatedWorkspace);
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar
        workspaceMode={!!currentWorkspace}
        workspaceName={currentWorkspace?.name}
        workspaceMembers={currentWorkspace?.members.length}
        workspaceIcon={workspaceIcon}
        onBack={() => navigate("/home")}
        onManageMembers={() => setShowManageMembers(true)} // abre el modal
      />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      {currentWorkspace && showManageMembers && (
        <ManageMembersModal
          workspace={currentWorkspace}
          onClose={() => setShowManageMembers(false)}
          onUpdateWorkspace={handleUpdateWorkspace}
        />
      )}
    </div>
  );
};

export default MainLayout;
