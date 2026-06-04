import React, { useState, useEffect } from "react"
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Avatar,
  Space,
  Typography,
  Descriptions,
  Divider,
} from "antd"
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  MailOutlined,
  IdcardOutlined,
} from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../shared/hooks/redux"
import { updateProfile } from "../../shared/store/reducers/authSlice"
import { AllowedEmails } from "../../widgets/AllowedEmails/AllowedEmails"
import { formatDate } from "../../shared/utils/formatDate"

const { Title, Text } = Typography

export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [form] = Form.useForm()
  const dispatch = useAppDispatch()
  const { user, loading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (user) {
      form.setFieldsValue({ name: user.name })
    }
  }, [user, form])

  const handleUpdate = async (values: { name: string }) => {
    if (!user) return

    const result = await dispatch(updateProfile(user.id, values.name))
    if (result.success) {
      message.success("Профиль успешно обновлен")
      setIsEditing(false)
    } else {
      message.error(result.error)
    }
  }

  if (!user) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: 40 }}>
          <Title level={4}>Пользователь не найден</Title>
          <Button type="primary" onClick={() => (window.location.href = "/login")}>
            Войти
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Профиль пользователя
        </Title>
        <Text type="secondary">Управление личной информацией</Text>
      </div>

      {/* Основная информация профиля */}
      <Card>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Avatar size={100} icon={<UserOutlined />} />
          <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
            {user.name}
          </Title>
          <Text type="secondary">{user.email}</Text>
        </div>

        <Divider />

        {!isEditing ? (
          <>
            <Descriptions column={2} bordered>
              <Descriptions.Item
                label={
                  <span>
                    <UserOutlined /> Имя
                  </span>
                }
              >
                {user.name}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <MailOutlined /> Email
                  </span>
                }
              >
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <IdcardOutlined /> ID
                  </span>
                }
              >
                {user.id}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <IdcardOutlined /> ID
                  </span>
                }
              >
                {formatDate(user.createdAt)}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
                size="large"
              >
                Редактировать профиль
              </Button>
            </div>
          </>
        ) : (
          <Form form={form} onFinish={handleUpdate} layout="vertical">
            <Form.Item label="Имя" name="name" rules={[{ required: true, message: "Введите имя" }]}>
              <Input placeholder="Ваше имя" size="large" />
            </Form.Item>
            <Form.Item label="Email">
              <Input value={user.email} disabled size="large" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                >
                  Сохранить
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setIsEditing(false)
                    form.setFieldsValue({ name: user.name })
                  }}
                  size="large"
                >
                  Отмена
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>

      {/* Компонент управления разрешенными email (только для админов) */}
      <AllowedEmails />
    </div>
  )
}
