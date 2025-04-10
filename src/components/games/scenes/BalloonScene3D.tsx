import { Button } from '@/components/ui/button';

export default function BalloonScenePlaceholder() {
  return (
    <div className="bg-slate-100 dark:bg-slate-800 rounded-md h-[400px] flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          Breathing visualization loads on demand.
        </p>
        <Button>Load Scene</Button>
      </div>
    </div>
  );
}