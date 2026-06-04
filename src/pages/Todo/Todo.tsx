import React, { useState, useEffect } from "react"
import { Empty, Button, Typography, message } from "antd"
import { PlusOutlined } from "@ant-design/icons"
import { DragDropContext, type DropResult, Droppable } from "@hello-pangea/dnd"
import { useAppDispatch, useAppSelector } from "../../shared/hooks/redux"
import {
  fetchBoardsThunk,
  fetchColumnsThunk,
  moveTaskState,
  moveTaskThunk,
  moveColumnState,
  reorderColumnsThunk,
  setCurrentBoard,
  fetchUsersThunk,
} from "./../../shared/store/reducers/kanbanSlice"
import { BoardSelector } from "./components/BoardSelector"
import { BoardModal } from "./components/BoardModal"
import { ColumnCard } from "./components/ColumnCard"
import { AddColumnButton } from "./components/AddColumnButton"
import { ColumnModal } from "./components/ColumnModal"
import { TaskModal } from "./components/TaskModal"

const { Title } = Typography

export const Todo: React.FC = () => {
  const dispatch = useAppDispatch()
  const { boards, currentBoard, columns } = useAppSelector((state) => state.kanban)

  const [boardModalOpen, setBoardModalOpen] = useState(false)
  const [columnModalOpen, setColumnModalOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingBoard, setEditingBoard] = useState<any>(null)
  const [editingColumn, setEditingColumn] = useState<any>(null)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null)

  useEffect(() => {
    dispatch(fetchBoardsThunk())
    dispatch(fetchUsersThunk())
  }, [dispatch])

  useEffect(() => {
    if (currentBoard) {
      dispatch(fetchColumnsThunk(currentBoard.id))
    }
  }, [currentBoard, dispatch])

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, type } = result

    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    // Перемещение колонок
    if (type === "COLUMN") {
      const fromIndex = source.index
      const toIndex = destination.index

      // Создаем новый порядок ID
      const currentColumnIds = columns.map((col) => col.id)
      const newColumnIds = [...currentColumnIds]
      const [movedId] = newColumnIds.splice(fromIndex, 1)
      newColumnIds.splice(toIndex, 0, movedId)

      // Отправляем запрос на сервер
      if (currentBoard) {
        // Показываем loading (опционально)
        const loadingMsg = message.loading("Сохранение порядка колонок...", 0)

        const resultAction = await dispatch(reorderColumnsThunk(currentBoard.id, newColumnIds))

        loadingMsg()

        if (resultAction.success) {
          // Обновляем UI только после успешного ответа
          dispatch(moveColumnState({ fromIndex, toIndex }))
          message.success("Порядок колонок обновлен")
        } else {
          message.error(resultAction.error || "Ошибка перемещения колонки")
        }
      }
      return
    }

    // Перемещение задач
    const fromColumnId = parseInt(source.droppableId)
    const toColumnId = parseInt(destination.droppableId)
    const taskId = parseInt(draggableId)

    const fromColumn = columns.find((c) => c.id === fromColumnId)
    const task = fromColumn?.tasks.find((t) => t.id === taskId)

    if (!task) {
      message.error("Задача не найдена")
      return
    }

    // Оптимистичное обновление для задач
    dispatch(
      moveTaskState({
        fromColumnId,
        toColumnId,
        task: { ...task },
        newPosition: destination.index,
      }),
    )

    const resultAction = await dispatch(
      moveTaskThunk(taskId, fromColumnId, toColumnId, destination.index),
    )

    if (resultAction.success) {
      message.success("Задача перемещена")
    } else {
      message.error(resultAction.error || "Ошибка перемещения задачи")
      // При ошибке перезагружаем колонки для отката
      if (currentBoard) {
        await dispatch(fetchColumnsThunk(currentBoard.id))
      }
    }
  }

  const openBoardModal = (board?: any) => {
    setEditingBoard(board || null)
    setBoardModalOpen(true)
  }

  const openColumnModal = (column?: any) => {
    setEditingColumn(column || null)
    setColumnModalOpen(true)
  }

  const openTaskModal = (columnId?: number, task?: any) => {
    if (columnId) setSelectedColumnId(columnId)
    if (task) setEditingTask(task)
    setTaskModalOpen(true)
  }

  const closeBoardModal = () => {
    setBoardModalOpen(false)
    setEditingBoard(null)
  }

  const closeColumnModal = () => {
    setColumnModalOpen(false)
    setEditingColumn(null)
  }

  const closeTaskModal = () => {
    setTaskModalOpen(false)
    setEditingTask(null)
    setSelectedColumnId(null)
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2} style={{ marginBottom: 0 }}>
          Доска
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openBoardModal()}>
          Создать доску
        </Button>
      </div>

      {boards.length === 0 ? (
        <Empty description="Нет досок. Создайте первую доску">
          <Button type="primary" onClick={() => openBoardModal()}>
            Создать доску
          </Button>
        </Empty>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <BoardSelector
            boards={boards}
            currentBoard={currentBoard}
            onSelectBoard={(board) => dispatch(setCurrentBoard(board))}
            onEditBoard={openBoardModal}
          />

          {currentBoard && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
                {(provided, _) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      display: "flex",
                      gap: 16,
                      overflowX: "auto",
                      flex: 1,
                      alignItems: "stretch",
                      minHeight: 200,
                    }}
                  >
                    {columns.map((column, index) => (
                      <ColumnCard
                        key={column.id}
                        column={column}
                        index={index}
                        onEditColumn={openColumnModal}
                        onAddTask={(columnId) => openTaskModal(columnId)}
                        onEditTask={(task, columnId) => openTaskModal(columnId, task)}
                      />
                    ))}
                    {provided.placeholder}
                    <AddColumnButton onClick={() => openColumnModal()} />
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      )}

      <BoardModal open={boardModalOpen} editingBoard={editingBoard} onClose={closeBoardModal} />

      <ColumnModal
        open={columnModalOpen}
        editingColumn={editingColumn}
        boardId={currentBoard?.id}
        onClose={closeColumnModal}
      />

      <TaskModal
        open={taskModalOpen}
        editingTask={editingTask}
        columnId={selectedColumnId}
        onClose={closeTaskModal}
      />
    </div>
  )
}
