import { useAppSelector, useAppDispatch } from '../hooks/useRedux'
import { logout } from '../store/slices/authSlice'
import { toggleTheme } from '../store/slices/themeSlice'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const user = useAppSelector(state => state.auth.user)
  const isDark = useAppSelector(state => state.theme.isDark)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleThemeToggle = () => {
    dispatch(toggleTheme())
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Finance Tracker</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleThemeToggle}
              className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Your financial dashboard</p>
        </div>

        {/* Placeholder Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Balance', value: '$0.00', color: 'bg-blue-500' },
            { title: 'This Month Income', value: '$0.00', color: 'bg-green-500' },
            { title: 'This Month Expenses', value: '$0.00', color: 'bg-red-500' },
            { title: 'Savings Rate', value: '0%', color: 'bg-purple-500' },
          ].map((card, i) => (
            <div key={i} className={`${card.color} text-white rounded-lg p-6 shadow-lg`}>
              <p className="text-sm font-medium opacity-90">{card.title}</p>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className={`mt-12 p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className="text-xl font-bold mb-4">Features Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border-l-4 border-blue-500">
              <h4 className="font-semibold mb-2">📊 Expenses & Income</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Track and manage all your transactions</p>
            </div>
            <div className="p-4 border-l-4 border-green-500">
              <h4 className="font-semibold mb-2">💰 Budget Planning</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Set and monitor your monthly budgets</p>
            </div>
            <div className="p-4 border-l-4 border-purple-500">
              <h4 className="font-semibold mb-2">🤖 AI Insights</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Get AI-powered financial recommendations</p>
            </div>
            <div className="p-4 border-l-4 border-indigo-500">
              <h4 className="font-semibold mb-2">💬 AI Chat</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chat with your financial advisor AI</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
