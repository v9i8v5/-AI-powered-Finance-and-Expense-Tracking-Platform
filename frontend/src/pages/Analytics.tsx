import { useEffect, useState } from 'react'
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useAppSelector, useAppDispatch } from '../hooks/useRedux'
import { useApi } from '../hooks/useApi'
import { setSummary, setTrends, setCategories } from '../store/slices/analyticsSlice'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#6B7280']

export default function Analytics() {
  const api = useApi()
  const dispatch = useAppDispatch()
  const isDark = useAppSelector(s => s.theme.isDark)
  const { summary, trends, categories } = useAppSelector(s => s.analytics)
  const [period, setPeriod] = useState('month')
  const [months, setMonths] = useState(6)

  const loadAll = async () => {
    try {
      const [summaryRes, trendsRes, catRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get(`/analytics/trends?months=${months}`),
        api.get(`/analytics/categories?period=${period}`),
      ])
      dispatch(setSummary(summaryRes.data.data))
      dispatch(setTrends(trendsRes.data.data))
      dispatch(setCategories(catRes.data.data))
    } catch (_) {}
  }

  useEffect(() => { loadAll() }, [period, months])

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const border = isDark ? 'border-gray-700' : 'border-gray-200'
  const muted = isDark ? 'text-gray-400' : 'text-gray-500'
  const tooltipStyle = { backgroundColor: isDark ? '#1F2937' : '#fff', border: 'none', borderRadius: 8 }
  const axisStroke = isDark ? '#9CA3AF' : '#6B7280'
  const gridStroke = isDark ? '#374151' : '#E5E7EB'

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className={`text-sm ${muted}`}>Deep dive into your financial patterns</p>
        </div>

        {/* Summary cards */}
        {summary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Net Balance" value={`$${summary.net_balance.toLocaleString()}`} icon="💳" color="blue" />
            <StatCard title="Total Income" value={`$${summary.total_income.toLocaleString()}`} icon="💰" color="green" />
            <StatCard title="Total Expenses" value={`$${summary.total_expenses.toLocaleString()}`} icon="💸" color="red" />
            <StatCard
              title="Monthly Savings Rate"
              value={`${summary.month.savings_rate}%`}
              subtitle={`MoM: ${summary.month.mom_change >= 0 ? '+' : ''}${summary.month.mom_change}%`}
              icon="📊"
              color="purple"
            />
          </div>
        ) : <LoadingSpinner className="h-32" />}

        {/* Trend chart */}
        <div className={`rounded-xl border p-5 ${cardBg} ${border}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Income vs Expenses Trend</h2>
            <select
              value={months}
              onChange={e => setMonths(Number(e.target.value))}
              className={`text-sm px-2 py-1.5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke={axisStroke} />
                <YAxis tick={{ fontSize: 11 }} stroke={axisStroke} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}`} />
                <Legend />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : <LoadingSpinner className="h-48" />}
        </div>

        {/* Category breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pie */}
          <div className={`rounded-xl border p-5 ${cardBg} ${border}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Spending by Category</h2>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className={`text-sm px-2 py-1.5 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categories} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={100}
                    label={({ name, percentage }) => `${name.split(' ')[0]} ${percentage}%`} labelLine={false}>
                    {categories.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className={`text-center py-16 text-sm ${muted}`}>No data for this period.</p>}
          </div>

          {/* Category list */}
          <div className={`rounded-xl border p-5 ${cardBg} ${border}`}>
            <h2 className="font-semibold mb-4">Category Breakdown</h2>
            {categories.length > 0 ? (
              <ul className="space-y-3">
                {categories.map((cat, idx) => (
                  <li key={cat.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{cat.category}</span>
                      <span className="font-semibold">${cat.amount.toLocaleString()} <span className={`font-normal ${muted}`}>({cat.percentage}%)</span></span>
                    </div>
                    <div className={`h-1.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${cat.percentage}%`, backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className={`text-center py-8 text-sm ${muted}`}>No data for this period.</p>}
          </div>
        </div>

        {/* Monthly savings line chart */}
        {trends.length > 0 && (
          <div className={`rounded-xl border p-5 ${cardBg} ${border}`}>
            <h2 className="font-semibold mb-4">Monthly Savings</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trends.map(t => ({ ...t, savings: parseFloat((t.income - t.expenses).toFixed(2)) }))}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke={axisStroke} />
                <YAxis tick={{ fontSize: 11 }} stroke={axisStroke} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}`} />
                <Area type="monotone" dataKey="savings" stroke="#8B5CF6" fill="url(#savingsGrad)" strokeWidth={2} name="Savings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Layout>
  )
}
