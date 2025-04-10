import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ZenGarden() {
  return (
    <Card className="w-full overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Zen Garden</h3>
          <Button variant="outline" size="sm">
            Load Garden
          </Button>
        </div>
        
        <div className="bg-slate-100 dark:bg-slate-800 rounded-md h-[300px] flex items-center justify-center">
          <p className="text-center text-muted-foreground">
            Zen Garden loads on demand.<br />
            Click Load Garden to begin.
          </p>
        </div>
      </div>
    </Card>
  );
}