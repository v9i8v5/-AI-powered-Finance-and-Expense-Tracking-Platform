import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useAppSelector, useAppDispatch } from '../hooks/useRedux'
import { useApi } from '../hooks/useApi'
import { setSummary, setTrends } from '../store/slices/analyticsSlice'
import { setExpenses } from '../store/slices/expenseSlice'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#6B7280']

export default function Dashboard() {
  const api = useApi()
  const dispatch = useAppDispatch()
  const isDark = useAppSelector(s => s.theme.isDark)
  const user = useAppSelector(s => s.auth.user)
  const { summary, trends } = useAppSelector(s => s.analytics)
  const expenses = useAppSelector(s => s.expense.expenses)

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, trendsRes, expensesRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/trends?months=6'),
          api.get('/expenses'),
        ])
        dispatch(setSummary(summaryRes.data.data))
        dispatch(setTrends(trendsRes.data.data))
        dispatch(setExpenses(expensesRes.data.data))
      } catch (_) {}
    }
    load()
  }, [])

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const border = isDark ? 'border-gray-700' : 'border-gray-200'
  const muted = isDark ? 'text-gray-400' : 'text-gray-500'

  // Recent 5 transactions
  const recent = [...expenses].slice(0, 5)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name} 👋</h1>
          <p className={`text-sm mt-1 ${muted}`}>Here's your financial overview</p>
        </div>

        {/* Stat cards */}
        {summary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Net Balance"
              value={`$${summary.net_balance.toLocaleString()}`}
              icon="💳"
              color="blue"
            />
            <StatCard
              title="Monthly Income"
              value={`$${summary.month.income.toLocaleString()}`}
              icon="💰"
              color="green"
            />
            <StatCard
              title="Monthly Expenses"
              value={`$${summary.month.expenses.toLocaleString()}`}
              icon="💸"
              color="red"
              trend={summary.month.mom_change}
            />
            <StatCard
              title="Savings Rate"
              value={`${summary.month.savings_rate}%`}
              subtitle={`$${summary.month.savings.toLocaleString()} saved`}
              icon="🎯"
              color="purple"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`rounded-xl p-5 h-28 ${cardBg} animate-pulse`} />
            ))}
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trends chart */}
          <div className={`lg:col-span-2 rounded-xl p-5 border ${cardBg} ${border}`}>
            <h2 className="text-base font-semibold mb-4">Income vs Expenses (6 months)</h2>
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke={isDark ? '#9CA3AF' : '#6B7280'} />
                  <YAxis tick={{ fontSize: 11 }} stroke={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip
                    contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#fff', border: 'none', borderRadius: 8 }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="income" stroke="#10B981" fill="url(#incomeGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#EF4444" fill="url(#expGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <LoadingSpinner className="h-48" />}
          </div>

          {/* Pie chart */}
          <div className={`rounded-xl p-5 border ${cardBg} ${border}`}>
            <h2 className="text-base font-semibold mb-4">Spending by Category</h2>
            {summary && summary.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={summary.categories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%" cy="50%"
                    outerRadius={80}
                    label={({ percentage }) => `${percentage}%`}
                    labelLine={false}
                  >
                    {summary.categories.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => `$${v}`}
                    contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#fff', border: 'none', borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={`flex items-center justify-center h-48 text-sm ${muted}`}>
                No expense data yet
              </div>
            )}
          </div>
        </div>

        {/* Recent transactions */}
        <div className={`rounded-xl border ${cardBg} ${border}`}>
          <div className="flex items-center justify-between px-5 py-4 border-b ${border}">
            <h2 className="text-base font-semibold">Recent Transactions</h2>
            <Link to="/expenses" className="text-sm text-blue-500 hover:underline">View all</Link>
          </div>
          {recent.length > 0 ? (
            <ul className="divide-y divide-inherit">
              {recent.map(e => (
                <li key={e.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{e.description}</p>
                    <p className={`text-xs ${muted}`}>{e.category} · {new Date(e.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-500">-${e.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`px-5 py-8 text-sm text-center ${muted}`}>No transactions yet. <Link to="/expenses" className="text-blue-500 hover:underline">Add one →</Link></p>
          )}
        </div>
      </div>
    </Layout>
  )
}
