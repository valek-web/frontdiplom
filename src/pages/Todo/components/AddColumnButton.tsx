import React from "react"
import { Card, Button } from "antd"
import { PlusOutlined } from "@ant-design/icons"

interface AddColumnButtonProps {
  onClick: () => void
}

export const AddColumnButton: React.FC<AddColumnButtonProps> = ({ onClick }) => {
  return (
    <div
      style={{
        minWidth: 320,
        width: 320,
        height: "100%",
      }}
    >
      <Card
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        bodyStyle={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
        onClick={onClick}
      >
        <Button type="dashed" icon={<PlusOutlined />} size="large">
          Добавить колонку
        </Button>
      </Card>
    </div>
  )
}
