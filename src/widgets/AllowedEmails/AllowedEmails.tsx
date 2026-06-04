import { useEffect, useState } from "react"
import {
  Card,
  Table,
  Button,
  message,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Popconfirm,
} from "antd"
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../shared/hooks/redux"
import {
  fetchAllowedEmails,
  createAllowedEmail,
  deleteAllowedEmail,
  setError,
} from "../../shared/store/reducers/allowedEmailsSlice"
import api from "../../shared/api/axiosInstance"

const PERMISSIONS = [
  "ACCESS_TASKS",
  "READ_SALES",
  "WRITE_SALES",
  "READ_POST",
  "WRITE_POST",
  "ACCESS_ADMIN",
]

const PERMISSION_LABELS: Record<string, string> = {
  ACCESS_TASKS: "Доступ к задачам",
  READ_SALES: "Просмотр продаж",
  WRITE_SALES: "Редактирование продаж",
  READ_POST: "Просмотр постов",
  WRITE_POST: "Создание постов",
  ACCESS_ADMIN: "Доступ к админке",
  ACCESS_SALES: "Доступ к продажам",
  ACCESS_CHAT: "Доступ к чату",
}

export const AllowedEmails = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { emails, loading, error } = useAppSelector((state) => state.allowedEmails)
  const isAdmin = user?.permissions?.includes("ACCESS_ADMIN")

  const [permissionsModal, setPermissionsModal] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [addForm] = Form.useForm()
  const [permissionsForm] = Form.useForm()

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAllowedEmails())
    }
  }, [isAdmin, dispatch])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(setError(null))
    }
  }, [error, dispatch])

  const handleAddEmail = async (values: { email: string }) => {
    try {
      dispatch(createAllowedEmail({ email: values.email, permissions: [] }))
      message.success("Email успешно добавлен")
      addForm.resetFields()
    } catch (err: any) {
      message.error(err.response?.data?.message || "Ошибка добавления email")
    }
  }

  const handleDeleteEmail = async (id: number, email: string) => {
    try {
      dispatch(deleteAllowedEmail(id))
      message.success(`Email ${email} удален`)
    } catch (err: any) {
      message.error(err.response?.data?.message || "Ошибка удаления email")
    }
  }

  const openPermissionsModal = (record: any) => {
    setSelectedEmail(record)
    permissionsForm.setFieldsValue({
      permissions: record.user?.permissions || [],
    })
    setPermissionsModal(true)
  }

  const savePermissions = async (values: { permissions: string[] }) => {
    try {
      await api.patch(`/admin/emails/users/${selectedEmail.user.id}/permissions`, values)
      message.success("Права успешно обновлены")
      setPermissionsModal(false)
      dispatch(fetchAllowedEmails())
    } catch (err: any) {
      message.error(err.response?.data?.message || "Ошибка обновления прав")
    }
  }

  if (!isAdmin) return null

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Статус",
      key: "status",
      render: (record: any) =>
        record.user ? (
          <Tag color="green">Зарегистрирован</Tag>
        ) : (
          <Tag color="default">Не зарегистрирован</Tag>
        ),
    },
    {
      title: "Права",
      key: "permissions",
      render: (record: any) =>
        record.user?.permissions?.map((p: string) => (
          <Tag key={p} color="blue">
            {PERMISSION_LABELS[p] || p}
          </Tag>
        )),
    },
    {
      title: "Дата добавления",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("ru-RU"),
    },
    {
      title: "Действия",
      key: "actions",
      width: 180,
      render: (record: any) => (
        <Space>
          {record.user && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => openPermissionsModal(record)}
              size="small"
            >
              Права
            </Button>
          )}
          <Popconfirm
            title="Удалить email"
            description={`Вы уверены, что хотите удалить ${record.email}?`}
            onConfirm={() => handleDeleteEmail(record.id, record.email)}
            okText="Да"
            cancelText="Нет"
            okType="danger"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card style={{ marginTop: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Управление доступом</h3>
          <span style={{ color: "#666", fontSize: 12 }}>
            Список email, разрешенных для регистрации
          </span>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={emails}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Всего ${total} email`,
        }}
      />

      <Card style={{ marginTop: 16 }} size="small">
        <Form form={addForm} onFinish={handleAddEmail} layout="inline" style={{ width: "100%" }}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Введите email" },
              { type: "email", message: "Введите корректный email" },
            ]}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <Input placeholder="user@example.com" size="middle" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Добавить email
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="Редактирование прав"
        open={permissionsModal}
        onCancel={() => {
          setPermissionsModal(false)
          permissionsForm.resetFields()
        }}
        footer={null}
        width={500}
      >
        <Form form={permissionsForm} onFinish={savePermissions} layout="vertical">
          <Form.Item
            name="permissions"
            label="Права доступа"
            tooltip="Выберите права, которые будут у пользователя"
          >
            <Select
              mode="multiple"
              placeholder="Выберите права"
              options={PERMISSIONS.map((p) => ({
                value: p,
                label: PERMISSION_LABELS[p],
              }))}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Сохранить права
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
