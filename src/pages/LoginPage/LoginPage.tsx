import React, { useState } from "react"
import { Form, Input, Button, Card, message } from "antd"
import { MailOutlined, LockOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router"
import { useAppDispatch, useAppSelector } from "../../shared/hooks/redux"
import { login } from "../../shared/store/reducers/authSlice"

export const Login: React.FC = () => {
  const [loading, setLocalLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { loading: storeLoading } = useAppSelector((state) => state.auth)

  const onFinish = async (values: { email: string; password: string }) => {
    setLocalLoading(true)
    const result = await dispatch(login(values))
    if (result.success) {
      message.success("Вход выполнен")
      navigate("/profile")
    } else {
      message.error(result.error)
    }
    setLocalLoading(false)
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Card title="Вход в систему" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item label="Пароль" name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" size="large" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading || storeLoading}
            block
            size="large"
          >
            Войти
          </Button>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button type="link" onClick={() => navigate("/register")}>
              Нет аккаунта? Зарегистрироваться
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}
