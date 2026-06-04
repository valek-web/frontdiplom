import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { AppDispatch } from "../store"
import api from "../../api/axiosInstance"

export interface AllowedEmail {
  id: number
  email: string
  permissions: string[]
  createdAt: string
}

interface State {
  emails: AllowedEmail[]
  loading: boolean
  error: string | null
}

const initialState: State = {
  emails: [],
  loading: false,
  error: null,
}

const slice = createSlice({
  name: "allowedEmails",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setEmails: (state, action: PayloadAction<AllowedEmail[]>) => {
      state.emails = action.payload
    },
    addEmail: (state, action: PayloadAction<AllowedEmail>) => {
      state.emails.push(action.payload)
    },
    removeEmail: (state, action: PayloadAction<number>) => {
      state.emails = state.emails.filter((e) => e.id !== action.payload)
    },
  },
})

export const { setLoading, setError, setEmails, addEmail, removeEmail } = slice.actions
export default slice.reducer

// THUNKS

export const fetchAllowedEmails = () => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true))
  try {
    const { data } = await api.get("/admin/emails")
    dispatch(setEmails(data))
  } catch (e: any) {
    dispatch(setError(e.response?.data?.message))
  } finally {
    dispatch(setLoading(false))
  }
}

export const createAllowedEmail =
  (payload: { email: string; permissions: string[] }) => async (dispatch: AppDispatch) => {
    try {
      const { data } = await api.post("/admin/emails", payload)
      dispatch(addEmail(data))
    } catch (e: any) {
      throw e
    }
  }

export const deleteAllowedEmail = (id: number) => async (dispatch: AppDispatch) => {
  try {
    await api.delete(`/admin/emails/${id}`)
    dispatch(removeEmail(id))
  } catch (e: any) {
    throw e
  }
}
