import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CategoryData {
  category: string
  amount: number
  percentage: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expenses: number
}

export interface AnalyticsSummary {
  total_income: number
  total_expenses: number
  net_balance: number
  month: {
    income: number
    expenses: number
    savings: number
    savings_rate: number
    mom_change: number
  }
  top_category: string | null
  categories: CategoryData[]
}

interface AnalyticsState {
  summary: AnalyticsSummary | null
  trends: MonthlyTrend[]
  categories: CategoryData[]
  loading: boolean
  error: string | null
}

const initialState: AnalyticsState = {
  summary: null,
  trends: [],
  categories: [],
  loading: false,
  error: null,
}

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setSummary: (state, action: PayloadAction<AnalyticsSummary>) => {
      state.summary = action.payload
    },
    setTrends: (state, action: PayloadAction<MonthlyTrend[]>) => {
      state.trends = action.payload
    },
    setCategories: (state, action: PayloadAction<CategoryData[]>) => {
      state.categories = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setSummary, setTrends, setCategories, setLoading, setError } =
  analyticsSlice.actions
export default analyticsSlice.reducer
