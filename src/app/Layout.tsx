import React, { useState } from "react"
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, theme, Space, Typography } from "antd"
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProfileOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  MessageOutlined,
  RiseOutlined,
  TeamOutlined,
} from "@ant-design/icons"
import { Outlet, useLocation, useNavigate } from "react-router"
import { useAppDispatch, useAppSelector } from "../shared/hooks/redux"
import { logout } from "../shared/store/reducers/authSlice"

const { Header, Sider, Content } = AntLayout
const { Text } = Typography

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const menuItems = [
    {
      key: "/feed",
      icon: <FileTextOutlined />,
      label: "Лента",
    },
    {
      key: "/todo",
      icon: <UnorderedListOutlined />,
      label: "Задачи",
    },
    {
      key: "/chat",
      icon: <MessageOutlined />,
      label: "Чат",
    },
    {
      key: "/sale",
      icon: <RiseOutlined />,
      label: "Продажи",
    },
    {
      key: "/client",
      icon: <TeamOutlined />,
      label: "Клиенты",
    },
  ]

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key)
  }

  const handleLogout = async () => {
    await dispatch(logout())
    navigate("/login")
  }

  const userMenuItems = [
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: "Профиль",
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Выйти",
      onClick: handleLogout,
      danger: true,
    },
  ]

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: colorBgContainer,
          borderRight: "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          {!collapsed ? (
            <Text strong style={{ fontSize: 24, color: "var(--ant-color-primary)" }}>
              Фокус
            </Text>
          ) : (
            <Text strong style={{ fontSize: 24, color: "var(--ant-color-primary)" }}>
              Ф
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: "none" }}
        />
      </Sider>

      <AntLayout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} />
              <Text>{user?.name || "Пользователь"}</Text>
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
