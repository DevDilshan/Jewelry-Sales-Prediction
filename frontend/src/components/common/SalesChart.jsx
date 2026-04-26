import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './SalesChart.css'

export default function SalesChart() {
  const data = [
    { day: 'MON', sales: 60 },
    { day: 'TUE', sales: 85 },
    { day: 'WED', sales: 65 },
    { day: 'THU', sales: 90 },
    { day: 'FRI', sales: 70 },
    { day: 'SAT', sales: 85 },
    { day: 'SUN', sales: 65 },
  ]

  return (
    <div className="sales-chart">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af37" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#d4af37" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fontWeight: 600, fill: '#999' }}
            interval={1}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: '#1a1a1a',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '12px',
              padding: '8px 12px',
            }}
            itemStyle={{ color: '#d4af37' }}
            labelStyle={{ color: '#ccc', fontSize: '11px' }}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#b8960f"
            strokeWidth={2.5}
            fill="url(#salesGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#d4af37', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
