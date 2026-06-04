import React, { useEffect, useRef, useState, useCallback } from "react"
import {
  List,
  Input,
  Button,
  Avatar,
  Typography,
  Spin,
  Empty,
  message,
  Badge,
  Card,
  Space,
  Form,
  Divider,
  Dropdown,
  Modal,
  Select,
} from "antd"
import {
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
  LogoutOutlined,
  WechatOutlined,
} from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../shared/hooks/redux"
import {
  fetchChats,
  fetchMessages,
  setCurrentChat,
  createPrivateChat,
  createGroupChat,
  leaveChat,
} from "../../shared/store/reducers/chatSlice"
import { fetchUsersThunk } from "../../shared/store/reducers/kanbanSlice"
import { useChatSocket } from "../../shared/hooks/useChatSocket"
import type { MenuProps } from "antd"

const { Text } = Typography
const { TextArea } = Input

export const Chat: React.FC = () => {
  const dispatch = useAppDispatch()
  const { chats, currentChat, messages, loading } = useAppSelector((state) => state.chat)
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const { users } = useAppSelector((state) => state.kanban)
  const { sendMessage, markChatAsRead, sendTyping, joinChat } = useChatSocket()

  const [messageText, setMessageText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false)
  const [createPrivateModalOpen, setCreatePrivateModalOpen] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentChatIdRef = useRef<string | null>(null) // Добавляем ref для отслеживания текущего чата

  useEffect(() => {
    dispatch(fetchChats())
    dispatch(fetchUsersThunk())
  }, [dispatch])

  // Оптимизируем запрос сообщений - только при реальной смене чата
  useEffect(() => {
    if (currentChat && currentChat.id !== currentChatIdRef.current) {
      currentChatIdRef.current = currentChat.id
      dispatch(fetchMessages(currentChat.id))
      markChatAsRead(currentChat.id)
      joinChat(currentChat.id)
    }
  }, [currentChat, dispatch, markChatAsRead, joinChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!messageText.trim() || !currentChat) return
    sendMessage(currentChat.id, messageText)
    setMessageText("")
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }
    if (isTyping) {
      sendTyping(currentChat.id, false)
      setIsTyping(false)
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)

    if (!currentChat) return

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }

    if (!isTyping && e.target.value) {
      setIsTyping(true)
      sendTyping(currentChat.id, true)
    }

    typingTimerRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        sendTyping(currentChat.id, false)
      }
    }, 1000)
  }

  const handleSelectChat = useCallback(
    (chat: any) => {
      dispatch(setCurrentChat(chat))
    },
    [dispatch],
  )

  const handleCreatePrivateChat = async () => {
    if (!selectedUser) {
      message.error("Выберите пользователя")
      return
    }
    const result = await dispatch(createPrivateChat(selectedUser))
    if (result.success) {
      message.success("Личный чат создан")
      setCreatePrivateModalOpen(false)
      setSelectedUser(null)
      dispatch(setCurrentChat(result.chat))
    } else {
      message.error(result.error || "Ошибка создания чата")
    }
  }

  const handleCreateGroupChat = async () => {
    if (!groupName.trim()) {
      message.error("Введите название группы")
      return
    }
    if (selectedUsers.length === 0) {
      message.error("Выберите хотя бы одного участника")
      return
    }
    const result = await dispatch(createGroupChat(groupName, selectedUsers))
    if (result.success) {
      message.success("Групповой чат создан")
      setCreateGroupModalOpen(false)
      setGroupName("")
      setSelectedUsers([])
      dispatch(setCurrentChat(result.chat))
    } else {
      message.error(result.error)
    }
  }

  const handleLeaveChat = () => {
    if (!currentChat) return
    Modal.confirm({
      title: "Выйти из чата",
      content: "Вы уверены, что хотите выйти из этого чата?",
      onOk: async () => {
        const result = await dispatch(leaveChat(currentChat.id))
        if (result.success) {
          message.success("Вы вышли из чата")
          currentChatIdRef.current = null // Сбрасываем ref при выходе
        } else {
          message.error(result.error)
        }
      },
    })
  }

  const getChatDisplayInfo = (chat: any) => {
    if (chat.type === "PRIVATE") {
      const otherParticipant = chat.participants?.find((p: any) => p.userId !== currentUser?.id)
      return {
        name: otherParticipant?.user?.name || "Неизвестный",
        avatar: otherParticipant?.user?.avatar,
      }
    }
    return {
      name: chat.name || "Групповой чат",
      avatar: chat.avatar,
    }
  }

  const chatMenuItems: MenuProps["items"] =
    currentChat?.type === "GROUP"
      ? [
          {
            key: "leave",
            icon: <LogoutOutlined />,
            label: "Выйти из чата",
            danger: true,
            onClick: handleLeaveChat,
          },
        ]
      : []

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", gap: 16, padding: 24 }}>
      {/* Список чатов */}
      <Card
        style={{
          width: 320,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        bodyStyle={{ flex: 1, overflow: "auto", padding: 0 }}
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Чаты</span>
            <Space size="small">
              <Button
                type="primary"
                size="small"
                icon={<UserOutlined />}
                onClick={() => setCreatePrivateModalOpen(true)}
              >
                Личный
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<TeamOutlined />}
                onClick={() => setCreateGroupModalOpen(true)}
              >
                Группа
              </Button>
            </Space>
          </div>
        }
      >
        <List
          loading={loading}
          dataSource={chats}
          renderItem={(chat) => {
            const { name, avatar } = getChatDisplayInfo(chat)
            return (
              <List.Item
                key={chat.id}
                style={{
                  cursor: "pointer",
                  background: currentChat?.id === chat.id ? "#15325b" : "transparent",
                  padding: "12px 16px",
                  margin: 0,
                  borderRadius: 8,
                }}
                onClick={() => handleSelectChat(chat)}
              >
                <List.Item.Meta
                  avatar={
                    chat.type === "GROUP" ? (
                      <Avatar icon={<TeamOutlined />} src={avatar} />
                    ) : (
                      <Avatar icon={<UserOutlined />} src={avatar} />
                    )
                  }
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text strong>{name}</Text>
                      {chat.unreadCount > 0 && (
                        <Badge
                          count={chat.unreadCount}
                          size="small"
                          style={{ backgroundColor: "#1890ff" }}
                        />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {chat.lastMessage?.content?.substring(0, 40) || "Нет сообщений"}
                      </Text>
                      {chat.type === "GROUP" && (
                        <Text type="secondary" style={{ fontSize: 10, display: "block" }}>
                          {chat.participants?.length} участников
                        </Text>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )
          }}
        />
      </Card>

      {/* Область чата */}
      <Card
        style={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        bodyStyle={{ flex: 1, display: "flex", flexDirection: "column", padding: 0 }}
        title={
          currentChat ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Space>
                {currentChat.type === "GROUP" ? (
                  <Avatar icon={<TeamOutlined />} src={currentChat.avatar} />
                ) : (
                  <Avatar icon={<UserOutlined />} src={getChatDisplayInfo(currentChat).avatar} />
                )}
                <div>
                  <Text strong>{getChatDisplayInfo(currentChat).name}</Text>
                  {currentChat.type === "PRIVATE" && (
                    <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                      Личный чат
                    </Text>
                  )}
                </div>
              </Space>
              {currentChat.type === "GROUP" && (
                <Dropdown menu={{ items: chatMenuItems }} trigger={["click"]}>
                  <Button icon={<LogoutOutlined />} size="small">
                    Выйти
                  </Button>
                </Dropdown>
              )}
            </div>
          ) : (
            <span>Выберите чат</span>
          )
        }
      >
        {currentChat ? (
          <>
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: 20 }}>
                  <Spin />
                </div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div style={{ textAlign: "center", padding: 40 }}>
                      <WechatOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                      <Text type="secondary" style={{ display: "block", marginTop: 16 }}>
                        Нет сообщений. Напишите что-нибудь!
                      </Text>
                    </div>
                  )}
                  {messages.map((message) => {
                    const isOwn = message.userId === currentUser?.id
                    return (
                      <div
                        key={message.id}
                        style={{
                          display: "flex",
                          justifyContent: isOwn ? "flex-end" : "flex-start",
                          marginBottom: 12,
                        }}
                      >
                        <div style={{ maxWidth: "70%" }}>
                          {!isOwn && (
                            <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                              {message.user?.name}
                            </Text>
                          )}
                          <div
                            style={{
                              background: isOwn ? "#1890ff" : "#f0f0f0",
                              color: isOwn ? "white" : "black",
                              padding: "8px 12px",
                              borderRadius: 12,
                              wordWrap: "break-word",
                            }}
                          >
                            <Text style={{ color: isOwn ? "white" : "black" }}>
                              {message.content}
                            </Text>
                          </div>
                          <Text type="secondary" style={{ fontSize: 10, marginLeft: 8 }}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </Text>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <Divider style={{ margin: 0 }} />

            <div style={{ padding: 16 }}>
              <Space.Compact style={{ width: "100%" }}>
                <TextArea
                  value={messageText}
                  onChange={handleTyping}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Введите сообщение..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  style={{ resize: "none" }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                />
              </Space.Compact>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Empty description="Выберите чат или создайте новый" />
          </div>
        )}
      </Card>

      {/* Модалка создания личного чата */}
      <Modal
        title="Создать личный чат"
        open={createPrivateModalOpen}
        onOk={handleCreatePrivateChat}
        onCancel={() => {
          setCreatePrivateModalOpen(false)
          setSelectedUser(null)
        }}
        okText="Создать"
        cancelText="Отмена"
      >
        <Form layout="vertical">
          <Form.Item label="Выберите пользователя" required>
            <Select
              placeholder="Выберите пользователя для чата"
              value={selectedUser}
              onChange={setSelectedUser}
              optionFilterProp="children"
              showSearch
            >
              {users
                .filter((u) => u.id !== currentUser?.id)
                .map((user) => (
                  <Select.Option key={user.id} value={user.id}>
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      {user.name} ({user.email})
                    </Space>
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модалка создания группового чата */}
      <Modal
        title="Создать групповой чат"
        open={createGroupModalOpen}
        onOk={handleCreateGroupChat}
        onCancel={() => {
          setCreateGroupModalOpen(false)
          setGroupName("")
          setSelectedUsers([])
        }}
        okText="Создать"
        cancelText="Отмена"
      >
        <Form layout="vertical">
          <Form.Item label="Название группы" required>
            <Input
              placeholder="Введите название группы"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Участники" required>
            <Select
              mode="multiple"
              placeholder="Выберите участников"
              value={selectedUsers}
              onChange={setSelectedUsers}
              optionFilterProp="children"
              showSearch
            >
              {users
                .filter((u) => u.id !== currentUser?.id)
                .map((user) => (
                  <Select.Option key={user.id} value={user.id}>
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      {user.name} ({user.email})
                    </Space>
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
