import type { FC } from "react";
import type { Board } from "../types/Types";

interface Props {
  tablero: Board;
}

const TableroCard: FC<Props> = ({ tablero }) => {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl shadow-md p-6 flex flex-col hover:shadow-xl transition">
      <h4 className="font-semibold text-lg">{tablero.title}</h4>
      <div className="flex items-center gap-2 mt-4 text-sm text-white/80">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h18v18H3V3z" />
        </svg>
        {tablero.lists.length} listas
      </div>
    </div>
  );
};

export default TableroCard;
