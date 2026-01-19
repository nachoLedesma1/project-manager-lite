import React from 'react';

const HomeSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 animate-pulse">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* --- Sección Workspaces Skeleton --- */}
        <div className="mb-12">
          {/* Header de la sección */}
          <div className="flex justify-between items-center mb-6">
            <div>
              {/* Título */}
              <div className="h-8 w-48 bg-slate-200 rounded mb-2"></div>
              {/* Subtítulo */}
              <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
            {/* Botón */}
            <div className="h-10 w-36 bg-blue-200 rounded-lg opacity-50"></div>
          </div>

          {/* Grid de Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm border-2 border-transparent h-[180px] flex flex-col justify-between"
              >
                {/* Top Row: Icono y Pill de usuarios */}
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
                  <div className="h-6 w-12 bg-slate-200 rounded-full"></div>
                </div>
                
                {/* Título y Descripción */}
                <div>
                  <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 w-full bg-slate-100 rounded mb-1"></div>
                  <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
                </div>

                {/* Bottom Row: Tableros y Link */}
                <div className="flex items-center justify-between mt-4">
                  <div className="h-4 w-20 bg-slate-200 rounded"></div>
                  <div className="h-4 w-10 bg-blue-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Sección Personal Boards Skeleton --- */}
        <div>
          {/* Header de la sección */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="h-8 w-48 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
            <div className="h-10 w-36 bg-emerald-100 rounded-lg opacity-50"></div>
          </div>

          {/* Grid de Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm h-[180px]">
                {/* Parte superior (Imagen placeholder) */}
                <div className="h-32 bg-slate-200 w-full relative">
                    <div className="absolute bottom-4 left-4 h-6 w-1/2 bg-slate-300 rounded"></div>
                </div>
                {/* Parte inferior (Icono listas) */}
                <div className="p-4 bg-white">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-slate-200 rounded"></div>
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeSkeleton;