import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CheckSquare, Square, Loader2 } from 'lucide-react'

type Status = 'todo' | 'in_progress' | 'completed'

interface TaskStatusSelectorProps {
  value: Status
  onChange: (status: Status) => void
  className?: string
}

const statusConfig = {
  todo: {
    icon: Square,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    label: 'To Do',
  },
  in_progress: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    label: 'In Progress',
  },
  completed: {
    icon: CheckSquare,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    label: 'Completed',
  },
}

export const TaskStatusSelector: React.FC<TaskStatusSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div className={cn('flex gap-2', className)}>
      {(Object.entries(statusConfig) as [Status, typeof statusConfig.todo][]).map(
        ([status, config]) => {
          const Icon = config.icon
          const isSelected = value === status

          return (
            <Button
              key={status}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex items-center gap-2 transition-colors',
                isSelected && config.bgColor
              )}
              onClick={() => onChange(status)}
            >
              <Icon className={cn('h-4 w-4', config.color, status === 'in_progress' && 'animate-spin')} />
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