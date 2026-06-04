import { useEffect } from "react"
import { Todo } from "../pages/Todo/Todo"
import { Feed } from "../pages/Feed/Feed"
import { useAppDispatch, useAppSelector } from "../shared/hooks/redux"
import { useAuthRedirect } from "../shared/hooks/useAuthRedirect"
import { checkAndRestoreAuth } from "../shared/store/reducers/authSlice"
import { Route, Routes } from "react-router"
import { Login } from "../pages/LoginPage/LoginPage"
import { Register } from "../pages/RegisterPage/RegisterPage"
import { Profile } from "../pages/Profile/Profile"
import { Layout } from "./Layout"
import { Chat } from "../pages/Chat/Chat"
import { Sale } from "../pages/Sale/Sale"
import { Client } from "../pages/Client/Client"

function App() {
  const dispatch = useAppDispatch()
  const isAuth = useAppSelector((state) => state.auth.isAuth)

  useAuthRedirect()

  useEffect(() => {
    dispatch(checkAndRestoreAuth())
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {isAuth && (
        <>
          <Route path="/" element={<Layout />}>
            <Route index element={<Profile />} />
            <Route path="profile" element={<Profile />} />
            <Route path="todo" element={<Todo />} />
            <Route path="feed" element={<Feed />} />
            <Route path="chat" element={<Chat />} />
            <Route path="sale" element={<Sale />} />
            <Route path="client" element={<Client />} />
          </Route>
        </>
      )}
    </Routes>
  )
}

export default App
