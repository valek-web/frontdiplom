import { useEffect } from "react"
import { useAppSelector } from "./redux"
import { useLocation, useNavigate } from "react-router"

export const useAuthRedirect = () => {
  const navigate = useNavigate()
  const isAuth = useAppSelector((state) => state.auth.isAuth)
  const location = useLocation()

  useEffect(() => {
    if (isAuth === null) return

    const currentPath = location.pathname

    // Если авторизован и на странице логина/регистрации - редирект на профиль
    if (isAuth && (currentPath === "/login" || currentPath === "/register")) {
      navigate("/profile", { replace: true })
    }

    // Если не авторизован и на защищенной странице - редирект на логин
    if (!isAuth && currentPath !== "/login" && currentPath !== "/register") {
      navigate("/login", { replace: true })
    }
  }, [isAuth, navigate, location])
}
