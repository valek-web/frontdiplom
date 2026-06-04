import React from "react"
import { Card, Button, Space, Dropdown } from "antd"
import { MoreOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { useAppDispatch } from "../../../shared/hooks/redux"
import { deleteBoardThunk } from "../../../shared/store/reducers/kanbanSlice"

interface BoardSelectorProps {
  boards: any[]
  currentBoard: any | null
  onSelectBoard: (board: any) => void
  onEditBoard: (board: any) => void
}

export const BoardSelector: React.FC<BoardSelectorProps> = ({
  boards,
  currentBoard,
  onSelectBoard,
  onEditBoard,
}) => {
  const dispatch = useAppDispatch()

  const handleDeleteBoard = (boardId: number) => {
    dispatch(deleteBoardThunk(boardId))
  }

  const getBoardMenu = (board: any) => [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Редактировать",
      onClick: () => onEditBoard(board),
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Удалить",
      danger: true,
      onClick: () => handleDeleteBoard(board.id),
    },
  ]

  return (
    <Card style={{ marginBottom: 16 }}>
      <Space wrap>
        {boards.map((board) => (
          <Button
            key={board.id}
            type={currentBoard?.id === board.id ? "primary" : "default"}
            onClick={() => onSelectBoard(board)}
            style={{ width: "fit-content" }}
          >
            {board.title}
            <Dropdown menu={{ items: getBoardMenu(board) }} trigger={["click"]}>
              <MoreOutlined style={{ marginLeft: 8 }} onClick={(e) => e.stopPropagation()} />
            </Dropdown>
          </Button>
        ))}
      </Space>
    </Card>
  )
}
