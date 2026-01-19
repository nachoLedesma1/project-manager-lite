import React, { useState, useMemo } from "react";
import { Edit2, X } from "lucide-react";
import {
  Card as HeroCard,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/react";
import type { Card as CardType, CardStatus } from "../types/Types";

interface CardProps {
  card: CardType;
  allUsers?: string[];
  onDelete: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onStatusChange: (status: CardStatus) => void;
  onTitleChange: (newTitle: string) => void;
  onAssigneesChange?: (assignees: string[]) => void;
}

const Card: React.FC<CardProps> = ({
  card,
  allUsers,
  onDelete,
  onDragStart,
  onStatusChange,
  onTitleChange,
  onAssigneesChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [assignees, setAssignees] = useState<string[]>(card.assignees || []);
  const [selectedStatus, setSelectedStatus] = useState<Set<string>>(new Set([card.status || "pendiente"]));
  const [selectedAssignees, setSelectedAssignees] = useState<Set<string>>(new Set(card.assignees || []));

  const statusColors = {
    pendiente: "bg-yellow-500",
    "en-proceso": "bg-blue-500",
    completado: "bg-green-500",
  };

  const statusLabels = {
    pendiente: "Pendiente",
    "en-proceso": "En Proceso",
    completado: "Completado",
  };

  const currentStatus = Array.from(selectedStatus)[0] as CardStatus;

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onTitleChange(editedTitle.trim());
      setIsEditing(false);
    } else {
      setEditedTitle(card.title);
      setIsEditing(false);
    }
  };


  const selectedAssigneesDisplay = useMemo(
    () => (assignees.length > 0 ? assignees.join(", ") : "Sin asignados"),
    [assignees]
  );

  return (
    <HeroCard
      draggable={!isEditing}
      onDragStart={onDragStart}
      className="w-full bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-move group relative rounded-xl"
    >
      {/* Header */}
      <CardHeader className="flex justify-between items-start">
        {isEditing ? (
          <textarea
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSaveTitle();
              }
              if (e.key === "Escape") {
                setEditedTitle(card.title);
                setIsEditing(false);
              }
            }}
            className="flex-1 text-sm text-gray-800 border-2 border-blue-500 rounded px-2 py-1 focus:outline-none resize-none"
            autoFocus
            rows={2}
          />
        ) : (
          <div className="flex items-start gap-2 flex-1">
            <span className="text-sm text-gray-800 flex-1">{card.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsEditing(true);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity"
            >
              <Edit2 size={14} />
            </button>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(e);
          }}
          className="text-gray-400 font-bold hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-lg leading-none"
        >
          ×
        </button>
      </CardHeader>

      <CardBody>{/* Podés agregar descripción u otros detalles aquí */}</CardBody>

      {/* Footer */}
      <CardFooter className="flex justify-between items-center pt-3 relative">
        {/* Dropdown de assignees (solo si hay usuarios) */}
        {allUsers && allUsers.length > 0 ? (
          <Dropdown>
            <DropdownTrigger>
              <div className="flex -space-x-2 cursor-pointer">
                {assignees.length > 0 ? (
                  Array.from(selectedAssignees).map((person) => (
                    <Avatar
                      key={person}
                      name={person}
                      size="sm"
                      className="border-2 border-white"
                    />
                  ))
                ) : (
                  <Avatar
                    name="Sin asignados"
                    size="sm"
                    className="border-2 border-white"
                  />
                )}
              </div>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              selectionMode="multiple"
              selectedKeys={selectedAssignees}
              closeOnSelect={false}
              variant="flat"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys as Set<string>);
                setSelectedAssignees(new Set(selected));
                setAssignees(selected);
                onAssigneesChange?.(selected); // 👈 evita error si no existe
              }}
            >
              <DropdownSection>
                {allUsers.map((user) => (
                  <DropdownItem key={user}>{user}</DropdownItem>
                ))}
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        ) : (
          // Si no hay usuarios, no se muestra dropdown ni avatar
          <div className="flex items-center text-xs text-gray-400">
            <Avatar
              name={card?.owner || "Privado"}
              size="sm"
              className="border-2 border-white"
            />
            <span className="ml-2">Privado</span>
          </div>
        )}

        {/* Dropdown de estado */}
        <Dropdown>
          <DropdownTrigger>
            <div
              className={`w-4 h-4 rounded-full ${statusColors[currentStatus]} cursor-pointer hover:scale-125 transition-transform`}
              title="Click para cambiar estado"
            ></div>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={selectedStatus}
            variant="flat"
            onSelectionChange={(keys) => {
              const newStatus = Array.from(keys as Set<string>)[0];
              setSelectedStatus(new Set([newStatus]));
              onStatusChange(newStatus as CardStatus);
            }}
          >
            {Object.keys(statusColors).map((status) => (
              <DropdownItem key={status}>
                {statusLabels[status as CardStatus]}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </CardFooter>

    </HeroCard>
  );
};

export default Card;
