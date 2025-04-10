import React, { useState, useRef, useEffect } from 'react'
import { CheckCircle, Circle, Trash2, Edit, Plus, Save, X, ArrowUp, ArrowDown, Check, Clock, AlertCircle, ArrowRight, MoreVertical, Calendar, AlarmClock, ChevronDown, ChevronUp, CheckCircle2, ListChecks, Sparkles, BatteryCharging, Brain, Target, Grid3x3, LayoutGrid, Timer, Bolt, Zap, FileWarning, ArrowUpRight, PieChart, AlertTriangle, Battery, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from './AuthProvider'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { productivityToolsApi } from '../api/supabase-rest'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { handleError } from '@/utils/error-handler'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import confetti from 'canvas-confetti'

export interface TodoItem {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  created_at: string
  updated_at: string
  user_id?: string
  dueDate?: Date | string
  notes?: string
  steps?: { id: string; text: string; completed: boolean }[]
  isVisible?: boolean
  isFocused?: boolean
  category?: string
  estimatedTime?: number
  timers?: { started: string; ended: string }[]
  energy?: 'low' | 'medium' | 'high'
  blockers?: string
  urgency?: 'high' | 'medium' | 'low'
  importance?: 'high' | 'medium' | 'low'
  timeEstimate?: number
  context?: string
  tags?: string[]
  parentTaskId?: string
  subtasks?: TodoItem[]
  pomodoros?: number
  lastWorkedOn?: string
  difficulty?: number
}

export interface TodoProps {
  showHeader?: boolean
  quickMode?: boolean
  limit?: number
  className?: string
  allowLogin?: boolean
  title?: string
  description?: string
  defaultItems?: TodoItem[]
  onSave?: (items: TodoItem[]) => void
  readOnly?: boolean
  adhd?: boolean
  showPriorityMatrix?: boolean
  contextView?: boolean
  energyView?: boolean
}

export const Todo: React.FC<TodoProps> = ({
  showHeader = true, 
  quickMode = false,
  limit = 0,
  className = "",
  allowLogin = true,
  title = 'Tasks',
  description,
  defaultItems = [],
  onSave,
  readOnly = false,
  adhd = true,
  showPriorityMatrix = false,
  contextView = false,
  energyView = false
}) => {
  const { user, session } = useAuth()
  const [todos, setTodos] = useState<TodoItem[]>(defaultItems)
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<'high' | 'medium' | 'low' | 'all'>('all')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [showCompleted, setShowCompleted] = useState<boolean>(true)
  const [stepInput, setStepInput] = useState<string>('')
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [editingStepText, setEditingStepText] = useState<string>('')
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false)
  const [focusedTodoId, setFocusedTodoId] = useState<string | null>(null)
  const [editDueDate, setEditDueDate] = useState<string>('')
  const [editEnergy, setEditEnergy] = useState<'low' | 'medium' | 'high'>('medium')
  const [editEstimatedTime, setEditEstimatedTime] = useState<number>(15)
  const [editBlockers, setEditBlockers] = useState<string>('')
  const [editCategory, setEditCategory] = useState<string>('')
  const [editUrgency, setEditUrgency] = useState<'high' | 'medium' | 'low'>('medium')
  const [editImportance, setEditImportance] = useState<'high' | 'medium' | 'low'>('medium')
  const [editTimeEstimate, setEditTimeEstimate] = useState<number>(15)
  const [editContext, setEditContext] = useState<string>('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [editDifficulty, setEditDifficulty] = useState<number>(5)
  const [tagInput, setTagInput] = useState<string>('')
  const [matrixView, setMatrixView] = useState<boolean>(showPriorityMatrix)
  const [activeView, setActiveView] = useState<'list' | 'matrix' | 'energy' | 'context'>(showPriorityMatrix ? 'matrix' : 'list')
  const [confettiEnabled, setConfettiEnabled] = useState<boolean>(true)
  const [editPomodoros, setEditPomodoros] = useState<number>(1)

  const inputRef = useRef<HTMLInputElement>(null)
  const controls = useAnimation()
  
  // Load todos from API or localStorage
  useEffect(() => {
    loadTodos()
  }, [user, session])
  
  const loadTodos = async () => {
    setLoading(true)
    
    try {
      if (user && session) {
        // Get todos from API if user is logged in
        try {
          const response = await productivityToolsApi.getTasks(user.id, session)
          
          if (response && Array.isArray(response)) {
            setTodos(response)
          } else {
            throw new Error('Invalid response format')
          }
        } catch (apiError) {
          console.log('Using fallback data due to API error:', apiError)
          
          // Try to get any locally stored todos as fallback
          const localTodos = localStorage.getItem('todos')
          if (localTodos) {
            setTodos(JSON.parse(localTodos))
          } else if (defaultItems && defaultItems.length > 0) {
            // Use default items if provided
            setTodos(defaultItems)
          } else {
            // Create some example todos as last resort
            const fallbackTodos = [
              {
                id: uuidv4(),
                title: 'Complete task manager setup',
                description: 'Configure your task priorities and categories',
                completed: false,
                priority: 'high',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: user.id
              },
              {
                id: uuidv4(),
                title: 'Try the Focus Timer',
                description: 'Use the timer to stay focused on important tasks',
                completed: false,
                priority: 'medium',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: user.id
              }
            ] as TodoItem[];
            setTodos(fallbackTodos);
          }
        }
      } else {
        // Get todos from localStorage if not logged in
        const localTodos = localStorage.getItem('todos')
        if (localTodos) {
          setTodos(JSON.parse(localTodos))
        } else if (defaultItems && defaultItems.length > 0) {
          // Use default items if provided
          setTodos(defaultItems)
        }
      }
    } catch (error) {
      handleError(
        error,
        'Todo.loadTodos',
        'Failed to load to-do items',
        { 
          silent: !user, // Don't show error to non-logged in users
          extraData: { userId: user?.id }
        }
      )
      
      // Ensure we always have a valid todos array
      if (!todos.length) {
        if (defaultItems && defaultItems.length > 0) {
          setTodos(defaultItems)
        } else {
          setTodos([])
        }
      }
    } finally {
      setLoading(false)
    }
  }
  
  const saveTodosLocally = (updatedTodos: TodoItem[]) => {
    if (!user) {
      localStorage.setItem('todos', JSON.stringify(updatedTodos))
    }
  }
  
  const addTodo = async () => {
    if (!inputValue.trim()) return
    
    const newTodo: TodoItem = {
      id: uuidv4(),
      title: inputValue.trim(),
      description: '',
      completed: false,
      priority: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user?.id
    }
    
    const updatedTodos = [...todos, newTodo]
    setTodos(updatedTodos)
    setInputValue('')
    saveTodosLocally(updatedTodos)
    
    if (user && session) {
      try {
        await productivityToolsApi.createTask(newTodo, session)
        toast.success('Todo added successfully')
      } catch (error) {
        handleError(
          error,
          'Todo.addTodo',
          'Failed to save to-do item',
          { 
            retry: () => addTodo(),
            extraData: { userId: user?.id, todo: newTodo }
          }
        )
        // Revert the local addition
        setTodos(todos)
      }
    }
  }
  
  const toggleTodo = async (id: string) => {
    const todoIndex = todos.findIndex(todo => todo.id === id)
    if (todoIndex === -1) return
    
    const updatedTodo = {
      ...todos[todoIndex],
      completed: !todos[todoIndex].completed,
      updated_at: new Date().toISOString()
    }
    
    const updatedTodos = [
      ...todos.slice(0, todoIndex),
      updatedTodo,
      ...todos.slice(todoIndex + 1)
    ]
    
    setTodos(updatedTodos)
    saveTodosLocally(updatedTodos)
    
    if (user && session) {
      try {
        await productivityToolsApi.updateTask(id, updatedTodo, session)
      } catch (error) {
        handleError(
          error,
          'Todo.toggleTodo',
          'Failed to update to-do item',
          { 
            retry: () => toggleTodo(id),
            extraData: { userId: user?.id, todoId: id }
          }
        )
        // Revert the local change
        setTodos(todos)
      }
    }
    
    // Add confetti on completion if enabled
    if (!todos[todoIndex].completed && confettiEnabled) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }
  
  const deleteTodo = async (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id)
    setTodos(updatedTodos)
    saveTodosLocally(updatedTodos)
    
    if (user && session) {
      try {
        await productivityToolsApi.deleteTask(id, session)
        toast.success('Todo deleted successfully')
      } catch (error) {
        handleError(
          error,
          'Todo.deleteTodo',
          'Failed to delete to-do item',
          { 
            retry: () => deleteTodo(id),
            extraData: { userId: user?.id, todoId: id }
          }
        )
        // Revert the local deletion
        setTodos(todos)
      }
    }
  }
  
  const startEditing = (todo: TodoItem) => {
    setEditingId(todo.id)
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
    setEditPriority(todo.priority)
  }
  
  const cancelEditing = () => {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
    setEditPriority('medium')
  }
  
  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) return
    
    const todoIndex = todos.findIndex(todo => todo.id === editingId)
    if (todoIndex === -1) return
    
    const updatedTodo = {
      ...todos[todoIndex],
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
      urgency: editUrgency,
      importance: editImportance,
      energy: editEnergy,
      timeEstimate: editTimeEstimate,
      context: editContext,
      tags: editTags,
      difficulty: editDifficulty,
      category: editCategory,
      estimatedTime: editEstimatedTime,
      pomodoros: editPomodoros,
      dueDate: editDueDate,
      blockers: editBlockers,
      updated_at: new Date().toISOString()
    }
    
    const updatedTodos = [
      ...todos.slice(0, todoIndex),
      updatedTodo,
      ...todos.slice(todoIndex + 1)
    ]
    
    setTodos(updatedTodos)
    saveTodosLocally(updatedTodos)
    cancelEditing()
    
    if (user && session) {
      try {
        await productivityToolsApi.updateTask(editingId, updatedTodo, session)
        toast.success('Todo updated successfully')
      } catch (error) {
        handleError(
          error,
          'Todo.saveEdit',
          'Failed to update to-do item',
          { 
            retry: () => {
              setEditingId(editingId)
              setEditTitle(updatedTodo.title)
              setEditDescription(updatedTodo.description || '')
              setEditPriority(updatedTodo.priority)
              saveEdit()
            },
            extraData: { userId: user?.id, todoId: editingId }
          }
        )
        // Revert the local edit
        setTodos(todos)
      }
    }
  }
  
  const moveTodoUp = async (index: number) => {
    if (index <= 0) return
    
    const newTodos = [...todos]
    const temp = newTodos[index]
    newTodos[index] = newTodos[index - 1]
    newTodos[index - 1] = temp
    
    setTodos(newTodos)
    saveTodosLocally(newTodos)
  }
  
  const moveTodoDown = async (index: number) => {
    if (index >= todos.length - 1) return
    
    const newTodos = [...todos]
    const temp = newTodos[index]
    newTodos[index] = newTodos[index + 1]
    newTodos[index + 1] = temp
    
    setTodos(newTodos)
    saveTodosLocally(newTodos)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addTodo()
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 hover:bg-red-600'
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600'
      case 'low':
        return 'bg-green-500 hover:bg-green-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }
  
  // Filter and limit todos for display
  let filteredTodos = [...todos]
  
  if (filterCompleted !== null) {
    filteredTodos = filteredTodos.filter(todo => todo.completed === filterCompleted)
  }
  
  if (priorityFilter !== 'all') {
    filteredTodos = filteredTodos.filter(todo => todo.priority === priorityFilter)
  }
  
  // Sort by priority: high, medium, low, then by creation date
  filteredTodos.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    
    if (priorityDiff !== 0) return priorityDiff
    
    // If same priority, sort by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
  
  // Apply limit if specified
  if (limit > 0) {
    filteredTodos = filteredTodos.slice(0, limit)
  }
  
  // Function to toggle step completion
  const toggleStep = async (todoId: string, stepId: string) => {
    const todoIndex = todos.findIndex(todo => todo.id === todoId)
    if (todoIndex === -1) return
    
    const todo = todos[todoIndex]
    if (!todo.steps) return
    
    const stepIndex = todo.steps.findIndex(step => step.id === stepId)
    if (stepIndex === -1) return
    
    const updatedSteps = [...todo.steps]
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      completed: !updatedSteps[stepIndex].completed
    }
    
    const updatedTodo = {
      ...todo,
      steps: updatedSteps,
      updated_at: new Date().toISOString()
    }
    
    // Check if all steps are completed
    const allStepsCompleted = updatedSteps.every(step => step.completed)
    
    // If all steps are completed and the todo isn't marked as completed, mark it as completed
    if (allStepsCompleted && !todo.completed) {
      updatedTodo.completed = true
      triggerConfetti()
    }
    
    const updatedTodos = [
      ...todos.slice(0, todoIndex),
      updatedTodo,
      ...todos.slice(todoIndex + 1)
    ]
    
    setTodos(updatedTodos)
    saveTodosLocally(updatedTodos)
    
    if (user && session) {
      try {
        await productivityToolsApi.updateTask(todoId, updatedTodo, session)
      } catch (error) {
        handleError(
          error,
          'Todo.toggleStep',
          'Failed to update step',
          { 
            retry: () => toggleStep(todoId, stepId),
            extraData: { userId: user?.id, todoId, stepId }
          }
        )
        // Revert the local change
        setTodos(todos)
      }
    }
  }
  
  // Function to add a step to a todo
  const addStep = async (todoId: string) => {
    if (!stepInput.trim()) return
    
    const todoIndex = todos.findIndex(todo => todo.id === todoId)
    if (todoIndex === -1) return
    
    const todo = todos[todoIndex]
    const newStep = {
      id: uuidv4(),
      text: stepInput.trim(),
      completed: false
    }
    
    const updatedSteps = todo.steps ? [...todo.steps, newStep] : [newStep]
    
    const updatedTodo = {
      ...todo,
      steps: updatedSteps,
      updated_at: new Date().toISOString()
    }
    
    const updatedTodos = [
      ...todos.slice(0, todoIndex),
      updatedTodo,
      ...todos.slice(todoIndex + 1)
    ]
    
    setTodos(updatedTodos)
    setStepInput('')
    saveTodosLocally(updatedTodos)
    
    if (user && session) {
      try {
        await productivityToolsApi.updateTask(todoId, updatedTodo, session)
        toast.success('Step added', {
          description: 'Breaking down tasks helps improve focus and motivation',
          icon: <Sparkles className="h-5 w-5 text-yellow-500" />
        })
      } catch (error) {
        handleError(
          error,
          'Todo.addStep',
          'Failed to add step',
          { 
            retry: () => {
              setStepInput(newStep.text)
              addStep(todoId)
            },
            extraData: { userId: user?.id, todoId }
          }
        )
        // Revert the local addition
        setTodos(todos)
      }
    }
  }
  
  // Function to delete a step
  const deleteStep = async (todoId: string, stepId: string) => {
    const todoIndex = todos.findIndex(todo => todo.id === todoId)
    if (todoIndex === -1) return
    
    const todo = todos[todoIndex]
    if (!todo.steps) return
    
    const updatedSteps = todo.steps.filter(step => step.id !== stepId)
    
    const updatedTodo = {
      ...todo,
      steps: updatedSteps,
      updated_at: new Date().toISOString()
    }
    
    const updatedTodos = [
      ...todos.slice(0, todoIndex),
      updatedTodo,
      ...todos.slice(todoIndex + 1)
    ]
    
    setTodos(updatedTodos)
    saveTodosLocally(updatedTodos)
    
    if (user && session) {
      try {
        await productivityToolsApi.updateTask(todoId, updatedTodo, session)
      } catch (error) {
        handleError(
          error,
          'Todo.deleteStep',
          'Failed to delete step',
          { 
            retry: () => deleteStep(todoId, stepId),
            extraData: { userId: user?.id, todoId, stepId }
          }
        )
        // Revert the local deletion
        setTodos(todos)
      }
    }
  }
  
  // Function to start editing a step
  const startEditingStep = (todoId: string, stepId: string, text: string) => {
    setEditingStepId(stepId)
    setEditingStepText(text)
  }
  
  // Function to save step edit
  const saveStepEdit = async (todoId: string, stepId: string) => {
    if (!editingStepText.trim()) return
    
    const todoIndex = todos.findIndex(todo => todo.id === todoId)
    if (todoIndex === -1) return
    
    const todo = todos[todoIndex]
    if (!todo.steps) return
    
    const stepIndex = todo.steps.findIndex(step => step.id === stepId)
    if (stepIndex === -1) return
    
    const updatedSteps = [...todo.steps]
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      text: editingStepText.trim()
    }
    
    const updatedTodo = {
      ...todo,
      steps: updatedSteps,
      updated_at: new Date().toISOString()
    }
    
    const updatedTodos = [
      ...todos.slice(0, todoIndex),
      updatedTodo,
      ...todos.slice(todoIndex + 1)
    ]
    
    setTodos(updatedTodos)
    setEditingStepId(null)
    setEditingStepText('')
    saveTodosLocally(updatedTodos)
    
    if (user && session) {
      try {
        await productivityToolsApi.updateTask(todoId, updatedTodo, session)
      } catch (error) {
        handleError(
          error,
          'Todo.saveStepEdit',
          'Failed to update step',
          { 
            retry: () => {
              setEditingStepId(stepId)
              setEditingStepText(editingStepText)
              saveStepEdit(todoId, stepId)
            },
            extraData: { userId: user?.id, todoId, stepId }
          }
        )
        // Revert the local edit
        setTodos(todos)
      }
    }
  }
  
  // Function to toggle expanded state for a todo
  const toggleExpanded = (todoId: string) => {
    setExpanded({
      ...expanded,
      [todoId]: !expanded[todoId]
    })
  }
  
  // Function to trigger confetti animation
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)
  }
  
  const getMatrixQuadrant = (urgency: 'high' | 'medium' | 'low', importance: 'high' | 'medium' | 'low') => {
    if (urgency === 'high' && importance === 'high') return { quadrant: 1, label: 'Do First', icon: <AlertTriangle className="h-4 w-4 text-red-500" /> }
    if (urgency === 'high' && importance === 'low') return { quadrant: 2, label: 'Schedule', icon: <Calendar className="h-4 w-4 text-amber-500" /> }
    if (urgency === 'low' && importance === 'high') return { quadrant: 3, label: 'Delegate', icon: <ArrowUpRight className="h-4 w-4 text-blue-500" /> }
    return { quadrant: 4, label: 'Eliminate', icon: <X className="h-4 w-4 text-slate-500" /> }
  }
  
  const addTag = () => {
    if (!tagInput.trim()) return
    if (!editTags.includes(tagInput.trim())) {
      setEditTags([...editTags, tagInput.trim()])
    }
    setTagInput('')
  }
  
  const removeTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag))
  }
  
  const getEnergyIcon = (energy: 'low' | 'medium' | 'high') => {
    switch (energy) {
      case 'high': return <Zap className="h-4 w-4 text-yellow-500" />
      case 'medium': return <BatteryCharging className="h-4 w-4 text-blue-500" />
      case 'low': return <Battery className="h-4 w-4 text-green-500" />
      default: return <BatteryCharging className="h-4 w-4 text-slate-500" />
    }
  }
  
  const getTimeEstimateLabel = (minutes: number) => {
    if (minutes < 15) return 'Quick'
    if (minutes < 30) return 'Short'
    if (minutes < 60) return 'Medium'
    if (minutes < 120) return 'Long'
    return 'Extended'
  }
  
  if (quickMode) {
    // Simple version for quick tasks
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle>Quick Tasks</CardTitle>
            <CardDescription>Add and manage your to-do items</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a new task..."
                className="flex-1"
              />
              <Button onClick={(e) => {
                e.stopPropagation();
                addTodo();
              }} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {filteredTodos.map((todo, index) => (
                    <motion.li
                      key={todo.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 group"
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTodo(todo.id);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        {todo.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </Button>
                      
                      <span className={`flex-1 ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {todo.title}
                      </span>
                      
                      <Badge className={`${getPriorityColor(todo.priority)} opacity-70`}>
                        {todo.priority}
                      </Badge>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTodo(todo.id);
                        }}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Full featured version
  return (
    <Card className={cn("max-w-full", className)} data-testid="todo-container">
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {title} {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <div className="flex items-center gap-2">
              {!readOnly && (
                <Select
                  value={activeView}
                  onValueChange={(value) => setActiveView(value as 'list' | 'matrix' | 'energy' | 'context')}
                  data-testid="view-selector"
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">List View</SelectItem>
                    <SelectItem value="matrix">Priority Matrix</SelectItem>
                    {energyView && <SelectItem value="energy">Energy View</SelectItem>}
                    {contextView && <SelectItem value="context">Context View</SelectItem>}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {!readOnly && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              addTodo()
            }}
            className="mb-4 flex items-center space-x-2"
            data-testid="todo-form"
          >
            <Input
              ref={inputRef}
              type="text"
              placeholder="Add a new task..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              data-testid="todo-input"
            />
            <Button type="submit" disabled={!inputValue.trim()} data-testid="add-todo-button">
              <Plus className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Add</span>
            </Button>
          </form>
        )}

        {activeView === 'list' && (
          <div className="space-y-3 mt-2" data-testid="todo-list">
            <AnimatePresence mode="sync">
              {todos
                .filter(todo => {
                  if (filterCompleted === true) return todo.completed
                  if (filterCompleted === false) return !todo.completed
                  return true
                })
                .filter(todo => priorityFilter === 'all' || todo.priority === priorityFilter)
                .filter(todo => showCompleted || !todo.completed)
                .map((todo, index) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    layout
                    className={cn(
                      "rounded-lg border p-3",
                      todo.completed ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950" : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
                    )}
                    data-testid={`todo-item-${todo.id}`}
                  >
                    {/* Todo item contents... */}
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}

        {/* Other view components... */}
      </CardContent>
    </Card>
  )
} 