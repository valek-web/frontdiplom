import React from "react"
import { Card, Button, Dropdown } from "antd"
import { MoreOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { Draggable, Droppable } from "@hello-pangea/dnd"
import { TaskCard } from "./TaskCard"
import { useAppDispatch } from "../../../shared/hooks/redux"
import { deleteColumnThunk } from "../../../shared/store/reducers/kanbanSlice"

interface ColumnCardProps {
  column: any
  index: number
  onEditColumn: (column: any) => void
  onAddTask: (columnId: number) => void
  onEditTask: (task: any, columnId: number) => void
}

export const ColumnCard: React.FC<ColumnCardProps> = ({
  column,
  index,
  onEditColumn,
  onAddTask,
  onEditTask,
}) => {
  const dispatch = useAppDispatch()

  const handleDeleteColumn = () => {
    dispatch(deleteColumnThunk(column.id))
  }

  const getColumnMenu = () => [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Редактировать",
      onClick: () => onEditColumn(column),
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Удалить",
      danger: true,
      onClick: handleDeleteColumn,
    },
  ]

  return (
    <Draggable draggableId={`column-${column.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            minWidth: 320,
            width: 320,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
        >
          <Card
            title={
              <div
                {...provided.dragHandleProps}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "grab",
                }}
              >
                <span>{column.title}</span>
                <Dropdown menu={{ items: getColumnMenu() }} trigger={["click"]}>
                  <MoreOutlined onClick={(e) => e.stopPropagation()} />
                </Dropdown>
              </div>
            }
            size="small"
            extra={
              <Button
                type="text"
                size="small"
                icon={<PlusCircleOutlined />}
                onClick={() => onAddTask(column.id)}
              />
            }
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            bodyStyle={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <Droppable droppableId={column.id.toString()} type="TASK">
              {(provided, _) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    flex: 1,
                    minHeight: 200,
                    maxHeight: "calc(100vh - 250px)",
                    overflowY: "auto",
                    transition: "background-color 0.2s",
                    padding: "4px",
                    backgroundColor: "transparent",
                  }}
                >
                  {column.tasks.map((task: any, taskIndex: number) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={taskIndex}
                      columnId={column.id}
                      onEditTask={onEditTask}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Card>
        </div>
      )}
    </Draggable>
  )
}
