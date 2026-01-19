import React, { useState, useEffect } from "react";
import List from "./List";
import { Plus, GripHorizontal } from "lucide-react";
import type { Board as BoardType, List as ListType } from "../types/Types";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Spinner } from "@heroui/react";
import { moveCard, getBoardById } from "../services/cardService";
import { adaptBackendToBoard } from "../utils/adapters";
import { createTarea, deleteTarea, updateTarea } from "../services/tereaService";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
} from "@heroui/react";



interface BoardProps {
  board?: BoardType;
  setBoard?: React.Dispatch<React.SetStateAction<BoardType | null>>;
  onBack: () => void;
}

const Board: React.FC<BoardProps> = ({ board: propBoard, setBoard: propSetBoard, onBack }) => {
  const { proyectoId } = useParams<{ proyectoId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const initialBoard = propBoard || (location.state?.board as BoardType);

  const [board, setBoard] = useState<BoardType | null>(propBoard || null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estados de drag (hooks)
  const [draggedCard, setDraggedCard] = useState<{
    listId: string;
    cardId: string;
    cardIndex: number;
  } | null>(null);

  const [dragOverListId, setDragOverListId] = useState<string | null>(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState<number | null>(null);
  const [draggedListId, setDraggedListId] = useState<string | null>(null);

  // Control del Modal
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  // Estados locales para el formulario
  const [newListTitle, setNewListTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);


  // funciones

  useEffect(() => {
    if (board && !isLoading) return;

    const fetchBoardData = async () => {
      
      if (!proyectoId) return;

      try {
        // Si ya teníamos datos del state, no ponemos loading para no parpadear,
        // pero igual hacemos el fetch para actualizar cambios de fondo.
        setIsLoading(true);
        console.log("Fetching board ID:", proyectoId);

        // 1. Traemos la data CRUDA del backend (con 'tareas', 'nombre', etc)
        const rawBackendData = await getBoardById(proyectoId);

        console.log("Raw data:", rawBackendData); // Debug

        // 2. LA PASAMOS POR EL ADAPTER
        // Esto convierte 'tareas' en 'lists' y 'nombre' en 'title'
        const cleanBoard = adaptBackendToBoard(rawBackendData);

        // 3. Guardamos la data limpia
        setBoard(cleanBoard);

      } catch (error) {
        console.error("Error obteniendo el tablero:", error);
        // Si falló y no tenemos board visual, redirigimos o mostramos error
        if (!board) {
          alert("No se pudo cargar el tablero");
          navigate(-1);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();
  }, [proyectoId]); // Se ejecuta cuando carga o cambia el ID



  // --- RENDERIZADO CONDICIONAL ---

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Spinner size="lg" label="Sincronizando tablero..." color="primary" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold mb-2">Tablero no encontrado</h1>
        <Button onPress={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  /*const addList = (title?: string) => {
    if (!title || !title.trim()) return;
    const newList: ListType = { id: `list-${Date.now()}`, title, cards: [] };
    setBoard({ ...board, lists: [...board.lists, newList] });
  };*/

  // Agregar lista con persistencia
  const handleCreateList = async () => {
    if (!newListTitle.trim() || !board) return;

    try {
      setIsCreating(true);

      // 1. Llamamos a tu servicio existente (createTarea)
      // Ajustamos el objeto para que coincida con lo que espera Java (BackendTarea)

      const nuevaTareaBackend = await createTarea({
        titulo: newListTitle,
        proyecto: { id: Number(board.id) }, // Vinculamos al proyecto actual
        cards: [] // Inicializamos vacío
      });

      // 2. Adaptamos la respuesta del Backend al formato visual (Frontend List)
      const newListFrontend: ListType = {
        id: nuevaTareaBackend.id.toString(),
        title: nuevaTareaBackend.titulo, // Java devuelve 'titulo'
        cards: []
      };

      // 3. Actualizamos el estado visual
      setBoard({ ...board, lists: [...board.lists, newListFrontend] });

      // 4. Limpieza
      setNewListTitle("");
      onClose(); // Cerramos el modal

    } catch (error) {
      console.error("Error al crear la lista:", error);
      alert("No se pudo guardar la lista.");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteList = (listId: string) => {
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar esta lista y todas sus tarjetas?");
    if (confirmed) {
      const updatedLists = board.lists.filter((l) => l.id !== listId);
      setBoard({ ...board, lists: updatedLists });
    }
  };

  const handleDragStart = (listId: string, cardId: string, cardIndex: number) => {
    setDraggedCard({ listId, cardId, cardIndex });
  };

  const handleDragOver = (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    setDragOverListId(listId);
  };

  const handleDragOverCard = (listId: string, cardIndex: number) => {
    setDragOverListId(listId);
    setDragOverCardIndex(cardIndex);
  };

  const handleDrop = async (targetListId: string, dropIndex?: number) => {
    if (!draggedCard) return;

    // 1. Guardamos una copia del estado ANTES de modificar nada (para rollback si falla)
    const previousBoard = { ...board };

    const sourceListIndex = board.lists.findIndex((l) => l.id === draggedCard.listId);
    const targetListIndex = board.lists.findIndex((l) => l.id === targetListId);

    if (sourceListIndex === -1 || targetListIndex === -1) return;

    const newLists = [...board.lists];

    if (draggedCard.listId === targetListId && dropIndex === draggedCard.cardIndex) {
      setDraggedCard(null);
      setDragOverListId(null);
      setDragOverCardIndex(null);
      return;
    }

    // Clonamos las listas afectadas
    const sourceList = { ...newLists[sourceListIndex], cards: [...newLists[sourceListIndex].cards] };
    const targetList =
      sourceListIndex === targetListIndex
        ? sourceList
        : { ...newLists[targetListIndex], cards: [...newLists[targetListIndex].cards] };

    // Sacamos la carta de la lista origen
    const [movedCard] = sourceList.cards.splice(draggedCard.cardIndex, 1);

    // Insertamos la carta en la lista destino
    if (draggedCard.listId === targetListId) {
      if (dropIndex !== undefined) {
        sourceList.cards.splice(dropIndex, 0, movedCard);
      } else {
        sourceList.cards.push(movedCard);
      }
      newLists[sourceListIndex] = sourceList;
    } else {
      if (dropIndex !== undefined) {
        targetList.cards.splice(dropIndex, 0, movedCard);
      } else {
        targetList.cards.push(movedCard);
      }
      newLists[sourceListIndex] = sourceList;
      newLists[targetListIndex] = targetList;
    }

    // 2. Aplicamos el cambio visual inmediato (Optimistic UI)
    setBoard({ ...board, lists: newLists });

    // Reseteamos estados de drag visual
    setDraggedCard(null);
    setDragOverListId(null);
    setDragOverCardIndex(null);

    // 3. PERSISTENCIA Y SINCRONIZACIÓN
    // Si la tarjeta cambió de lista, llamamos al backend
    if (draggedCard.listId !== targetListId) {
      try {
        // Asumiendo que moveCard devuelve la Card actualizada (Promesa<Card>)
        const updatedCardFromBackend = await moveCard(draggedCard.cardId, targetListId);

        console.log("Movimiento guardado. Datos actualizados:", updatedCardFromBackend);

        // 4. ACTUALIZACIÓN FINAL CON DATOS REALES
        // Buscamos la carta que acabamos de mover en el estado y la actualizamos con la data fresca del backend
        setBoard(currentBoard => {
          // Si por alguna razón el estado es null, retornamos null y no hacemos nada.
          if (!currentBoard) return null;
          const freshLists = currentBoard?.lists.map(list => {
            // Solo nos interesa la lista destino
            if (list.id === targetListId) {
              return {
                ...list,
                cards: list.cards.map(c =>
                  // Encontramos la carta por ID y la reemplazamos con la respuesta del backend
                  c.id === draggedCard.cardId ? { ...c, ...updatedCardFromBackend } : c
                )
              };
            }
            return list;
          });
          return { ...currentBoard, lists: freshLists };
        });

      } catch (error) {
        console.error("Error guardando movimiento:", error);
        alert("Hubo un error al mover la tarjeta. Se revertirán los cambios.");
        // Rollback: Volvemos al estado anterior si falló el backend
        setBoard(previousBoard);
      }
    }


  };

  const handleListDragStart = (e: React.DragEvent, listId: string) => {
    setDraggedListId(listId);
    // Marcamos que lo que viaja es una LISTA para diferenciarlo de las cartas
    e.dataTransfer.setData("type", "LIST");
  };

  const handleListDrop = async (e: React.DragEvent, targetListId: string) => {
    e.preventDefault();
    if (!draggedListId || draggedListId === targetListId || !board) return;

    // Reordenamiento visual (Optimistic UI)
    const oldIndex = board.lists.findIndex(l => l.id === draggedListId);
    const newIndex = board.lists.findIndex(l => l.id === targetListId);

    const newLists = [...board.lists];
    const [movedList] = newLists.splice(oldIndex, 1);
    newLists.splice(newIndex, 0, movedList);

    setBoard({ ...board, lists: newLists });
    setDraggedListId(null);

    // B) Persistencia del nuevo orden en el backend
    try {
      // Opción 1: Si tienes un campo 'orden' numérico en la BD
      // Actualizamos el orden de la lista movida (o de todas si es necesario)
      const listBeingMoved = board.lists.find(l => l.id === draggedListId);
      if (listBeingMoved) {
        // Llamamos al servicio
        await updateTarea(Number(draggedListId), {
          // Enviamos el título para que TypeScript esté feliz y no envíe {}
          // En el futuro, aquí enviarás: { orden: newIndex }
          titulo: listBeingMoved.title
        });

        console.log("Sincronización con backend exitosa (Simulada por falta de campo orden)");
      }

    } catch (error) {
      console.error("Error guardando el orden de listas", error);
      // Opcional: Revertir cambios si falla
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta lista y todas sus tarjetas?")) return;

    // Optimistic Update
    const previousLists = board?.lists;
    if (board) {
      setBoard({
        ...board,
        lists: board.lists.filter(l => l.id !== listId)
      });
    }

    try {
      await deleteTarea(Number(listId));
    } catch (error) {
      console.error("Error eliminando lista", error);
      alert("No se pudo eliminar la lista");
      // Rollback
      if (board && previousLists) {
        setBoard({ ...board, lists: previousLists });
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Grid de 3 columnas */}
        <div
          className="grid gap-6 justify-center"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))",
            maxWidth: "100%",
          }}
        >
          {board.lists.map((list) => (
            <div
              key={list.id}
              className={`flex flex-col items-center transition-all duration-300 ease-in-out ${draggedListId === list.id ? "opacity-50 scale-95" : "opacity-100"
                }`}
            >
              {/* Grip para mover la lista */}
              <div
                draggable
                onDragStart={(e) => handleListDragStart(e, list.id)}
                onDragEnd={() => setDraggedListId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleListDrop(e, list.id)}
                className="cursor-move p-4 flex justify-center items-center hover:bg-gray-100 rounded-t-lg transition-colors w-full mb-2"
                title="Arrastrar lista"
              >
                <GripHorizontal size={24} className="text-gray-400 hover:text-gray-600" />
              </div>

              <List
                list={list}
                board={board}
                setBoard={setBoard}
                onDragStart={handleDragStart}
                onDragOver={(e) => handleDragOver(e, list.id)}
                onDrop={handleDrop}
                onDragOverCard={handleDragOverCard}
                isDragOver={dragOverListId === list.id}
                onDeleteList={handleDeleteList}
              />
            </div>
          ))}

          {/* Bloque añadir lista (tareas) */}
          <div className="flex flex-col justify-center items-center h-full">
            <Button
              color="primary"
              variant="bordered"
              onPress={onOpen} // <--- Abre el Modal
              startContent={<Plus size={18} />}
              className="w-72 h-full min-h-[200px] border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-500 hover:text-blue-600"
            >
              Añadir otra lista
            </Button>

            {/* --- MODAL DE HEROUI --- */}
            <Modal
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              placement="center"
              backdrop="blur" // Efecto borroso elegante
              classNames={{
                base: "bg-white", // Asegura fondo blanco si usas tema oscuro
              }}
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1 text-gray-800">
                      Nueva Lista
                    </ModalHeader>

                    <ModalBody>
                      <Input
                        autoFocus
                        label="Título de la lista"
                        placeholder="Ej: Pendientes, En Revisión..."
                        variant="bordered"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateList();
                        }}
                      />
                    </ModalBody>

                    <ModalFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                        Cancelar
                      </Button>
                      <Button
                        color="primary"
                        onPress={handleCreateList}
                        isLoading={isCreating} // Spinner de carga nativo
                        isDisabled={!newListTitle.trim()}
                      >
                        Crear
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;