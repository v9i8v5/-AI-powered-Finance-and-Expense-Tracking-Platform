import { Provider } from 'react-redux'
import { store } from './store'
import { useEffect } from 'react'
import { useAppSelector } from './hooks/useRedux'
import Router from './routes/Router'

function AppContent() {
  const isDark = useAppSelector(state => state.theme.isDark)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return <Router />
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
