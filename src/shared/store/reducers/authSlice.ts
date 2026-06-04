import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import api from "../../api/axiosInstance"
import type { AppDispatch } from "../store"

interface User {
  id: number
  email: string
  name: string
  createdAt: string
  permissions: string[] // добавляем поле permissions
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuth: boolean | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuth: null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setAuth: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>,
    ) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuth = true
      localStorage.setItem("accessToken", action.payload.accessToken)
      localStorage.setItem("refreshToken", action.payload.refreshToken)
    },
    logoutLocal: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuth = false
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    },
    restoreAuth: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>,
    ) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuth = true
    },
  },
})

export const { setLoading, setError, setAuth, logoutLocal, restoreAuth } = authSlice.actions
export default authSlice.reducer

// Thunks
export const login = (credentials: { email: string; password: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      const { data } = await api.post("/auth/login", credentials)
      dispatch(
        setAuth({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      )
      return { success: true }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ошибка входа"
      dispatch(setError(errorMsg))
      return { success: false, error: errorMsg }
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export const registerStart = (values: { email: string; password: string; name: string }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      await api.post("/auth/register", values)
      return { success: true, email: values.email, password: values.password }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ошибка регистрации"
      dispatch(setError(errorMsg))
      return { success: false, error: errorMsg }
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export const registerConfirm = (email: string, code: number) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      await api.post("/auth/register-send-code", { email, code })
      return { success: true }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ошибка подтверждения"
      dispatch(setError(errorMsg))
      return { success: false, error: errorMsg }
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export const logout = () => {
  return async (dispatch: AppDispatch) => {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      dispatch(logoutLocal())
    }
  }
}

export const updateProfile = (id: number, name: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      const { data } = await api.put(`/user/${id}`, { name })
      const accessToken = localStorage.getItem("accessToken") || ""
      const refreshToken = localStorage.getItem("refreshToken") || ""
      dispatch(setAuth({ user: data, accessToken, refreshToken }))
      return { success: true, user: data }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ошибка обновления"
      dispatch(setError(errorMsg))
      return { success: false, error: errorMsg }
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export const checkAndRestoreAuth = () => {
  return async (dispatch: AppDispatch) => {
    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
      dispatch(logoutLocal())
      return
    }

    try {
      const { data } = await api.post("/auth/validate")
      const refreshToken = localStorage.getItem("refreshToken") || ""
      dispatch(
        restoreAuth({
          user: data.user,
          accessToken,
          refreshToken,
        }),
      )
    } catch (error) {
      console.error("Auth restore error:", error)
      dispatch(logoutLocal())
    }
  }
}
