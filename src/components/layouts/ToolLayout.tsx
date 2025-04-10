import { Outlet } from 'react-router-dom';
import { ToolNav } from '@/components/shared/ToolNav';

export default function ToolLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <ToolNav />
        <main className="mt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
