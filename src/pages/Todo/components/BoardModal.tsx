import React, { useEffect } from "react"
import { Modal, Form, Input, Button, message } from "antd"
import { useAppDispatch } from "../../../shared/hooks/redux"
import { createBoardThunk, updateBoardThunk } from "../../../shared/store/reducers/kanbanSlice"

const { TextArea } = Input

interface BoardModalProps {
  open: boolean
  editingBoard: any | null
  onClose: () => void
}

export const BoardModal: React.FC<BoardModalProps> = ({ open, editingBoard, onClose }) => {
  const dispatch = useAppDispatch()
  const [form] = Form.useForm()

  useEffect(() => {
    if (editingBoard) {
      form.setFieldsValue({
        title: editingBoard.title,
        description: editingBoard.description,
      })
    } else {
      form.resetFields()
    }
  }, [editingBoard, form])

  const handleSubmit = async (values: { title: string; description?: string }) => {
    if (editingBoard) {
      const result = await dispatch(
        updateBoardThunk(editingBoard.id, values.title, values.description),
      )
      if (result.success) {
        message.success("Доска обновлена")
        onClose()
      } else {
        message.error(result.error)
      }
    } else {
      const result = await dispatch(createBoardThunk(values.title, values.description))
      if (result.success) {
        message.success("Доска создана")
        onClose()
      } else {
        message.error(result.error)
      }
    }
    form.resetFields()
  }

  return (
    <Modal
      title={editingBoard ? "Редактировать доску" : "Создать доску"}
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
          <Input placeholder="Название доски" />
        </Form.Item>
        <Form.Item name="description" label="Описание">
          <TextArea rows={3} placeholder="Описание доски" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {editingBoard ? "Сохранить" : "Создать"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
