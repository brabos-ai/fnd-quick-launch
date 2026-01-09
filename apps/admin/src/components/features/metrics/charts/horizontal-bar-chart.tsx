import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

interface HorizontalBarChartProps {
  data: Array<{ name: string; value: number }>
  valueFormatter?: (value: number) => string
  height?: string
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(142.1 76.2% 36.3%)', // success
  'hsl(48 96% 53%)', // warning
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-1">
          <span className="text-sm font-medium">{payload[0].payload.name}</span>
          <span className="text-sm font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(payload[0].value as number)}
          </span>
        </div>
      </div>
    )
  }
  return null
}

export function HorizontalBarChart({
  data,
  valueFormatter,
  height = '280px',
}: HorizontalBarChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <XAxis
            type="number"
            tickFormatter={
              valueFormatter ||
              ((value) =>
                new Intl.NumberFormat('pt-BR', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value))
            }
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            type="category"
            dataKey="name"
            className="text-xs"
            stroke="hsl(var(--muted-foreground))"
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
