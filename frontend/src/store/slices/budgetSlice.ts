import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Budget {
  id: string
  user_id: string
  category: string
  limit: number
  spent: number
  remaining: number
  percentage: number
  status: 'ok' | 'warning' | 'over'
  created_at: string
}

interface BudgetState {
  budgets: Budget[]
  loading: boolean
  error: string | null
}

const initialState: BudgetState = {
  budgets: [],
  loading: false,
  error: null,
}

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload
    },
    addBudget: (state, action: PayloadAction<Budget>) => {
      state.budgets.push(action.payload)
    },
    updateBudget: (state, action: PayloadAction<Budget>) => {
      const idx = state.budgets.findIndex(b => b.id === action.payload.id)
      if (idx !== -1) state.budgets[idx] = action.payload
    },
    removeBudget: (state, action: PayloadAction<string>) => {
      state.budgets = state.budgets.filter(b => b.id !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setBudgets, addBudget, updateBudget, removeBudget, setLoading, setError } =
  budgetSlice.actions
export default budgetSlice.reducer
