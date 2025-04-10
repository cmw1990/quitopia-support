import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import {
  Brain,
  Clock,
  Focus,
  Home,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  X,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/focus-timer', label: 'Focus Timer', icon: Clock },
  { path: '/adhd-support', label: 'ADHD Support', icon: Brain },
  { path: '/distraction-blocker', label: 'Distraction Blocker', icon: Focus },
  { path: '/energy-support', label: 'Energy Support', icon: Zap },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
]

const Navigation: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const [isOpen, setIsOpen] = React.useState(false)

  const NavLink: React.FC<{
    path: string
    label: string
    icon: React.ElementType
    onClick?: () => void
  }> = ({ path, label, icon: Icon, onClick }) => {
    const isActive = location.pathname === path
    return (
      <Link
        to={path}
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
          'hover:bg-accent hover:text-accent-foreground',
          isActive ? 'bg-accent text-accent-foreground' : 'text-foreground/60'
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    )
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Focus className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Easier Focus
            </span>
          </Link>
          <div className="flex gap-6">
            {navigationItems.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
          </div>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Focus className="h-6 w-6" />
                Easier Focus
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 py-6">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  {...item}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="mr-6"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 