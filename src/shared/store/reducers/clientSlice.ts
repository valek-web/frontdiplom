import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api/axiosInstance"

export interface IClient {
  id: number
  name: string
  email: string
  phone: string
  company: string
  position: string
  address: string
  city: string
  country: string
  status:
    | "NEW"
    | "CONTACTED"
    | "QUALIFIED"
    | "PROPOSAL"
    | "NEGOTIATION"
    | "CLOSED_WON"
    | "CLOSED_LOST"
    | "INACTIVE"
  priority: "HIGH" | "MEDIUM" | "LOW"
  sales?: any[]
  createdAt: string
  updatedAt: string
}

export interface CreateClientDto {
  name: string
  email?: string
  phone?: string
  company?: string
  position?: string
  address?: string
  city?: string
  country?: string
  status?:
    | "NEW"
    | "CONTACTED"
    | "QUALIFIED"
    | "PROPOSAL"
    | "NEGOTIATION"
    | "CLOSED_WON"
    | "CLOSED_LOST"
    | "INACTIVE"
  priority?: "HIGH" | "MEDIUM" | "LOW"
}

export interface UpdateClientDto extends Partial<CreateClientDto> {}

interface ClientState {
  clients: IClient[]
  selectedClient: IClient | null
  loading: boolean
  error: string | null
  total: number
}

const initialState: ClientState = {
  clients: [],
  selectedClient: null,
  loading: false,
  error: null,
  total: 0,
}

// Асинхронные действия
export const fetchClients = createAsyncThunk(
  "client/fetchClients",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/client")
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Ошибка загрузки клиентов")
    }
  },
)

export const fetchClientById = createAsyncThunk(
  "client/fetchClientById",
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/client/${id}`)
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Клиент не найден")
    }
  },
)

export const createClient = createAsyncThunk(
  "client/createClient",
  async (clientData: CreateClientDto, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/client", clientData)
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Ошибка создания клиента")
    }
  },
)

export const updateClient = createAsyncThunk(
  "client/updateClient",
  async ({ id, data }: { id: number; data: UpdateClientDto }, { rejectWithValue }) => {
    try {
      const { data: response } = await api.patch(`/client/${id}`, data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Ошибка обновления клиента")
    }
  },
)

export const deleteClient = createAsyncThunk(
  "client/deleteClient",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/client/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Ошибка удаления клиента")
    }
  },
)

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    clearSelectedClient: (state) => {
      state.selectedClient = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchClients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false
        state.clients = action.payload
        state.total = action.payload.length
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // fetchClientById
      .addCase(fetchClientById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedClient = action.payload
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // createClient
      .addCase(createClient.fulfilled, (state, action) => {
        state.clients.unshift(action.payload)
        state.total += 1
      })
      // updateClient
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) {
          state.clients[index] = action.payload
        }
        if (state.selectedClient?.id === action.payload.id) {
          state.selectedClient = action.payload
        }
      })
      // deleteClient
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter((c) => c.id !== action.payload)
        state.total -= 1
      })
  },
})

export const { clearSelectedClient, clearError } = clientSlice.actions
export default clientSlice.reducer
