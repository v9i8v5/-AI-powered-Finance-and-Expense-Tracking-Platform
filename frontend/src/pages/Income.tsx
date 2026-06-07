import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks/useRedux'
import { useApi } from '../hooks/useApi'
import { setIncome, addIncome, updateIncome, removeIncome, Income } from '../store/slices/incomeSlice'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

const SOURCES = ['Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Gift', 'Other']

interface FormData {
  amount: string
  source: string
  description: string
  date: string
}

const emptyForm = (): FormData => ({
  amount: '',
  source: SOURCES[0],
  description: '',
  date: new Date().toISOString().slice(0, 10),
})

export default function IncomePage() {
  const api = useApi()
  const dispatch = useAppDispatch()
  const isDark = useAppSelector(s => s.theme.isDark)
  const { income, loading } = useAppSelector(s => s.income)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Income | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/income').then(r => dispatch(setIncome(r.data.data))).catch(() => {})
  }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setError(''); setShowModal(true) }
  const openEdit = (i: Income) => {
    setEditing(i)
    setForm({ amount: String(i.amount), source: i.source, description: i.description, date: i.date.slice(0, 10) })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.amount || !form.description) { setError('Amount and description are required.'); return }
    setSaving(true)
    try {
      const payload = {
        amount: parseFloat(form.amount),
        source: form.source,
        description: form.description,
        date: new Date(form.date).toISOString(),
      }
      if (editing) {
        const r = await api.put(`/income/${editing.id}`, payload)
        dispatch(updateIncome(r.data.data))
      } else {
        const r = await api.post('/income', payload)
        dispatch(addIncome(r.data.data))
      }
      setShowModal(false)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this income record?')) return
    await api.delete(`/income/${id}`)
    dispatch(removeIncome(id))
  }

  const filtered = income.filter(i =>
    i.description.toLowerCase().includes(search.toLowerCase()) ||
    i.source.toLowerCase().includes(search.toLowerCase())
  )
  const totalFiltered = filtered.reduce((s, i) => s + i.amount, 0)

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const border = isDark ? 'border-gray-700' : 'border-gray-200'
  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`
  const muted = isDark ? 'text-gray-400' : 'text-gray-500'

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Income</h1>
            <p className={`text-sm ${muted}`}>{filtered.length} records · Total: <span className="font-semibold text-green-500">${totalFiltered.toFixed(2)}</span></p>
          </div>
          <button onClick={openCreate} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
            + Add Income
          </button>
        </div>

        <div className={`flex gap-3 p-4 rounded-xl border ${cardBg} ${border}`}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search income..."
            className={`${inputCls} max-w-xs`}
          />
        </div>

        <div className={`rounded-xl border overflow-hidden ${cardBg} ${border}`}>
          {loading ? (
            <LoadingSpinner className="py-16" />
          ) : filtered.length === 0 ? (
            <p className={`py-16 text-center text-sm ${muted}`}>No income records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b text-left ${isDark ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                  {filtered.map(i => (
                    <tr key={i.id} className={`${isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className={`px-4 py-3 ${muted}`}>{new Date(i.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium">{i.description}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>
                          {i.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-500">
                        +${i.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(i)} className="text-blue-500 hover:underline mr-3 text-xs">Edit</button>
                        <button onClick={() => handleDelete(i.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Income' : 'Add Income'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div>
              <label className={`block text-xs font-medium mb-1 ${muted}`}>Amount ($)</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${muted}`}>Source</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className={inputCls}>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${muted}`}>Description</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${muted}`}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
                {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  )
}
