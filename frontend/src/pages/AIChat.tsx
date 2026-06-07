import { useEffect, useRef, useState } from 'react'
import { useAppSelector } from '../hooks/useRedux'
import { useApi } from '../hooks/useApi'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTIONS = [
  'How much did I spend this month?',
  'What is my highest expense category?',
  'Summarize my spending trends',
  'How can I improve my savings rate?',
  'What is my net balance?',
]

export default function AIChat() {
  const api = useApi()
  const isDark = useAppSelector(s => s.theme.isDark)

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm FinBot, your AI financial advisor. I have access to your financial data and can help you understand your spending patterns, savings goals, and budget health. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadSummary = async () => {
    setSummaryLoading(true)
    try {
      const r = await api.get('/ai/summary')
      setAiSummary(r.data.data.summary)
    } catch (_) {
      setAiSummary('Unable to generate summary at this time.')
    } finally {
      setSummaryLoading(false)
    }
  }

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages
        .filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0)
        .map(m => ({ role: m.role, content: m.content }))

      const r = await api.post('/ai/chat', { content, history })
      const assistantMsg: Message = {
        role: 'assistant',
        content: r.data.data.response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (_) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const border = isDark ? 'border-gray-700' : 'border-gray-200'
  const muted = isDark ? 'text-gray-400' : 'text-gray-500'
  const inputBg = isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold">AI Financial Advisor</h1>
          <p className={`text-sm ${muted}`}>Powered by FinBot — ask anything about your finances</p>
        </div>

        {/* AI Summary card */}
        <div className={`rounded-xl border p-5 ${cardBg} ${border}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">🤖 AI Financial Summary</h2>
            <button
              onClick={loadSummary}
              disabled={summaryLoading}
              className="px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
            >
              {summaryLoading ? 'Generating...' : aiSummary ? 'Refresh' : 'Generate Summary'}
            </button>
          </div>
          {summaryLoading ? (
            <LoadingSpinner size="sm" className="py-4" />
          ) : aiSummary ? (
            <p className={`text-sm leading-relaxed ${muted}`}>{aiSummary}</p>
          ) : (
            <p className={`text-sm ${muted}`}>Click "Generate Summary" to get an AI-powered analysis of your finances.</p>
          )}
        </div>

        {/* Chat container */}
        <div className={`rounded-xl border flex flex-col ${cardBg} ${border}`} style={{ height: 520 }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    msg.role === 'assistant' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {msg.role === 'assistant' ? '🤖' : '👤'}
                  </div>
                  {/* Bubble */}
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : isDark ? 'bg-gray-700 text-gray-100 rounded-bl-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}>
                    {msg.content}
                    <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-200' : muted}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-sm text-sm ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className="text-purple-500">🤖</span>
                  <span className={muted}>Thinking</span>
                  <span className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className={`px-4 py-2 border-t ${border}`}>
              <p className={`text-xs mb-2 ${muted}`}>Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      isDark ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className={`p-4 border-t ${border} flex gap-3 items-end`}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your finances... (Enter to send)"
              rows={2}
              className={`flex-1 px-4 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${inputBg}`}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-medium text-sm flex-shrink-0"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
