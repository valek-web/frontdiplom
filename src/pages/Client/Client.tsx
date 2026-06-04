import React, { useEffect, useState } from "react"
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Card,
  Typography,
  Tooltip,
  Avatar,
  Row,
  Col,
  Badge,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  RiseOutlined,
} from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../shared/hooks/redux"
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
} from "../../shared/store/reducers/clientSlice"
import type { IClient } from "../../shared/store/reducers/clientSlice"
import { useNavigate } from "react-router"

const { Title, Text } = Typography
const { Option } = Select

const statusColors = {
  NEW: "blue",
  CONTACTED: "cyan",
  QUALIFIED: "geekblue",
  PROPOSAL: "purple",
  NEGOTIATION: "orange",
  CLOSED_WON: "green",
  CLOSED_LOST: "red",
  INACTIVE: "default",
}

const statusLabels = {
  NEW: "Новый",
  CONTACTED: "Связались",
  QUALIFIED: "Квалифицирован",
  PROPOSAL: "Предложение отправлено",
  NEGOTIATION: "Переговоры",
  CLOSED_WON: "Сделка выиграна",
  CLOSED_LOST: "Сделка проиграна",
  INACTIVE: "Неактивный",
}

const priorityColors = {
  HIGH: "red",
  MEDIUM: "orange",
  LOW: "default",
}

const priorityLabels = {
  HIGH: "Высокий",
  MEDIUM: "Средний",
  LOW: "Низкий",
}

export const Client: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { clients, loading } = useAppSelector((state) => state.client)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingClient, setEditingClient] = useState<IClient | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchClients())
  }, [dispatch])

  const handleSubmit = async (values: any) => {
    try {
      if (editingClient) {
        await dispatch(updateClient({ id: editingClient.id, data: values })).unwrap()
        message.success("Клиент обновлен")
      } else {
        await dispatch(createClient(values)).unwrap()
        message.success("Клиент создан")
      }
      setModalVisible(false)
      form.resetFields()
      setEditingClient(null)
    } catch (error: any) {
      message.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteClient(id)).unwrap()
      message.success("Клиент удален")
    } catch (error: any) {
      message.error(error)
    }
  }

  const handleViewSales = (clientId: number) => {
    navigate(`/sale?clientId=${clientId}`)
  }

  const columns = [
    {
      title: "Клиент",
      dataIndex: "name",
      fixed: "left" as const,
      width: 200,
      render: (text: string, record: IClient) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1677ff" }} />
          <Space direction="vertical" size={0}>
            <Text strong>{text}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record.id}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Контакты",
      width: 220,
      render: (_: any, record: IClient) => (
        <Space direction="vertical" size={4}>
          <Space size={4}>
            <MailOutlined style={{ color: "#999" }} />
            <Text>{record.email || "—"}</Text>
          </Space>
          <Space size={4}>
            <PhoneOutlined style={{ color: "#999" }} />
            <Text>{record.phone || "—"}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Компания",
      width: 180,
      render: (_: any, record: IClient) => (
        <Space direction="vertical" size={0}>
          <Space size={4}>
            <ShopOutlined style={{ color: "#999" }} />
            <Text>{record.company || "—"}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.position || "—"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Адрес",
      width: 180,
      render: (_: any, record: IClient) => (
        <Space size={4}>
          <EnvironmentOutlined style={{ color: "#999" }} />
          <Text>{[record.city, record.country].filter(Boolean).join(", ") || "—"}</Text>
        </Space>
      ),
    },
    {
      title: "Статус",
      width: 100,
      align: "center" as const,
      render: (_: any, record: IClient) => (
        <Badge color={statusColors[record.status]} text={statusLabels[record.status]} />
      ),
    },
    {
      title: "Приоритет",
      width: 100,
      align: "center" as const,
      render: (_: any, record: IClient) => (
        <Tag color={priorityColors[record.priority]}>{priorityLabels[record.priority]}</Tag>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      width: 140,
      fixed: "right" as const,
      render: (_: any, record: IClient) => (
        <Space>
          <Tooltip title="Продажи">
            <Button
              type="link"
              icon={<RiseOutlined />}
              onClick={() => handleViewSales(record.id)}
            />
          </Tooltip>
          <Tooltip title="Редактировать">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingClient(record)
                form.setFieldsValue(record)
                setModalVisible(true)
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Удалить клиента"
            description="Это действие нельзя отменить. Все связанные продажи будут отвязаны."
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Tooltip title="Удалить">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            Управление клиентами
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingClient(null)
              form.resetFields()
              form.setFieldsValue({ status: "NEW", priority: "MEDIUM" })
              setModalVisible(true)
            }}
          >
            Добавить клиента
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={clients}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Всего ${total} клиентов`,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Modal
        title={editingClient ? "Редактировать клиента" : "Новый клиент"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingClient(null)
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Имя клиента"
                rules={[{ required: true, message: "Введите имя клиента", min: 2 }]}
              >
                <Input placeholder="Иван Петров" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: "email", message: "Введите корректный email" }]}
              >
                <Input placeholder="client@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Телефон">
                <Input placeholder="+7 (999) 123-45-67" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="company" label="Компания">
                <Input placeholder="ООО Ромашка" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="position" label="Должность">
                <Input placeholder="Директор" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="address" label="Адрес">
                <Input placeholder="ул. Ленина, 10" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="Город">
                <Input placeholder="Москва" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="country" label="Страна">
                <Input placeholder="Россия" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Статус" initialValue="NEW">
                <Select>
                  <Option value="NEW">Новый</Option>
                  <Option value="CONTACTED">Связались</Option>
                  <Option value="QUALIFIED">Квалифицирован</Option>
                  <Option value="PROPOSAL">Предложение отправлено</Option>
                  <Option value="NEGOTIATION">Переговоры</Option>
                  <Option value="CLOSED_WON">Сделка выиграна</Option>
                  <Option value="CLOSED_LOST">Сделка проиграна</Option>
                  <Option value="INACTIVE">Неактивный</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Приоритет" initialValue="MEDIUM">
                <Select>
                  <Option value="HIGH">Высокий</Option>
                  <Option value="MEDIUM">Средний</Option>
                  <Option value="LOW">Низкий</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingClient ? "Сохранить" : "Создать"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
