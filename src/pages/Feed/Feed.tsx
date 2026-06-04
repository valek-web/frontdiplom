import React, { useState, useEffect } from "react"
import {
  Card,
  Avatar,
  Typography,
  Button,
  Input,
  Form,
  message,
  Space,
  Pagination,
  Empty,
  Spin,
  Modal,
  Image as AntImage,
} from "antd"
import {
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../shared/hooks/redux"
import {
  fetchPosts,
  createPost,
  likePost,
  unlikePost,
  deletePost,
  addComment,
  deleteComment,
  updateComment,
} from "../../shared/store/reducers/feedSlice"
import { Comments } from "../../entities/Comments/Comments"
import { formatDate } from "../../shared/utils/formatDate"

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

export const Feed: React.FC = () => {
  const dispatch = useAppDispatch()
  const { posts, total, loading, currentPage, pageSize } = useAppSelector((state) => state.feed)
  const permissions = useAppSelector((state) => state.auth.user?.permissions)
  const { user } = useAppSelector((state) => state.auth)
  const [createModal, setCreateModal] = useState(false)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [openComments, setOpenComments] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    dispatch(fetchPosts(currentPage, pageSize))
  }, [dispatch, currentPage, pageSize])

  const handleCreatePost = async (values: { content: string }) => {
    if (!values.content.trim()) {
      message.error("Введите текст поста")
      return
    }

    setSubmitting(true)
    const result = await dispatch(createPost({ content: values.content }))
    if (result.success) {
      message.success("Пост опубликован")
      form.resetFields()
      setCreateModal(false)
      dispatch(fetchPosts(1, pageSize))
    } else {
      message.error(result.error)
    }
    setSubmitting(false)
  }

  const handleLike = async (postId: number, isLiked: boolean) => {
    if (isLiked) {
      await dispatch(unlikePost(postId))
    } else {
      await dispatch(likePost(postId))
    }
  }

  const handleDelete = async (postId: number) => {
    Modal.confirm({
      title: "Удалить пост?",
      content: "Это действие нельзя отменить",
      okText: "Удалить",
      okType: "danger",
      cancelText: "Отмена",
      onOk: async () => {
        const result = await dispatch(deletePost(postId))
        if (result.success) {
          message.success("Пост удален")
        } else {
          message.error(result.error)
        }
      },
    })
  }

  const toggleComments = (postId: number) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {permissions?.includes("WRITE_POST") && (
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>Лента</Title>
          <Button type="primary" size="large" onClick={() => setCreateModal(true)} block>
            Создать пост
          </Button>
        </div>
      )}

      <Spin spinning={loading}>
        {posts.length === 0 && !loading ? (
          <Empty description="Нет постов" />
        ) : (
          <>
            {posts.map((post) => {
              const isLiked = post.likes?.some((like: any) => like.userId === user?.id)
              const likeCount = post.likes?.length || 0
              const isAuthor = post.authorId === user?.id
              const comments = post.comments || []
              const commentsCount = post.commentsCount || 0
              const isCommentsOpen = openComments[post.id] || false

              return (
                <Card
                  key={post.id}
                  style={{ marginBottom: 16 }}
                  actions={[
                    <Button
                      type="text"
                      icon={
                        isLiked ? <HeartFilled style={{ color: "#ff4d4f" }} /> : <HeartOutlined />
                      }
                      onClick={() => handleLike(post.id, isLiked)}
                    >
                      {likeCount > 0 && likeCount}
                    </Button>,
                    <Button
                      type="text"
                      icon={<MessageOutlined />}
                      onClick={() => toggleComments(post.id)}
                    >
                      {commentsCount > 0 && commentsCount}
                    </Button>,
                    isAuthor && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(post.id)}
                      >
                        Удалить
                      </Button>
                    ),
                  ].filter(Boolean)}
                >
                  <Card.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <Text strong>{post.author?.name || "Пользователь"}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDate(post.createdAt)}
                        </Text>
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph style={{ marginTop: 12, marginBottom: 12 }}>
                          {post.content}
                        </Paragraph>
                        {post.images?.path && (
                          <div style={{ marginTop: 12 }}>
                            <AntImage
                              src={`http://localhost:3000${post.images.path}`}
                              alt="post image"
                              style={{ maxWidth: "100%", maxHeight: 400, objectFit: "cover" }}
                              preview
                            />
                          </div>
                        )}
                        {post.videos?.path && (
                          <div style={{ marginTop: 12 }}>
                            <video
                              src={`http://localhost:3000${post.videos.path}`}
                              controls
                              style={{ maxWidth: "100%", maxHeight: 400 }}
                            />
                          </div>
                        )}

                        {/* Компонент комментариев */}
                        <Comments
                          postId={post.id}
                          comments={comments}
                          commentsCount={commentsCount}
                          onAddComment={addComment}
                          onEditComment={updateComment}
                          onDeleteComment={deleteComment}
                          isOpen={isCommentsOpen}
                          onToggle={() => toggleComments(post.id)}
                        />
                      </div>
                    }
                  />
                </Card>
              )
            })}

            {total > pageSize && (
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={(page) => dispatch(fetchPosts(page, pageSize))}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </Spin>

      <Modal
        title="Создать пост"
        open={createModal}
        onCancel={() => {
          setCreateModal(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleCreatePost} layout="vertical">
          <Form.Item name="content" rules={[{ required: true, message: "Введите текст поста" }]}>
            <TextArea rows={4} placeholder="Что у вас нового?" maxLength={500} showCount />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Опубликовать
              </Button>
              <Button onClick={() => setCreateModal(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
