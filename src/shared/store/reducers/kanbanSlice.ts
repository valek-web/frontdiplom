import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import api from "../../api/axiosInstance"
import type { AppDispatch } from "../store"

interface User {
  id: number
  name: string
  email: string
}

interface Task {
  id: number
  title: string
  description?: string
  position: number
  startDate?: string
  dueDate?: string
  assigneeId?: number
  assignee?: User
  tags?: string[]
  imageIds?: number[]
  videoIds?: number[]
  createdAt: string
  updatedAt: string
}

interface Column {
  id: number
  title: string
  order: number
  boardId: number
  tasks: Task[]
  createdAt: string
  updatedAt: string
}

interface Board {
  id: number
  title: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface KanbanState {
  boards: Board[]
  currentBoard: Board | null
  columns: Column[]
  users: User[] // Добавляем пользователей
  loading: boolean
  error: string | null
}

const initialState: KanbanState = {
  boards: [],
  currentBoard: null,
  columns: [],
  users: [], // Добавляем
  loading: false,
  error: null,
}

const kanbanSlice = createSlice({
  name: "kanban",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setBoards: (state, action: PayloadAction<Board[]>) => {
      state.boards = action.payload
    },
    setCurrentBoard: (state, action: PayloadAction<Board>) => {
      state.currentBoard = action.payload
    },
    setColumns: (state, action: PayloadAction<Column[]>) => {
      state.columns = action.payload
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      // Добавляем
      state.users = action.payload
    },
    addBoard: (state, action: PayloadAction<Board>) => {
      state.boards.push(action.payload)
    },
    updateBoardState: (state, action: PayloadAction<Board>) => {
      const index = state.boards.findIndex((b) => b.id === action.payload.id)
      if (index !== -1) {
        state.boards[index] = action.payload
      }
      if (state.currentBoard?.id === action.payload.id) {
        state.currentBoard = action.payload
      }
    },
    deleteBoardState: (state, action: PayloadAction<number>) => {
      state.boards = state.boards.filter((b) => b.id !== action.payload)
      if (state.currentBoard?.id === action.payload) {
        state.currentBoard = null
        state.columns = []
      }
    },
    addColumnState: (state, action: PayloadAction<Column>) => {
      state.columns.push(action.payload)
    },
    updateColumnState: (state, action: PayloadAction<Column>) => {
      const index = state.columns.findIndex((c) => c.id === action.payload.id)
      if (index !== -1) {
        state.columns[index] = action.payload
      }
    },
    deleteColumnState: (state, action: PayloadAction<number>) => {
      state.columns = state.columns.filter((c) => c.id !== action.payload)
    },
    addTaskState: (state, action: PayloadAction<{ columnId: number; task: Task }>) => {
      const column = state.columns.find((c) => c.id === action.payload.columnId)
      if (column) {
        column.tasks.push(action.payload.task)
        column.tasks.sort((a, b) => a.position - b.position)
      }
    },
    updateTaskState: (state, action: PayloadAction<{ columnId: number; task: Task }>) => {
      const column = state.columns.find((c) => c.id === action.payload.columnId)
      if (column) {
        const index = column.tasks.findIndex((t) => t.id === action.payload.task.id)
        if (index !== -1) {
          column.tasks[index] = action.payload.task
        }
      }
    },
    deleteTaskState: (state, action: PayloadAction<{ columnId: number; taskId: number }>) => {
      const column = state.columns.find((c) => c.id === action.payload.columnId)
      if (column) {
        column.tasks = column.tasks.filter((t) => t.id !== action.payload.taskId)
      }
    },
    moveTaskState: (
      state,
      action: PayloadAction<{
        fromColumnId: number
        toColumnId: number
        task: Task
        newPosition: number
      }>,
    ) => {
      const fromColumn = state.columns.find((c) => c.id === action.payload.fromColumnId)
      const toColumn = state.columns.find((c) => c.id === action.payload.toColumnId)

      if (fromColumn && toColumn) {
        fromColumn.tasks = fromColumn.tasks.filter((t) => t.id !== action.payload.task.id)
        const updatedTask = { ...action.payload.task, position: action.payload.newPosition }
        toColumn.tasks.push(updatedTask)
        toColumn.tasks.sort((a, b) => a.position - b.position)
      }
    },
    moveColumnState: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload
      const [movedColumn] = state.columns.splice(fromIndex, 1)
      state.columns.splice(toIndex, 0, movedColumn)

      state.columns.forEach((column, idx) => {
        column.order = idx
      })
    },
  },
})

