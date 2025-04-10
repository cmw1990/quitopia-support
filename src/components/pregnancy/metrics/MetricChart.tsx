
import { format } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { PregnancyMetric, MetricCategory } from "./types"

interface MetricChartProps {
  data: PregnancyMetric[]
  selectedCategory: MetricCategory
}

export function MetricChart({ data, selectedCategory }: MetricChartProps) {
  const getMetricUnit = (category: MetricCategory) => {
    switch (category) {
      case 'weight':
        return 'kg'
      case 'blood_pressure':
        return 'mmHg'
      case 'exercise':
        return 'minutes'
      default:
        return ''
    }
  }

  return (
    <div className="h-[300px] transition-all duration-300">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), 'MMM d')}
          />
          <YAxis
            label={{ 
              value: getMetricUnit(selectedCategory), 
              angle: -90, 
              position: 'insideLeft' 
            }}
          />
          <Tooltip
            labelFormatter={(date) => format(new Date(date), 'PPP')}
            formatter={(value: number) => [
              `${value}${getMetricUnit(selectedCategory)}`,
              selectedCategory
            ]}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#ec4899"
            strokeWidth={2}
            dot={{ fill: '#ec4899' }}
            activeDot={{ r: 6, fill: '#ec4899' }}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
