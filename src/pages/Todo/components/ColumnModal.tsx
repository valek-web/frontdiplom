import React, { useEffect } from "react"
import { Modal, Form, Input, Button, message } from "antd"
import { useAppDispatch } from "../../../shared/hooks/redux"
import { createColumnThunk, updateColumnThunk } from "../../../shared/store/reducers/kanbanSlice"

interface ColumnModalProps {
  open: boolean
  editingColumn: any | null
  boardId?: number
  onClose: () => void
}

export const ColumnModal: React.FC<ColumnModalProps> = ({
  open,
  editingColumn,
  boardId,
  onClose,
}) => {
  const dispatch = useAppDispatch()
  const [form] = Form.useForm()

  useEffect(() => {
    if (editingColumn) {
      form.setFieldsValue({ title: editingColumn.title })
    } else {
      form.resetFields()
    }
  }, [editingColumn, form])

  const handleSubmit = async (values: { title: string }) => {
    if (editingColumn) {
      const result = await dispatch(updateColumnThunk(editingColumn.id, values.title))
      if (result.success) {
        message.success("Колонка обновлена")
        onClose()
      } else {
        message.error(result.error)
      }
    } else if (boardId) {
      const result = await dispatch(createColumnThunk(boardId, values.title))
      if (result.success) {
        message.success("Колонка создана")
        onClose()
      } else {
        message.error(result.error)
      }
    }
  }

  return (
    <Modal
      title={editingColumn ? "Редактировать колонку" : "Создать колонку"}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: "Введите название" }]}
        >
          <Input placeholder="Название колонки" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {editingColumn ? "Сохранить" : "Создать"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
