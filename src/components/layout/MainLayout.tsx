import React from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navigation from './Navigation'
import { ThemeProvider } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

interface MainLayoutProps {
  className?: string
}

const MainLayout: React.FC<MainLayoutProps> = ({ className }) => {
  const { user } = useAuth()

  // Redirect to login if not authenticated (handled by the route guard)
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className={cn('min-h-screen bg-background font-sans antialiased', className)}>
        <Navigation />
        <main className="relative flex min-h-screen flex-col">
          <div className="flex-1 container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
        <Toaster position="bottom-right" richColors />
      </div>
    </ThemeProvider>
  )
}

export default MainLayout 