import { Card } from "@/components/ui/card";

export function SupplementHistory({ logs = [] }: { logs: any[] }) {
  if (logs.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No supplement intake logged yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{log.supplement_name}</p>
              <p className="text-sm text-muted-foreground">
                Dosage: {log.dosage}
              </p>
              <p className="text-sm text-muted-foreground">
                Effectiveness: {log.effectiveness_rating}/10
              </p>
              {log.side_effects && (
                <p className="text-sm text-muted-foreground">
                  Side Effects: {log.side_effects}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(log.time_taken).toLocaleDateString()}
            </p>
          </div>
          {log.notes && (
            <p className="mt-2 text-sm text-muted-foreground">{log.notes}</p>
          )}
        </Card>
      ))}
    </div>
  );
}