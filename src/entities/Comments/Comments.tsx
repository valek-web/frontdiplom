import React, { useState } from "react"
import { Avatar, Button, Input, message, Space, Divider, Modal, Typography, Tooltip } from "antd"
import {
  UserOutlined,
  SendOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
  MessageOutlined,
} from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../shared/hooks/redux"
import { formatDate } from "../../shared/utils/formatDate"

const { Text, Paragraph } = Typography

interface Comment {
  id: number
  content: string
  postId: number
  userId: number
  user: {
    id: number
    name: string
    email: string
  }
  createdAt: string
}

interface CommentsProps {
  postId: number
  comments: Comment[]
  commentsCount: number
  loading?: boolean
  onAddComment: (postId: number, content: string) => any
  onEditComment?: (commentId: number, content: string) => any
  onDeleteComment: (postId: number, commentId: number) => any
  isOpen?: boolean
  onToggle?: () => void
  initialLimit?: number // количество отображаемых комментариев
}

export const Comments: React.FC<CommentsProps> = ({
  postId,
  comments,
  commentsCount,
  loading,
  onAddComment,
  onEditComment,
  onDeleteComment,
  isOpen = false,
  onToggle,
  initialLimit = 3, // по умолчанию показываем 3 комментария
}) => {
  const [commentText, setCommentText] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editText, setEditText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [visibleCount, setVisibleCount] = useState(initialLimit)
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      message.error("Введите текст комментария")
      return
    }

    setSubmitting(true)
    const result = await dispatch(onAddComment(postId, commentText))
    if (result.success) {
      setCommentText("")
      message.success("Комментарий добавлен")
      // При добавлении комментария увеличиваем видимое количество
      setVisibleCount((prev) => prev + 1)
    } else {
      message.error(result.error)
    }
    setSubmitting(false)
  }

  const handleEditComment = async (commentId: number) => {
    if (!editText.trim()) {
      message.error("Введите текст комментария")
      return
    }

    setSubmitting(true)
    if (onEditComment) {
      const result = await dispatch(onEditComment(commentId, editText))
      if (result.success) {
        setEditingCommentId(null)
        setEditText("")
        message.success("Комментарий обновлен")
      } else {
        message.error(result.error || "Ошибка обновления")
      }
    }
    setSubmitting(false)
  }

  const handleDeleteComment = async (commentId: number) => {
    Modal.confirm({
      title: "Удалить комментарий?",
      content: "Это действие нельзя отменить",
      okText: "Удалить",
      okType: "danger",
      cancelText: "Отмена",
      onOk: async () => {
        const result = await dispatch(onDeleteComment(postId, commentId))
        if (result.success) {
          message.success("Комментарий удален")
          // При удалении уменьшаем видимое количество
          setVisibleCount((prev) => Math.max(1, prev - 1))
        } else {
          message.error(result.error)
        }
      },
    })
  }

  const startEdit = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditText(comment.content)
  }

  const cancelEdit = () => {
    setEditingCommentId(null)
    setEditText("")
  }

  const loadMore = () => {
    setVisibleCount((prev) => prev + initialLimit)
  }

  // Сортируем комментарии от новых к старым
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  // Показываем только видимые комментарии
  const visibleComments = sortedComments.slice(0, visibleCount)
  const hasMore = visibleCount < commentsCount

  if (!isOpen) {
    return null
  }

  return (
    <div>
      <Divider style={{ margin: "16px 0" }} />

      {/* Заголовок с кнопкой закрытия */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text strong>Комментарии ({commentsCount})</Text>
        <Button type="link" size="small" onClick={onToggle}>
          Скрыть
        </Button>
      </div>

      {/* Комментарии */}
      <div>
        {visibleComments.length === 0 ? (
          <Text type="secondary" style={{ display: "block", textAlign: "center", padding: 16 }}>
            Нет комментариев. Будьте первым!
          </Text>
        ) : (
          <>
            {visibleComments.map((comment) => (
              <div key={comment.id} style={{ marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <Avatar icon={<UserOutlined />} size="small" />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}
                    >
                      <Text strong>{comment.user?.name || "Пользователь"}</Text>
                      <Tooltip title={formatDate(comment.createdAt)}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDate(comment.createdAt)}
                        </Text>
                      </Tooltip>
                    </div>

                    {editingCommentId === comment.id ? (
                      <div style={{ marginTop: 8 }}>
                        <Input.TextArea
                          rows={2}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                        />
                        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                          <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            loading={submitting}
                            onClick={() => handleEditComment(comment.id)}
                          >
                            Сохранить
                          </Button>
                          <Button size="small" icon={<CloseOutlined />} onClick={cancelEdit}>
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Paragraph style={{ margin: "8px 0 0 0" }}>{comment.content}</Paragraph>
                    )}

                    {comment.userId === user?.id && editingCommentId !== comment.id && (
                      <Space size="small" style={{ marginTop: 4 }}>
                        {onEditComment && (
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => startEdit(comment)}
                            style={{ padding: 0 }}
                          >
                            Редактировать
                          </Button>
                        )}
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{ padding: 0 }}
                        >
                          Удалить
                        </Button>
                      </Space>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Кнопка "Показать еще" */}
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Button type="link" onClick={loadMore} icon={<MessageOutlined />}>
                  Показать еще
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Форма добавления комментария */}
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Input.TextArea
          rows={2}
          placeholder="Написать комментарий..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={submitting || loading}
          onClick={handleAddComment}
        >
          Отправить
        </Button>
      </div>
    </div>
  )
}
