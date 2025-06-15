import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Flex, Stack } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";
import { ReactNode } from "react";
import classes from "./DraggableList.module.css";

type DraggableItemProps<T> = {
  item: T;
  index: number;
  id: string;
  children: ReactNode;
};

export const DraggableItem = <T,>({
  item,
  index,
  id,
  children,
}: DraggableItemProps<T>) => (
  <Draggable key={id} index={index} draggableId={id}>
    {(provided, snapshot) => (
      <Flex
        align="center"
        gap="sm"
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        className={`${classes.item} ${
          snapshot.isDragging ? classes.itemDragging : ""
        }`}
      >
        <IconGripVertical size={18} stroke={1.5} />
        {children}
      </Flex>
    )}
  </Draggable>
);

type DraggableListProps<T> = {
  items: T[];
  onReorder: (from: number, to: number) => void;
  children: (item: T, index: number) => ReactNode;
  getItemId: (item: T) => string;
};

export const DraggableList = <T,>({
  items,
  onReorder,
  children,
  getItemId,
}: DraggableListProps<T>) => {
  return (
    <DragDropContext
      onDragEnd={({ destination, source }) =>
        onReorder(source.index, destination?.index || 0)
      }
    >
      <Droppable droppableId="dnd-list" direction="vertical">
        {(provided) => (
          <Stack
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{ padding: "1rem 0" }}
          >
            {items.map((item, index) => (
              <DraggableItem
                key={getItemId(item)}
                item={item}
                index={index}
                id={getItemId(item)}
              >
                {children(item, index)}
              </DraggableItem>
            ))}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
};
