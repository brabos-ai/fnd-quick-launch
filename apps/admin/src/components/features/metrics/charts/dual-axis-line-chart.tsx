import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DualAxisLineChartProps {
  data: any[]
  leftAxis: { dataKey: string; label: string; color: string }
  rightAxis: { dataKey: string; label: string; color: string }
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
              <span className="text-sm font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(entry.value as number)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function DualAxisLineChart({ data, leftAxis, rightAxis, height = '350px' }: DualAxisLineChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(parseISO(value), 'dd/MM', { locale: ptBR })}
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(value) =>
              new Intl.NumberFormat('pt-BR', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value)
            }
            className="text-xs"
            stroke={leftAxis.color}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) =>
              new Intl.NumberFormat('pt-BR', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value)
            }
            className="text-xs"
            stroke={rightAxis.color}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey={leftAxis.dataKey}
            name={leftAxis.label}
            stroke={leftAxis.color}
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={rightAxis.dataKey}
            name={rightAxis.label}
            stroke={rightAxis.color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
