// hooks/useChatSocket.ts
import { useEffect, useRef } from "react"

import io, { Socket } from "socket.io-client"
import { useAppDispatch, useAppSelector } from "./redux"
import { setTyping, addMessage, fetchChats, updateUnreadCount } from "../store/reducers/chatSlice"

export const useChatSocket = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!user?.id) return

    const socket = io("https://api.studio-av.ru/chat", {
      auth: { userId: user.id },
      transports: ["websocket"],
    })

    socketRef.current = socket

    socket.on("connect", () => {
      console.log("WebSocket connected")
    })

    socket.on("connected", (data) => {
      console.log("Connected to chat server:", data)
    })

    socket.on("new-message", (message) => {
      dispatch(addMessage(message))
    })

    socket.on("chat-updated", () => {
      dispatch(fetchChats())
    })

    socket.on("chat-read", (data: { chatId: string; userId: number }) => {
      if (data.userId !== user?.id) {
        dispatch(updateUnreadCount({ chatId: data.chatId, unreadCount: 0 }))
      }
    })

    socket.on("user-typing", (data: { userId: number; chatId: string; isTyping: boolean }) => {
      dispatch(setTyping(data))
      setTimeout(() => {
        dispatch(setTyping({ ...data, isTyping: false }))
      }, 1000)
    })

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected")
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [user?.id, dispatch])

  const sendMessage = (chatId: string, content: string) => {
    if (socketRef.current) {
      socketRef.current.emit("send-message", { chatId, content })
    }
  }

  const markChatAsRead = (chatId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("mark-read", { chatId })
    }
  }

  const sendTyping = (chatId: string, isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit("typing", { chatId, isTyping })
    }
  }

  const joinChat = (chatId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("join-chat", { chatId })
    }
  }

  const leaveChatRoom = (chatId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("leave-chat", { chatId })
    }
  }

  return {
    sendMessage,
    markChatAsRead,
    sendTyping,
    joinChat,
    leaveChat: leaveChatRoom,
    isConnected: socketRef.current?.connected || false,
  }
}
