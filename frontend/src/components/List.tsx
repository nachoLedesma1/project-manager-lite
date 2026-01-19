import React, { useState } from "react";
import Card from "./Card";
import { Plus, X, Check, GripHorizontal } from "lucide-react";
import { Card as HeroCard, CardHeader, CardBody, Input, Button, Textarea } from "@heroui/react";
import type { List as ListType, Board as BoardType, CardStatus } from "../types/Types";
import { createCard, updateCard, deleteCard as deleteCardService } from "../services/cardService";
import { updateTarea } from "../services/tereaService";

interface ListProps {
  list: ListType;
  board: BoardType;
  setBoard: React.Dispatch<React.SetStateAction<BoardType | null>>;
  onDragStart: (listId: string, cardId: string, cardIndex: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (listId: string, dropIndex?: number) => void;
  onDragOverCard: (listId: string, cardIndex: number) => void;
  isDragOver: boolean;
  onDeleteList: (listId: string) => void;
}

const List: React.FC<ListProps> = ({
  list,
  board,
  setBoard,
  onDragStart,
  onDragOver,
  onDrop,
  onDragOverCard,
  isDragOver,
  onDeleteList,
}) => {
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);

  const addCard = async () => {
    if (!newCardTitle.trim()) return;

    // 1. Guardamos el estado anterior por si hay error (Optimistic UI - Opcional)
    // const previousList = ... 

    try {
      // 2. Primero llamamos al Backend. ¡Esto devuelve la carta con ID real!
      const savedCard = await createCard(list.id, {
        title: newCardTitle,
        status: "pendiente",
      });

      console.log("Carta creada en BD:", savedCard); // Verifica que aquí venga id: 1, 2, etc.

      // 3. AHORA actualizamos el estado usando 'savedCard' (NO creamos un objeto manual)
      // ES MUY IMPORTANTE que uses 'savedCard' porque tiene el ID correcto.

      // Adaptamos la respuesta del backend al formato del frontend si es necesario
      const newCardForState = {
        id: savedCard.id.toString(), // Convertimos el ID numérico a string para el frontend
        title: savedCard.title,
        status: savedCard.status as CardStatus, // Aseguramos el tipo
        // assignees: [], etc.
      };

      const updatedLists = board.lists.map((l) =>
        l.id === list.id ? { ...l, cards: [...l.cards, newCardForState] } : l
      );

      setBoard({ ...board, lists: updatedLists });
      setNewCardTitle("");
      setIsAddingCard(false);

    } catch (error) {
      console.error("Error creando tarjeta:", error);
      alert("Error al crear la tarjeta");
    }
  };

  const updateCardStatus = async (cardId: string, status: CardStatus) => {
    // Optimistic Update: Actualizamos UI primero para que se sienta rápido
    const originalLists = [...board.lists];

    const updatedLists = board.lists.map((l) =>
      l.id === list.id
        ? {
          ...l,
          cards: l.cards.map((c) => (c.id === cardId ? { ...c, status } : c)),
        }
        : l
    );
    setBoard({ ...board, lists: updatedLists });

    try {
      // Llamamos al backend en segundo plano
      await updateCard(cardId, { status });
    } catch (error) {
      console.error("Error actualizando estado:", error);
      // Rollback si falla
      setBoard({ ...board, lists: originalLists });
    }
  };

  const updateCardTitle = async (cardId: string, newTitle: string) => {

    try {
      const updatedCard = await updateCard(cardId, { title: newTitle });

      const updatedLists = board.lists.map((l) =>
        l.id === list.id
          ? {
            ...l,
            cards: l.cards.map((c) => (c.id === cardId ? updatedCard : c)),
          }
          : l
      );
      setBoard({ ...board, lists: updatedLists });
    } catch (error) {
      console.error("Error actualizando título:", error);
    }
  };

