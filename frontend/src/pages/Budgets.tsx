import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks/useRedux'
import { useApi } from '../hooks/useApi'
import { setBudgets, removeBudget, Budget } from '../store/slices/budgetSlice'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Utilities', 'Healthcare', 'Education', 'Other',
]

export default function Budgets() {
  const api = useApi()
  const dispatch = useAppDispatch()
  const isDark = useAppSelector(s => s.theme.isDark)
  const { budgets, loading } = useAppSelector(s => s.budget)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [limit, setLimit] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/budgets').then(r => dispatch(setBudgets(r.data.data))).catch(() => {})
  }, [])

  const openCreate = () => { setEditing(null); setCategory(CATEGORIES[0]); setLimit(''); setError(''); setShowModal(true) }
  const openEdit = (b: Budget) => { setEditing(b); setCategory(b.category); setLimit(String(b.limit)); setError(''); setShowModal(true) }

  const handleSave = async () => {
    if (!limit || parseFloat(limit) <= 0) { setError('Please enter a valid budget limit.'); return }
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/budgets/${editing.id}`, { limit: parseFloat(limit) })
      } else {
        await api.post('/budgets', { category, limit: parseFloat(limit) })
      }
      // Always reload full list so spent/remaining/status are accurate
      const r = await api.get('/budgets')
      dispatch(setBudgets(r.data.data))
      setShowModal(false)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this budget?')) return
    await api.delete(`/budgets/${id}`)
    dispatch(removeBudget(id))
  }

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const border = isDark ? 'border-gray-700' : 'border-gray-200'
  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`
  const muted = isDark ? 'text-gray-400' : 'text-gray-500'

  const statusColor = (status: string) => {
    if (status === 'over') return 'bg-red-500'
    if (status === 'warning') return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const statusBadge = (status: string) => {
    if (status === 'over') return isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
    if (status === 'warning') return isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
    return isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
  }

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Budgets</h1>
            <p className={`text-sm ${muted}`}>Set monthly spending limits per category</p>
          </div>
          <button onClick={openCreate} className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700">
            + Set Budget
          </button>
        </div>

        {loading ? (
          <LoadingSpinner className="py-16" />
        ) : budgets.length === 0 ? (
          <div className={`rounded-xl border p-12 text-center ${cardBg} ${border}`}>
            <p className="text-4xl mb-3">🎯</p>
            <p className="font-medium mb-1">No budgets set</p>
            <p className={`text-sm ${muted}`}>Set monthly limits to track your spending.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map(b => (
              <div key={b.id} className={`rounded-xl border p-5 ${cardBg} ${border}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{b.category}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(b.status)}`}>
                      {b.status === 'over' ? 'Over Budget' : b.status === 'warning' ? 'Near Limit' : 'On Track'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(b)} className="text-blue-500 hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className={`h-2 rounded-full mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-2 rounded-full transition-all ${statusColor(b.status)}`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className={muted}>Spent: <span className="font-semibold text-red-500">${b.spent.toFixed(2)}</span></span>
                  <span className={muted}>Limit: <span className="font-semibold">${b.limit.toFixed(2)}</span></span>
                </div>
                <p className={`text-xs mt-1 ${muted}`}>
                  {b.remaining >= 0
                    ? `$${b.remaining.toFixed(2)} remaining (${b.percentage}% used)`
                    : `$${Math.abs(b.remaining).toFixed(2)} over budget`
                  }
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Budget' : 'Set Budget'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!editing && (
              <div>
                <label className={`block text-xs font-medium mb-1 ${muted}`}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className={`block text-xs font-medium mb-1 ${muted}`}>Monthly Limit ($)</label>
              <input
                type="number" min="0" step="0.01"
                value={limit}
                onChange={e => setLimit(e.target.value)}
                className={inputCls}
                placeholder="e.g. 500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-lg text-sm font-medium bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-60">
                {saving ? 'Saving...' : editing ? 'Update' : 'Set Budget'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  )
}
