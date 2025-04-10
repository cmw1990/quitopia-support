
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MetricCategory } from "./types"

const METRIC_CATEGORIES: { value: MetricCategory; label: string }[] = [
  { value: 'weight', label: 'Weight' },
  { value: 'blood_pressure', label: 'Blood Pressure' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'mood', label: 'Mood' },
]

interface CategorySelectProps {
  value: MetricCategory
  onChange: (value: MetricCategory) => void
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select metric" />
      </SelectTrigger>
      <SelectContent>
        {METRIC_CATEGORIES.map(({ value, label }) => (
          <SelectItem key={value} value={value}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
