import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import expenseReducer from './slices/expenseSlice'
import incomeReducer from './slices/incomeSlice'
import budgetReducer from './slices/budgetSlice'
import analyticsReducer from './slices/analyticsSlice'
import themeReducer from './slices/themeSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    expense: expenseReducer,
    income: incomeReducer,
    budget: budgetReducer,
    analytics: analyticsReducer,
    theme: themeReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
