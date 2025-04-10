import { Card } from "@/components/ui/card";

export function NicotineHistory({ history = [] }: { history: any[] }) {
  if (history.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No nicotine intake logged yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((log) => (
        <Card key={log.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{log.activity_name}</p>
              <p className="text-sm text-muted-foreground">
                Energy Rating: {log.energy_rating}/10
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(log.created_at).toLocaleDateString()}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}