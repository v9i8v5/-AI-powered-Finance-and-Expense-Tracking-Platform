import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ThemeState {
  isDark: boolean
}

const initialState: ThemeState = {
  isDark: localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches),
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark
      localStorage.setItem('theme', state.isDark ? 'dark' : 'light')
    },
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload
      localStorage.setItem('theme', action.payload ? 'dark' : 'light')
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
