import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface BarConfig {
  dataKey: string
  name: string
  color: string
}

interface StackedBarChartProps {
  data: any[]
  bars: BarConfig[]
  xAxisKey: string
  height?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Validate date string before parsing
    let formattedLabel = label
    try {
      const parsedDate = parseISO(label)
      if (isValid(parsedDate)) {
        formattedLabel = format(parsedDate, 'dd MMM yyyy', { locale: ptBR })
      }
    } catch (error) {
      // Keep original label if parsing fails
    }

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {formattedLabel}
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

export function StackedBarChart({ data, bars, xAxisKey, height = '300px' }: StackedBarChartProps) {
  // Safe date formatter with validation
  const formatXAxisTick = (value: string) => {
    try {
      const parsedDate = parseISO(value)
      if (isValid(parsedDate)) {
        return format(parsedDate, 'dd/MM', { locale: ptBR })
      }
    } catch (error) {
      // Return value as-is if not a valid date
    }
    return value
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={formatXAxisTick}
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            tickFormatter={(value) =>
              new Intl.NumberFormat('pt-BR', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value)
            }
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {bars.map((bar) => (
            <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.name} fill={bar.color} stackId="a" />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