export const {
  setLoading,
  setError,
  setBoards,
  setCurrentBoard,
  setColumns,
  setUsers, // Добавляем
  addBoard,
  updateBoardState,
  deleteBoardState,
  addColumnState,
  updateColumnState,
  deleteColumnState,
  addTaskState,
  updateTaskState,
  deleteTaskState,
  moveTaskState,
  moveColumnState,
} = kanbanSlice.actions
export default kanbanSlice.reducer

// THUNKS

// Доски
export const fetchBoardsThunk = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true))
  try {
    const { data } = await api.get("/boards")
    dispatch(setBoards(data))
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || "Ошибка загрузки досок"))
  } finally {
    dispatch(setLoading(false))
  }
}

export const createBoardThunk =
  (title: string, description?: string) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    try {
      const { data } = await api.post("/boards", { title, description })
      dispatch(addBoard(data))
      return { success: true, board: data }
    } catch (error: any) {
      dispatch(setError(error.response?.data?.message || "Ошибка создания доски"))
      return { success: false, error: error.response?.data?.message }
    } finally {
      dispatch(setLoading(false))
    }
  }

export const updateBoardThunk =
  (id: number, title: string, description?: string) => async (dispatch: AppDispatch) => {
    try {
      const { data } = await api.put(`/boards/${id}`, { title, description })
      dispatch(updateBoardState(data))
      return { success: true, board: data }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message }
    }
  }

export const deleteBoardThunk = (id: number) => async (dispatch: AppDispatch) => {
  try {
    await api.delete(`/boards/${id}`)
    dispatch(deleteBoardState(id))
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message }
  }
}

// Пользователи
export const fetchUsersThunk = () => async (dispatch: AppDispatch) => {
  try {
    const { data } = await api.get("/user") // Эндпоинт для получения всех пользователей
    dispatch(setUsers(data))
  } catch (error: any) {
    console.error("Ошибка загрузки пользователей:", error)
  }
}

// Колонки
export const fetchColumnsThunk = (boardId: number) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true))
  try {
    const { data } = await api.get(`/columns/board/${boardId}`)
    const sortedData = [...data].sort((a, b) => a.order - b.order)
    dispatch(setColumns(sortedData))
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || "Ошибка загрузки колонок"))
  } finally {
    dispatch(setLoading(false))
  }
}

export const createColumnThunk =
  (boardId: number, title: string) => async (dispatch: AppDispatch) => {
    try {
      const { data } = await api.post(`/columns?boardId=${boardId}`, { title })
      dispatch(addColumnState(data))
      return { success: true, column: data }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message }
    }
  }

export const updateColumnThunk =
  (columnId: number, title: string) => async (dispatch: AppDispatch) => {
    try {
      const { data } = await api.put(`/columns/${columnId}`, { title })
      dispatch(updateColumnState(data))
      return { success: true, column: data }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message }
    }
  }

export const deleteColumnThunk = (columnId: number) => async (dispatch: AppDispatch) => {
  try {
    await api.delete(`/columns/${columnId}`)
    dispatch(deleteColumnState(columnId))
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message }
  }
}

export const reorderColumnsThunk =
  (boardId: number, columnIds: number[]) => async (_: AppDispatch) => {
    try {
      await api.post(`/columns/reorder?boardId=${boardId}`, { columnIds })
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Ошибка перемещения колонки",
      }
    }
  }

// Задачи
export const createTaskThunk =
  (columnId: number, taskData: any) => async (dispatch: AppDispatch) => {
    try {
      const { data } = await api.post(`/tasks?columnId=${columnId}`, taskData)
      dispatch(addTaskState({ columnId, task: data }))
      return { success: true, task: data }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message }
    }
  }

export const updateTaskThunk =
  (taskId: number, columnId: number, updates: any) => async (dispatch: AppDispatch) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, updates)
      dispatch(updateTaskState({ columnId, task: data }))
      return { success: true, task: data }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message }
    }
  }

export const deleteTaskThunk =
  (taskId: number, columnId: number) => async (dispatch: AppDispatch) => {
    try {
      await api.delete(`/tasks/${taskId}`)
      dispatch(deleteTaskState({ columnId, taskId }))
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message }
    }
  }

export const moveTaskThunk =
  (taskId: number, _: number, toColumnId: number, position: number) => async (_: AppDispatch) => {
    try {
      const { data } = await api.post(`/tasks/${taskId}/move`, { columnId: toColumnId, position })
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || "Ошибка перемещения" }
    }
  }
