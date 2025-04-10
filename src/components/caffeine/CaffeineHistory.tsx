import { Coffee } from "lucide-react";

interface CaffeineHistoryProps {
  history: Array<{
    id: string;
    activity_name: string;
    energy_rating: number;
    created_at: string;
  }>;
}

export const CaffeineHistory = ({ history }: CaffeineHistoryProps) => {
  const getEnergyColor = (rating: number) => {
    if (!rating) return "bg-gray-100";
    if (rating <= 3) return "bg-energy-low";
    if (rating <= 7) return "bg-energy-medium";
    return "bg-energy-high";
  };

  return (
    <div className="space-y-4">
      {history?.map((log) => (
        <div
          key={log.id}
          className="flex items-center justify-between border rounded-lg p-3 hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Coffee className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{log.activity_name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className={`w-2 h-2 rounded-full ${getEnergyColor(log.energy_rating)}`} 
                  title={`Energy Level: ${log.energy_rating}/10`}
                />
                <p className="text-sm text-muted-foreground">
                  Energy Level: {log.energy_rating}/10
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(log.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
      {(!history || history.length === 0) && (
        <p className="text-center text-muted-foreground py-8">
          No caffeine intake logged yet
        </p>
      )}
    </div>
  );
};