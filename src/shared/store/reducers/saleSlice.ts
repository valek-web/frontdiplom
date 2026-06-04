import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api/axiosInstance"

export interface IProduct {
  name: string
  quantity: number
  price: number
}

export interface ISale {
  id: number
  title: string
  description: string
  amount: number
  clientId: number
  managerId: number
  products: IProduct[]
  comments: string[]
  closedAt: string | null
  createdAt: string
  updatedAt: string
  client?: {
    id: number
    name: string
    email: string
  }
  manager?: {
    id: number
    email: string
  }
}

export interface CreateSaleDto {
  title: string
  description?: string
  amount: number
  clientId?: number
  managerId?: number
  products?: IProduct[]
  comments?: string[]
}

export interface UpdateSaleDto extends Partial<CreateSaleDto> {
  closedAt?: string | null
}

interface SaleState {
  sales: ISale[]
  selectedSale: ISale | null
  loading: boolean
  error: string | null
  total: number
}

const initialState: SaleState = {
  sales: [],
  selectedSale: null,
  loading: false,
  error: null,
  total: 0,
}

// Асинхронные действия
export const fetchSales = createAsyncThunk("sale/fetchSales", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/sale")
    return data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Ошибка загрузки продаж")
  }
})

export const fetchSalesByClient = createAsyncThunk(
  "sale/fetchSalesByClient",
  async (clientId: number, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/sale/client/${clientId}`)
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Ошибка загрузки продаж клиента")
    }
  },
)

export const fetchSaleById = createAsyncThunk(
  "sale/fetchSaleById",
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/sale/${id}`)
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Продажа не найдена")
    }
  },
)

export const createSale = createAsyncThunk(
  "sale/createSale",
  async (saleData: CreateSaleDto, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/sale", saleData)
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Ошибка создания продажи")
    }
  },
)

export const updateSale = createAsyncThunk(
  "sale/updateSale",
  async ({ id, data }: { id: number; data: UpdateSaleDto }, { rejectWithValue }) => {
    try {
      const { data: response } = await api.patch(`/sale/${id}`, data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Ошибка обновления продажи")
    }
  },
)

export const deleteSale = createAsyncThunk(
  "sale/deleteSale",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/sale/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Ошибка удаления продажи")
    }
  },
)

export const addSaleComment = createAsyncThunk(
  "sale/addSaleComment",
  async ({ id, comment }: { id: number; comment: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/sale/${id}/comments`, { comment })
      return { id, comments: data.comments }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Ошибка добавления комментария")
    }
  },
)

const saleSlice = createSlice({
  name: "sale",
  initialState,
  reducers: {
    clearSelectedSale: (state) => {
      state.selectedSale = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false
        state.sales = action.payload
        state.total = action.payload.length
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // fetchSalesByClient
      .addCase(fetchSalesByClient.fulfilled, (state, action) => {
        state.sales = action.payload
        state.total = action.payload.length
      })
      // fetchSaleById
      .addCase(fetchSaleById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedSale = action.payload
      })
      .addCase(fetchSaleById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // createSale
      .addCase(createSale.fulfilled, (state, action) => {
        state.sales.unshift(action.payload)
        state.total += 1
      })
      // updateSale
      .addCase(updateSale.fulfilled, (state, action) => {
        const index = state.sales.findIndex((s) => s.id === action.payload.id)
        if (index !== -1) {
          state.sales[index] = action.payload
        }
        if (state.selectedSale?.id === action.payload.id) {
          state.selectedSale = action.payload
        }
      })
      // deleteSale
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.sales = state.sales.filter((s) => s.id !== action.payload)
        state.total -= 1
      })
      // addSaleComment
      .addCase(addSaleComment.fulfilled, (state, action) => {
        const sale = state.sales.find((s) => s.id === action.payload.id)
        if (sale) {
          sale.comments = action.payload.comments
        }
        if (state.selectedSale?.id === action.payload.id) {
          state.selectedSale.comments = action.payload.comments
        }
      })
  },
})

export const { clearSelectedSale, clearError: clearSaleError } = saleSlice.actions
export default saleSlice.reducer
