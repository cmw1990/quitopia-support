import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu } from 'lucide-react';

const mobileNavItems = [
  {
    title: 'Dashboard',
    href: '/app/dashboard',
    description: 'View your wellness overview',
  },
  {
    title: 'Analytics',
    href: '/app/analytics',
    description: 'Track your progress over time',
  },
  {
    title: 'Sleep',
    href: '/app/sleep',
    description: 'Monitor and improve your sleep',
  },
  {
    title: 'Exercise',
    href: '/app/exercise',
    description: 'Track your physical activity',
  },
  {
    title: 'Focus',
    href: '/app/focus',
    description: 'Enhance your concentration',
  },
  {
    title: 'Mental Health',
    href: '/app/mental-health',
    description: 'Support for your mental wellbeing',
  },
  {
    title: 'Energy',
    href: '/app/energy',
    description: 'Manage your energy levels',
  },
  {
    title: 'Recovery',
    href: '/app/recovery',
    description: 'Track your recovery progress',
  },
  {
    title: 'Tools',
    href: '/tool',
    description: 'Access wellness tools and resources',
  },
];

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="size-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link to="/" className="flex items-center">
          <span className="font-bold">Well-Charged</span>
        </Link>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-3">
            {mobileNavItems.map(
              (item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none">{item.title}</div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {item.description}
                  </p>
                </Link>
              )
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
