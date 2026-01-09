import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ComposedChurnChartProps {
  data: Array<{ date: string; logoChurn: number; revenueChurn: number }>
  height?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {format(parseISO(label), 'dd MMM yyyy', { locale: ptBR })}
          </span>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-medium">{entry.name}:</span>
              <span className="text-sm font-bold">{(entry.value as number).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function ComposedChurnChart({ data, height = '300px' }: ComposedChurnChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(parseISO(value), 'dd/MM', { locale: ptBR })}
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="logoChurn"
            name="Logo Churn"
            fill="hsl(48 96% 53%)"
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="revenueChurn"
            name="Revenue Churn"
            stroke="hsl(0 84.2% 60.2%)"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
