interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: string
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow'
  trend?: number  // positive = up, negative = down
}

const COLORS = {
  blue:   'from-blue-500 to-blue-600',
  green:  'from-green-500 to-green-600',
  red:    'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
  yellow: 'from-yellow-500 to-yellow-600',
}

export default function StatCard({ title, value, subtitle, icon, color = 'blue', trend }: StatCardProps) {
  return (
    <div className={`rounded-xl p-5 text-white bg-gradient-to-br ${COLORS[color]} shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium opacity-90">{title}</p>
        {icon && <span className="text-2xl opacity-80">{icon}</span>}
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-sm opacity-75">{subtitle}</p>}
      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1 text-xs font-medium">
          <span>{trend >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}% vs last month</span>
        </div>
      )}
    </div>
  )
}
