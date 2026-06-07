import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Income {
  id: string
  user_id: string
  amount: number
  source: string
  description: string
  date: string
  created_at: string
}

interface IncomeState {
  income: Income[]
  loading: boolean
  error: string | null
}

const initialState: IncomeState = {
  income: [],
  loading: false,
  error: null,
}

const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    setIncome: (state, action: PayloadAction<Income[]>) => {
      state.income = action.payload
    },
    addIncome: (state, action: PayloadAction<Income>) => {
      state.income.unshift(action.payload)
    },
    updateIncome: (state, action: PayloadAction<Income>) => {
      const idx = state.income.findIndex(i => i.id === action.payload.id)
      if (idx !== -1) state.income[idx] = action.payload
    },
    removeIncome: (state, action: PayloadAction<string>) => {
      state.income = state.income.filter(i => i.id !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setIncome, addIncome, updateIncome, removeIncome, setLoading, setError } =
  incomeSlice.actions
export default incomeSlice.reducer
