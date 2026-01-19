import type { FC } from "react";
import type { Workspace } from "../types/Types";

interface Props {
  espacio: Workspace;
  onSelect: () => void;
}

const EspacioTrabajoCard: FC<Props> = ({ espacio, onSelect }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-xl transition"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="bg-blue-100 p-2 rounded-lg">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v18H3V3z" />
          </svg>
        </div>
        <span className="text-gray-500 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          {espacio.members.length}
        </span>
      </div>
      <h3 className="font-semibold text-lg mb-1">{espacio.name}</h3>
      <p className="text-gray-400 text-sm mb-2">Proyectos corporativos</p>
      <p className="text-gray-400 text-sm">{espacio.boards.length} tableros</p>
      <div className="text-blue-500 text-sm mt-4 hover:underline">Ver →</div>
    </div>
  );
};

export default EspacioTrabajoCard;