  const updateListTitle = async () => {
    // 1. Validar que no esté vacío
    if (!editedTitle.trim()) {
      setEditedTitle(list.title);
      setIsEditingTitle(false);
      return;
    }

    // 2. Si el título es igual al que ya tenía, no hacemos nada (ahorramos la llamada)
    if (editedTitle === list.title) {
      setIsEditingTitle(false);
      return;
    }

    // 3. Optimistic update: Guardamos copia y actualizamos UI ya mismo
    const originalLists = [...board.lists];

    const updatedLists = board.lists.map((l) =>
      l.id === list.id ? { ...l, title: editedTitle } : l
    );
    setBoard({ ...board, lists: updatedLists });
    setIsEditingTitle(false);

    try {
      // 4. LLAMADA AL BACKEND
      // Usamos 'titulo' porque así lo espera Java
      // Usamos 'as any' para evitar que TypeScript se queje si faltan campos obligatorios en el tipo BackendTarea
      await updateTarea(Number(list.id), {
        titulo: editedTitle
      } as any);

      console.log("Nombre de lista actualizado en BD");

    } catch (error) {
      console.error("Error al actualizar el nombre en el backend:", error);
      // 5. ROLLBACK: Si falla, volvemos a poner la lista como estaba
      setBoard({ ...board, lists: originalLists });
      alert("No se pudo guardar el cambio de nombre.");
    }
  };

  const deleteCard = async (cardId: string, e?: React.MouseEvent) => {

    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (!window.confirm("¿Eliminar tarjeta?")) return;

    try {
      await deleteCardService(cardId);

      const updatedLists = board.lists.map((l) =>
        l.id === list.id
          ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) }
          : l
      );
      setBoard({ ...board, lists: updatedLists });
    } catch (error) {
      console.error("Error eliminando tarjeta:", error);
    }
  };

  return (
    <HeroCard
      shadow="sm"
      // 1. QUITAMOS 'draggable' AQUÍ PARA QUE LA LISTA NO SE MUEVA
      className={`w-72 flex-shrink-0 flex flex-col transition-all duration-200 
        ${isDragOver ? "ring-2 ring-blue-400 bg-blue-50/50" : ""}
        `} // Quitamos cursor-move
      
      // 2. MANTENEMOS ESTO PARA QUE LA LISTA PUEDA "RECIBIR" CARTAS
      onDragOver={onDragOver} 
      onDrop={(e) => {
        e.preventDefault();
        onDrop(list.id); // <--- Esto llama a la lógica de soltar CARTA, no lista
      }}
    >
      <CardHeader className="flex justify-between items-center pb-2 cursor-grab active:cursor-grabbing">
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={updateListTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateListTitle();
                if (e.key === "Escape") {
                  setEditedTitle(list.title);
                  setIsEditingTitle(false);
                }
              }}
              size="sm"
              className="flex-1"
              autoFocus
            />
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="success"
              onClick={updateListTitle}
            >
              <Check size={16} />
            </Button>
          </div>
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation(); // Evita iniciar drag al hacer click para editar
              setIsEditingTitle(true);
            }}
            className="text-base font-semibold hover:text-blue-600 truncate max-w-[150px]"
          >
            {list.title}
          </span>
        )}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          // Conectamos la prop de eliminar
          onClick={() => onDeleteList(list.id)}
        >
          <X size={16} />
        </Button>
      </CardHeader>

      <CardBody className="flex flex-col gap-2 overflow-y-auto">
        {list.cards.map((card, index) => (
          <div
            key={card.id}
            className={`transition-all duration-300 ease-in-out transform`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDragOverCard(list.id, index);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDrop(list.id, index);
            }}
          >
            <Card
              card={card}
              onDelete={(e) => deleteCard(card.id, e)}
              onDragStart={(e) => onDragStart(list.id, card.id, index)}
              onStatusChange={(status) => updateCardStatus(card.id, status)}
              onTitleChange={(newTitle) => updateCardTitle(card.id, newTitle)}
            />
          </div>
        ))}

        {isAddingCard ? (
          <div className="mt-2 flex flex-col gap-2">
            <Textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Título de la tarjeta..."
              minRows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  addCard();
                }
              }}
            />
            <div className="flex gap-2">
              <Button color="primary" size="sm" onClick={addCard}>
                Agregar
              </Button>
              <Button
                variant="light"
                size="sm"
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="flat"
            color="default"
            size="sm"
            className="mt-2"
            onClick={() => setIsAddingCard(true)}
            startContent={<Plus size={16} />}
          >
            Añadir tarjeta
          </Button>
        )}
      </CardBody>
    </HeroCard>
  );
};

export default List;
