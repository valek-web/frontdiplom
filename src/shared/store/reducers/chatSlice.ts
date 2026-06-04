// shared/store/reducers/chatSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { AppDispatch } from "../store"
import api from "../../api/axiosInstance"

interface User {
  id: number
  name: string
  email: string
}

interface Message {
  id: number
  content: string
  chatId: string
  userId: number
  user: User
  createdAt: string
}

interface Participant {
  id: string
  userId: number
  user: User
  role: string
  unreadCount: number
  lastReadAt: string
  joinedAt: string
  isActive: boolean
}

interface Chat {
  id: string
  type: "PRIVATE" | "GROUP"
  name: string | null
  avatar: string | null
  description: string | null
  displayName: string
  displayAvatar: string | null
  createdAt: string
  updatedAt: string
  unreadCount: number
  lastMessage?: Message
  participantRole?: string
  participants?: Participant[]
}

interface ChatState {
  chats: Chat[]
  currentChat: Chat | null
  messages: Message[]
  loading: boolean
  error: string | null
  onlineUsers: number[]
  typingUsers: { [chatId: string]: number[] }
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
  onlineUsers: [],
  typingUsers: {},
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload
    },
    setCurrentChat: (state, action: PayloadAction<Chat | null>) => {
      state.currentChat = action.payload
      if (action.payload) {
        state.messages = []
      }
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      state.chats.unshift(action.payload)
    },
    updateChat: (state, action: PayloadAction<Chat>) => {
      const index = state.chats.findIndex((c) => c.id === action.payload.id)
      if (index !== -1) {
        state.chats[index] = action.payload
      }
      if (state.currentChat?.id === action.payload.id) {
        state.currentChat = action.payload
      }
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
      const chat = state.chats.find((c) => c.id === action.payload.chatId)
      if (chat) {
        chat.lastMessage = action.payload
        chat.updatedAt = action.payload.createdAt
      }
    },
    setOnlineUsers: (state, action: PayloadAction<number[]>) => {
      state.onlineUsers = action.payload
    },
    setTyping: (
      state,
      action: PayloadAction<{ chatId: string; userId: number; isTyping: boolean }>,
    ) => {
      const { chatId, userId, isTyping } = action.payload
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = []
      }
      if (isTyping) {
        if (!state.typingUsers[chatId].includes(userId)) {
          state.typingUsers[chatId].push(userId)
        }
      } else {
        state.typingUsers[chatId] = state.typingUsers[chatId].filter((id) => id !== userId)
      }
    },
    clearTyping: (state, action: PayloadAction<string>) => {
      state.typingUsers[action.payload] = []
    },
    updateUnreadCount: (state, action: PayloadAction<{ chatId: string; unreadCount: number }>) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId)
      if (chat) {
        chat.unreadCount = action.payload.unreadCount
      }
    },
  },
})

export const {
  setLoading,
  setError,
  setChats,
  setCurrentChat,
  addChat,
  updateChat,
  setMessages,
  addMessage,
  setOnlineUsers,
  setTyping,
  clearTyping,
  updateUnreadCount,
} = chatSlice.actions
export default chatSlice.reducer

// Thunks
export const fetchChats = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true))
  try {
    const { data } = await api.get("/chats")
    dispatch(setChats(data))
    return { success: true, data }
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || "Ошибка загрузки чатов"))
    return { success: false, error: error.response?.data?.message }
  } finally {
    dispatch(setLoading(false))
  }
}

export const createPrivateChat = (userId: number) => async (dispatch: AppDispatch) => {
  try {
    const { data } = await api.post(`/chats/private/${userId}`)
    dispatch(addChat(data))
    return { success: true, chat: data }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message }
  }
}

export const createGroupChat =
  (name: string, participantIds: number[], description?: string, avatar?: string) =>
  async (dispatch: AppDispatch) => {
    try {
      const { data } = await api.post("/chats/group", { name, participantIds, description, avatar })
      dispatch(addChat(data))
      return { success: true, chat: data }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message }
    }
  }

export const fetchMessages =
  (chatId: string, cursor?: number, limit: number = 50) =>
  async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    try {
      const { data } = await api.get(`/chats/${chatId}/messages`, {
        params: { cursor, limit },
      })
      dispatch(setMessages(data))
      return { success: true, messages: data }
    } catch (error: any) {
      dispatch(setError(error.response?.data?.message || "Ошибка загрузки сообщений"))
      return { success: false, error: error.response?.data?.message }
    } finally {
      dispatch(setLoading(false))
    }
  }

export const deleteMessage = (messageId: number) => async (_: AppDispatch) => {
  try {
    await api.delete(`/chats/messages/${messageId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message }
  }
}

export const addParticipants =
  (chatId: string, userIds: number[]) => async (dispatch: AppDispatch) => {
    try {
      const { data } = await api.post(`/chats/${chatId}/participants`, { userIds })
      dispatch(updateChat(data))
      return { success: true, chat: data }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message }
    }
  }

export const leaveChat = (chatId: string) => async (dispatch: AppDispatch) => {
  try {
    await api.post(`/chats/${chatId}/leave`)
    dispatch(setCurrentChat(null))
    dispatch(fetchChats())
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message }
  }
}
