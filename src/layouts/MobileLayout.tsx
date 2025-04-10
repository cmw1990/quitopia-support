import { Outlet } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { useMedia } from '@/hooks/useMedia';
import { useNavigate } from 'react-router-dom';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileNavbar } from '@/components/mobile/MobileNavbar';
import { Loading } from '@/components/ui/loading';

export default function MobileLayout() {
  const navigate = useNavigate();
  const isDesktop = useMedia('(min-width: 768px)');
  
  // Redirect to desktop view if accessed on desktop
  useEffect(() => {
    if (isDesktop) {
      navigate('/app/dashboard');
    }
  }, [isDesktop, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <MobileHeader />
      
      <main className="flex-1 overflow-hidden pt-16 pb-16">
        <Suspense fallback={<Loading className="h-screen flex items-center justify-center" />}>
          <Outlet />
        </Suspense>
      </main>
      
      <MobileNavbar />
    </div>
  );
} 