import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AlertTriangle, Flag, Flame } from 'lucide-react'

type Priority = 'low' | 'medium' | 'high'

interface TaskPrioritySelectorProps {
  value: Priority
  onChange: (priority: Priority) => void
  className?: string
}

const priorityConfig = {
  low: {
    icon: Flag,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    label: 'Low Priority',
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    label: 'Medium Priority',
  },
  high: {
    icon: Flame,
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    label: 'High Priority',
  },
}

export const TaskPrioritySelector: React.FC<TaskPrioritySelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div className={cn('flex gap-2', className)}>
      {(Object.entries(priorityConfig) as [Priority, typeof priorityConfig.low][]).map(
        ([priority, config]) => {
          const Icon = config.icon
          const isSelected = value === priority

          return (
            <Button
              key={priority}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex items-center gap-2 transition-colors',
                isSelected && config.bgColor
              )}
              onClick={() => onChange(priority)}
            >
              <Icon className={cn('h-4 w-4', config.color)} />
              <span className={cn(isSelected && config.color)}>
                {config.label}
              </span>
            </Button>
          )
        }
      )}
    </div>
  )
} 