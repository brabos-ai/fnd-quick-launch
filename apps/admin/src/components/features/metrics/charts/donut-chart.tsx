import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

interface DonutChartProps {
  data: Array<{ name: string; value: number }>
  colors?: string[]
  innerRadius?: string
  outerRadius?: string
  showLabel?: boolean
}

const DEFAULT_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(142.1 76.2% 36.3%)', // success
  'hsl(48 96% 53%)', // warning
  'hsl(221.2 83.2% 53.3%)', // info
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const total = payload[0].payload.payload.total || 0
    const value = payload[0].value as number
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-1">
          <span className="text-sm font-medium">{payload[0].name}</span>
          <span className="text-sm font-bold">{value}</span>
          <span className="text-xs text-muted-foreground">{percentage}%</span>
        </div>
      </div>
    )
  }
  return null
}

export function DonutChart({
  data,
  colors = DEFAULT_COLORS,
  innerRadius = '60%',
  outerRadius = '80%',
  showLabel = true,
}: DonutChartProps) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0)
  const dataWithTotal = data.map((entry) => ({ ...entry, total }))

  return (
    <div style={{ width: '100%', height: '280px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            label={
              showLabel
                ? (entry) => {
                    const percentage = ((entry.value / total) * 100).toFixed(0)
                    return `${percentage}%`
                  }
                : false
            }
            labelLine={false}
          >
            {dataWithTotal.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const percentage = ((entry.payload.value / total) * 100).toFixed(1)
              return `${value} (${percentage}%)`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
