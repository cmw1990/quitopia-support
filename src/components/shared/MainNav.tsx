import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

const mainNavItems = [
  { title: 'Dashboard', href: '/app/dashboard' },
  { title: 'Analytics', href: '/app/analytics' },
  { title: 'Sleep', href: '/app/sleep' },
  { title: 'Exercise', href: '/app/exercise' },
  { title: 'Focus', href: '/app/focus' },
  { title: 'Mental Health', href: '/app/mental-health' },
  { title: 'Energy', href: '/app/energy' },
  { title: 'Recovery', href: '/app/recovery' },
];

export function MainNav() {
  const location = useLocation();

  return (
    <div className="mr-4 hidden md:flex">
      <Link to="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">
          Well-Charged
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "transition-colors hover:text-foreground/80",
              location.pathname === item.href
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            {item.title}
          </Link>
        ))}
        <Button variant="outline" asChild>
          <Link to="/tool">Tools</Link>
        </Button>
      </nav>
    </div>
  );
}
