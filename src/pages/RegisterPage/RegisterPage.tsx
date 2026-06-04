import React, { useState } from "react"
import { Form, Input, Button, Card, message, Steps } from "antd"
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router"
import { useAppDispatch, useAppSelector } from "../../shared/hooks/redux"
import { login, registerConfirm, registerStart } from "../../shared/store/reducers/authSlice"

export const Register: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLocalLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { loading: storeLoading } = useAppSelector((state) => state.auth)

  const onSendCode = async (values: { email: string; password: string; name: string }) => {
    setLocalLoading(true)
    const result = await dispatch(registerStart(values))
    if (result.success) {
      setEmail(values.email)
      setPassword(values.password)
      setCurrentStep(1)
      message.success("Код отправлен на почту")
    } else {
      message.error(result.error)
    }
    setLocalLoading(false)
  }

  const onConfirmCode = async (values: { code: string }) => {
    setLocalLoading(true)
    const result = await dispatch(registerConfirm(email, Number(values.code)))
    if (result.success) {
      message.success("Регистрация успешна")
      const loginResult = await dispatch(login({ email, password }))
      if (loginResult.success) {
        navigate("/profile")
      } else {
        navigate("/login")
      }
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
      <Card style={{ width: 400 }}>
        <Steps
          current={currentStep}
          items={[{ title: "Данные" }, { title: "Код" }]}
          style={{ marginBottom: 24 }}
        />

        {currentStep === 0 && (
          <Form onFinish={onSendCode} layout="vertical">
            <Form.Item label="Имя" name="name" rules={[{ required: true }]}>
              <Input prefix={<UserOutlined />} placeholder="Имя" />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item label="Пароль" name="password" rules={[{ required: true, min: 6 }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading || storeLoading} block>
              Зарегистрироваться
            </Button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Button type="link" onClick={() => navigate("/login")}>
                Уже есть аккаунт? Войти
              </Button>
            </div>
          </Form>
        )}

        {currentStep === 1 && (
          <Form onFinish={onConfirmCode}>
            <Form.Item label="Код подтверждения" name="code" rules={[{ required: true }]}>
              <Input placeholder="Код из письма" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading || storeLoading} block>
              Подтвердить
            </Button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Button type="link" onClick={() => navigate("/login")}>
                Вернуться ко входу
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  )
}
