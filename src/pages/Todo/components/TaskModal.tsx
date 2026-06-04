import React, { useEffect } from "react"
import { Modal, Form, Input, DatePicker, Select, Button, message, Space } from "antd"
import { useAppDispatch, useAppSelector } from "../../../shared/hooks/redux"
import { createTaskThunk, updateTaskThunk } from "../../../shared/store/reducers/kanbanSlice"
import dayjs from "dayjs"

const { TextArea } = Input
const { Option } = Select

interface TaskModalProps {
  open: boolean
  editingTask: any | null
  columnId?: number | null
  onClose: () => void
}

export const TaskModal: React.FC<TaskModalProps> = ({ open, editingTask, columnId, onClose }) => {
  const dispatch = useAppDispatch()
  const [form] = Form.useForm()
  const { users } = useAppSelector((state) => state.kanban)

  useEffect(() => {
    if (editingTask) {
      form.setFieldsValue({
        title: editingTask.title,
        description: editingTask.description,
        startDate: editingTask.startDate ? dayjs(editingTask.startDate) : null,
        dueDate: editingTask.dueDate ? dayjs(editingTask.dueDate) : null,
        assigneeId: editingTask.assigneeId,
        tags: editingTask.tags || [],
      })
    } else {
      form.resetFields()
    }
  }, [editingTask, form])

  const handleSubmit = async (values: any) => {
    const taskData = {
      title: values.title,
      description: values.description,
      startDate: values.startDate ? values.startDate.toISOString() : undefined,
      dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      assigneeId: values.assigneeId,
      tags: values.tags,
    }

    if (editingTask) {
      const result = await dispatch(updateTaskThunk(editingTask.id, editingTask.columnId, taskData))
      if (result.success) {
        message.success("Задача обновлена")
        onClose()
      } else {
        message.error(result.error)
      }
    } else if (columnId) {
      const result = await dispatch(createTaskThunk(columnId, taskData))
      if (result.success) {
        message.success("Задача создана")
        onClose()
      } else {
        message.error(result.error)
      }
    }
  }

  return (
    <Modal
      title={editingTask ? "Редактировать задачу" : "Создать задачу"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: "Введите название" }]}
        >
          <Input placeholder="Название задачи" />
        </Form.Item>

        <Form.Item name="description" label="Описание">
          <TextArea rows={4} placeholder="Описание задачи" />
        </Form.Item>

        <Space direction="horizontal" style={{ width: "100%" }} size="middle">
          <Form.Item name="startDate" label="Дата начала" style={{ width: "100%" }}>
            <DatePicker style={{ width: "100%" }} format="DD.MM.YYYY" placeholder="Выберите дату" />
          </Form.Item>

          <Form.Item name="dueDate" label="Дата окончания" style={{ width: "100%" }}>
            <DatePicker style={{ width: "100%" }} format="DD.MM.YYYY" placeholder="Выберите дату" />
          </Form.Item>
        </Space>

        <Form.Item name="assigneeId" label="Исполнитель">
          <Select
            placeholder="Выберите исполнителя"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {users.map((user: any) => (
              <Option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="tags" label="Теги">
          <Select
            mode="tags"
            placeholder="Введите теги (нажмите Enter после каждого тега)"
            tokenSeparators={[",", " "]}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {editingTask ? "Сохранить" : "Создать"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
