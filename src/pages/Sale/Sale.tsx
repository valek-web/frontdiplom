import React, { useEffect, useState } from "react"
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Card,
  Typography,
  Tooltip,
  Tag,
  Descriptions,
  Divider,
  List,
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
  MessageOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CommentOutlined,
} from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "../../shared/hooks/redux"
import {
  fetchSales,
  createSale,
  updateSale,
  deleteSale,
  addSaleComment,
} from "../../shared/store/reducers/saleSlice"
import type { ISale, IProduct } from "../../shared/store/reducers/saleSlice"
import { fetchClients } from "../../shared/store/reducers/clientSlice"
import { useSearchParams } from "react-router"
import { CommentItem } from "../../shared/ui/CommentItem"

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price)
}

export const Sale: React.FC = () => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const clientIdParam = searchParams.get("clientId")

  const { sales, loading } = useAppSelector((state) => state.sale)
  const { clients } = useAppSelector((state) => state.client)
  const { user } = useAppSelector((state) => state.auth)

  const [modalVisible, setModalVisible] = useState(false)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [commentModalVisible, setCommentModalVisible] = useState(false)
  const [editingSale, setEditingSale] = useState<ISale | null>(null)
  const [selectedSale, setSelectedSale] = useState<ISale | null>(null)
  const [commentText, setCommentText] = useState("")
  const [form] = Form.useForm()
  const [products, setProducts] = useState<IProduct[]>([{ name: "", quantity: 1, price: 0 }])

  useEffect(() => {
    dispatch(fetchSales())
    dispatch(fetchClients())
  }, [dispatch])

  // Фильтрация продаж по clientId из URL
  const filteredSales = clientIdParam
    ? sales.filter((s) => s.clientId === Number(clientIdParam))
    : sales

  const handleAddProduct = () => {
    setProducts([...products, { name: "", quantity: 1, price: 0 }])
  }

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  const handleProductChange = (index: number, field: keyof IProduct, value: string | number) => {
    const newProducts = [...products]
    newProducts[index] = { ...newProducts[index], [field]: value }
    setProducts(newProducts)
  }

  const calculateTotal = () => {
    return products.reduce((sum, p) => sum + p.price * p.quantity, 0)
  }

  const handleSubmit = async (values: any) => {
    const saleData = {
      ...values,
      amount: calculateTotal(),
      products: products.filter((p) => p.name && p.price > 0),
    }

    try {
      if (editingSale) {
        await dispatch(updateSale({ id: editingSale.id, data: saleData })).unwrap()
        message.success("Продажа обновлена")
      } else {
        await dispatch(createSale(saleData)).unwrap()
        message.success("Продажа создана")
      }
      setModalVisible(false)
      form.resetFields()
      setEditingSale(null)
      setProducts([{ name: "", quantity: 1, price: 0 }])
    } catch (error: any) {
      message.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteSale(id)).unwrap()
      message.success("Продажа удалена")
    } catch (error: any) {
      message.error(error)
    }
  }

  const handleAddComment = async () => {
    if (!selectedSale || !commentText.trim()) return

    try {
      await dispatch(addSaleComment({ id: selectedSale.id, comment: commentText })).unwrap()
      message.success("Комментарий добавлен")
      setCommentText("")
      setCommentModalVisible(false)
      if (selectedSale) {
        const updatedSale = sales.find((s) => s.id === selectedSale.id)
        if (updatedSale) setSelectedSale(updatedSale)
      }
    } catch (error: any) {
      message.error(error)
    }
  }

  const handleCloseSale = async (sale: ISale) => {
    if (sale.closedAt) {
      await dispatch(updateSale({ id: sale.id, data: { closedAt: null } })).unwrap()
      message.success("Сделка возобновлена")
    } else {
      await dispatch(
        updateSale({ id: sale.id, data: { closedAt: new Date().toISOString() } }),
      ).unwrap()
      message.success("Сделка закрыта")
    }
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
    },
    {
      title: "Название",
      dataIndex: "title",
      width: 200,
      render: (text: string, record: ISale) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.closedAt && (
            <Tag color="default" style={{ marginTop: 4 }}>
              Закрыта
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Клиент",
      width: 180,
      render: (_: any, record: ISale) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <Text>{record.client?.name || `ID: ${record.clientId}`}</Text>
        </Space>
      ),
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      width: 120,
      align: "right" as const,
      render: (amount: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatPrice(amount)}
        </Text>
      ),
    },
    {
      title: "Менеджер",
      width: 150,
      render: (_: any, record: ISale) => (
        <Space size={4}>
          <UserOutlined />
          <Text>{record.manager?.email || `ID: ${record.managerId}`}</Text>
        </Space>
      ),
    },
    {
      title: "Дата создания",
      dataIndex: "createdAt",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString("ru-RU"),
    },
    {
      title: "Комментарии",
      dataIndex: "comments",
      width: 80,
      align: "center" as const,
      render: (comments: string[]) => (
        <Badge count={comments?.length || 0} showZero>
          <MessageOutlined style={{ fontSize: 18 }} />
        </Badge>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      width: 180,
      fixed: "right" as const,
      render: (_: any, record: ISale) => (
        <Space>
          <Tooltip title="Детали">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedSale(record)
                setDetailsModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title={record.closedAt ? "Возобновить" : "Закрыть сделку"}>
            <Button
              type="link"
              icon={record.closedAt ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              onClick={() => handleCloseSale(record)}
              style={{ color: record.closedAt ? "#52c41a" : "#ff4d4f" }}
            />
          </Tooltip>
          <Tooltip title="Редактировать">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingSale(record)
                form.setFieldsValue(record)
                setProducts(record.products || [{ name: "", quantity: 1, price: 0 }])
                setModalVisible(true)
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Удалить продажу"
            description="Это действие нельзя отменить"
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
            Управление продажами
            {clientIdParam && clients.find((c) => c.id === Number(clientIdParam)) && (
              <Text type="secondary" style={{ fontSize: 14, marginLeft: 12 }}>
                для клиента: {clients.find((c) => c.id === Number(clientIdParam))?.name}
              </Text>
            )}
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingSale(null)
              form.resetFields()
              setProducts([{ name: "", quantity: 1, price: 0 }])
              if (clientIdParam) {
                form.setFieldsValue({ clientId: Number(clientIdParam) })
              }
              setModalVisible(true)
            }}
          >
            Добавить продажу
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredSales}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Всего ${total} продаж`,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* Модальное окно создания/редактирования продажи */}
      <Modal
        title={editingSale ? "Редактировать продажу" : "Новая продажа"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingSale(null)
          setProducts([{ name: "", quantity: 1, price: 0 }])
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Название сделки"
            rules={[{ required: true, message: "Введите название" }]}
          >
            <Input placeholder="Продажа оборудования" />
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <TextArea rows={3} placeholder="Описание сделки..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="clientId" label="Клиент">
                <Select
                  placeholder="Выберите клиента"
                  showSearch
                  optionFilterProp="children"
                  allowClear
                >
                  {clients.map((client) => (
                    <Option key={client.id} value={client.id}>
                      {client.name} - {client.company || client.email}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="managerId" label="Менеджер" initialValue={user?.id}>
                <Select placeholder="Выберите менеджера">
                  <Option value={user?.id}>{user?.name || "Я"}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Товары и услуги</Divider>

          {products.map((product, index) => (
            <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
              <Col span={10}>
                <Input
                  placeholder="Название"
                  value={product.name}
                  onChange={(e) => handleProductChange(index, "name", e.target.value)}
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  placeholder="Кол-во"
                  min={1}
                  value={product.quantity}
                  onChange={(value) => handleProductChange(index, "quantity", value || 1)}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col span={6}>
                <InputNumber
                  placeholder="Цена"
                  min={0}
                  value={product.price}
                  onChange={(value) => handleProductChange(index, "price", value || 0)}
                  style={{ width: "100%" }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                />
              </Col>
              <Col span={4}>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveProduct(index)}
                  disabled={products.length === 1}
                />
              </Col>
            </Row>
          ))}

          <Button type="dashed" onClick={handleAddProduct} block style={{ marginBottom: 16 }}>
            + Добавить товар
          </Button>

          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <Text strong>Итого: {formatPrice(calculateTotal())}</Text>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingSale ? "Сохранить" : "Создать"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Отмена</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно деталей продажи */}
      <Modal
        title="Детали продажи"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button
            key="comment"
            icon={<MessageOutlined />}
            onClick={() => setCommentModalVisible(true)}
          >
            Добавить комментарий
          </Button>,
          <Button key="close" type="primary" onClick={() => setDetailsModalVisible(false)}>
            Закрыть
          </Button>,
        ]}
        width={700}
      >
        {selectedSale && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Название" span={2}>
                <Text strong>{selectedSale.title}</Text>
                {selectedSale.closedAt && (
                  <Tag color="default" style={{ marginLeft: 8 }}>
                    Закрыта
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Клиент">
                {selectedSale.client?.name || `ID: ${selectedSale.clientId}`}
              </Descriptions.Item>
              <Descriptions.Item label="Менеджер">
                {selectedSale.manager?.email || `ID: ${selectedSale.managerId}`}
              </Descriptions.Item>
              <Descriptions.Item label="Сумма" span={2}>
                <Text strong style={{ color: "#52c41a", fontSize: 18 }}>
                  {formatPrice(selectedSale.amount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Дата создания">
                {new Date(selectedSale.createdAt).toLocaleString("ru-RU")}
              </Descriptions.Item>
              <Descriptions.Item label="Последнее обновление">
                {new Date(selectedSale.updatedAt).toLocaleString("ru-RU")}
              </Descriptions.Item>
              {selectedSale.closedAt && (
                <Descriptions.Item label="Дата закрытия" span={2}>
                  {new Date(selectedSale.closedAt).toLocaleString("ru-RU")}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedSale.description && (
              <>
                <Divider>Описание</Divider>
                <Paragraph>{selectedSale.description}</Paragraph>
              </>
            )}

            {selectedSale.products && selectedSale.products.length > 0 && (
              <>
                <Divider>Товары и услуги</Divider>
                <Table
                  dataSource={selectedSale.products}
                  rowKey={(_, i) => String(i)}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: "Наименование", dataIndex: "name" },
                    { title: "Кол-во", dataIndex: "quantity", align: "center" },
                    {
                      title: "Цена",
                      dataIndex: "price",
                      align: "right",
                      render: (price) => formatPrice(price),
                    },
                    {
                      title: "Сумма",
                      align: "right",
                      render: (_, record) => formatPrice(record.price * record.quantity),
                    },
                  ]}
                />
              </>
            )}

            {selectedSale.comments && selectedSale.comments.length > 0 && (
              <>
                <Divider>Комментарии</Divider>
                <List
                  dataSource={selectedSale.comments}
                  renderItem={(comment, index) => (
                    <CommentItem
                      key={index}
                      author="Система"
                      content={comment}
                      datetime={new Date().toLocaleString("ru-RU")}
                    />
                  )}
                />
              </>
            )}
          </>
        )}
      </Modal>

      {/* Модальное окно добавления комментария */}
      <Modal
        title="Добавить комментарий"
        open={commentModalVisible}
        onOk={handleAddComment}
        onCancel={() => {
          setCommentModalVisible(false)
          setCommentText("")
        }}
        okText="Добавить"
        cancelText="Отмена"
      >
        <TextArea
          rows={4}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Введите комментарий к сделке..."
        />
      </Modal>
    </div>
  )
}
