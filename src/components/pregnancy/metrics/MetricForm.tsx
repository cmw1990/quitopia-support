
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { MetricCategory } from "./types"

interface MetricFormProps {
  selectedCategory: MetricCategory
  isSubmitting: boolean
  onSubmit: (values: { value: number; notes: string }) => void
}

export function MetricForm({ selectedCategory, isSubmitting, onSubmit }: MetricFormProps) {
  const [values, setValues] = useState({ value: '', notes: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.value) return
    
    onSubmit({
      value: parseFloat(values.value),
      notes: values.notes
    })
    setValues({ value: '', notes: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
      <div className="flex-1">
        <Label htmlFor="value" className="sr-only">Value</Label>
        <Input
          id="value"
          type="number"
          placeholder={`Enter ${selectedCategory} value`}
          value={values.value}
          onChange={(e) => setValues(prev => ({ ...prev, value: e.target.value }))}
          className="transition-all duration-200"
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="notes" className="sr-only">Notes</Label>
        <Input
          id="notes"
          placeholder="Add notes (optional)"
          value={values.notes}
          onChange={(e) => setValues(prev => ({ ...prev, notes: e.target.value }))}
          className="transition-all duration-200"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="min-w-[80px] transition-all duration-200"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Add'
        )}
      </Button>
    </form>
  )
}
