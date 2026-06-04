import React from "react"
import { Card, Typography, Dropdown, Space, Tag } from "antd"
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Draggable } from "@hello-pangea/dnd"
import { useAppDispatch } from "../../../shared/hooks/redux"
import { deleteTaskThunk } from "../../../shared/store/reducers/kanbanSlice"
import type { MenuProps } from "antd"
import dayjs from "dayjs"

const { Text } = Typography

interface TaskCardProps {
  task: any
  index: number
  columnId: number
  onEditTask: (task: any, columnId: number) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, columnId, onEditTask }) => {
  const dispatch = useAppDispatch()

  const handleDeleteTask = () => {
    dispatch(deleteTaskThunk(task.id, columnId))
  }

  const items: MenuProps["items"] = [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Редактировать",
      onClick: () => onEditTask(task, columnId),
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Удалить",
      danger: true,
      onClick: () => handleDeleteTask(),
    },
  ]

  const handleDoubleClick = () => {
    onEditTask(task, columnId)
  }

  const formatDate = (date: string) => {
    if (!date) return null
    return dayjs(date).format("DD.MM.YYYY")
  }

  const startDate = formatDate(task.startDate)
  const dueDate = formatDate(task.dueDate)
  const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), "day")

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            marginBottom: 8,
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
          onDoubleClick={handleDoubleClick}
        >
          <Card
            size="small"
            style={{
              cursor: "grab",
              borderLeft: isOverdue ? "3px solid #ff4d4f" : undefined,
            }}
            bodyStyle={{ padding: 12 }}
            title={
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Text strong style={{ fontSize: 14 }}>
                  {task.title}
                </Text>
                <Dropdown menu={{ items }} trigger={["click"]}>
                  <MoreOutlined
                    style={{ cursor: "pointer" }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </div>
            }
          >
            {task.description && (
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {task.description.length > 80
                    ? `${task.description.substring(0, 80)}...`
                    : task.description}
                </Text>
              </div>
            )}

            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              {task.assignee && (
                <div>
                  <UserOutlined style={{ fontSize: 12, color: "#8c8c8c", marginRight: 6 }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {task.assignee.name}
                  </Text>
                </div>
              )}

              {(startDate || dueDate) && (
                <div>
                  <CalendarOutlined style={{ fontSize: 12, color: "#8c8c8c", marginRight: 6 }} />
                  {startDate && dueDate && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {startDate} - {dueDate}
                    </Text>
                  )}
                  {startDate && !dueDate && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      с {startDate}
                    </Text>
                  )}
                  {!startDate && dueDate && (
                    <Text
                      type="secondary"
                      style={{ fontSize: 12, color: isOverdue ? "#ff4d4f" : undefined }}
                    >
                      до {dueDate} {isOverdue && "🔴"}
                    </Text>
                  )}
                </div>
              )}
            </Space>

            {task.tags && task.tags.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                {task.tags.slice(0, 3).map((tag: string) => (
                  <Tag key={tag} style={{ fontSize: 11, margin: 0 }}>
                    {tag}
                  </Tag>
                ))}
                {task.tags.length > 3 && (
                  <Tag style={{ fontSize: 11, margin: 0 }}>+{task.tags.length - 3}</Tag>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </Draggable>
  )
}
