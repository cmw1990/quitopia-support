import React from "react";
import { format, differenceInDays, addDays, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  TrendingDown, 
  Cigarette, 
  Heart, 
  Trophy,
  Check,
  Plus
} from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { QuickLogForm } from "./quick-log-form";

// Types for the timeline data
type MilestoneType = 
  | "health" 
  | "achievement" 
  | "reduction" 
  | "day-count";

interface Milestone {
  id: string;
  type: MilestoneType;
  title: string;
  description: string;
  date: Date;
  iconColor?: string;
  achieved: boolean;
}

interface LogEntry {
  id: string;
  date: Date;
  count: number;
  craving: number;
  mood: number;
  notes?: string;
}

interface ProgressTimelineProps {
  quitDate?: Date;
  milestones?: Milestone[];
  logEntries?: LogEntry[];
  onLogSubmit?: (data: LogEntry) => void;
  className?: string;
}

export function ProgressTimeline({
  quitDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Default: 14 days ago
  milestones = [],
  logEntries = [],
  onLogSubmit,
  className
}: ProgressTimelineProps) {
  const [showQuickLog, setShowQuickLog] = React.useState(false);
  const [selectedLogEntry, setSelectedLogEntry] = React.useState<LogEntry | null>(null);
  
  // Calculate days since quit date
  const daysSinceQuit = differenceInDays(new Date(), quitDate);
  
  // Generate default milestones if none provided
  const defaultMilestones = React.useMemo<Milestone[]>(() => {
    if (milestones.length > 0) return milestones;
    
    return [
      {
        id: "day-1",
        type: "day-count",
        title: "Day 1",
        description: "First day without smoking",
        date: quitDate,
        achieved: daysSinceQuit >= 0
      },
      {
        id: "day-3",
        type: "health",
        title: "Day 3",
        description: "Carbon monoxide levels in blood return to normal",
        date: addDays(quitDate, 3),
        iconColor: "#10b981",
        achieved: daysSinceQuit >= 3
      },
      {
        id: "day-7",
        type: "day-count",
        title: "1 Week",
        description: "One full week smoke-free!",
        date: addDays(quitDate, 7),
        achieved: daysSinceQuit >= 7
      },
      {
        id: "day-14",
        type: "health",
        title: "2 Weeks",
        description: "Lung function begins to improve",
        date: addDays(quitDate, 14),
        iconColor: "#10b981",
        achieved: daysSinceQuit >= 14
      },
      {
        id: "day-30",
        type: "achievement",
        title: "1 Month",
        description: "Circulation improves and your immune system is recovering",
        date: addDays(quitDate, 30),
        iconColor: "#f59e0b",
        achieved: daysSinceQuit >= 30
      },
      {
        id: "day-90",
        type: "health",
        title: "3 Months",
        description: "Lung function significantly improved",
        date: addDays(quitDate, 90),
        iconColor: "#10b981",
        achieved: daysSinceQuit >= 90
      },
      {
        id: "day-365",
        type: "achievement",
        title: "1 Year",
        description: "Risk of heart disease is half that of a smoker",
        date: addDays(quitDate, 365),
        iconColor: "#f59e0b",
        achieved: daysSinceQuit >= 365
      }
    ];
  }, [quitDate, daysSinceQuit, milestones]);
  
  // Get milestone icon based on type
  const getMilestoneIcon = (type: MilestoneType, color?: string) => {
    const iconClass = cn("h-5 w-5", color ? `text-[${color}]` : "");
    
    switch (type) {
      case "health":
        return <Heart className={iconClass} />;
      case "achievement":
        return <Trophy className={iconClass} />;
      case "reduction":
        return <TrendingDown className={iconClass} />;
      case "day-count":
      default:
        return <Calendar className={iconClass} />;
    }
  };
  
  // Get color class for log entry based on count
  const getLogEntryColorClass = (count: number): string => {
    if (count === 0) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (count <= 3) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };
  
  // Find log entry for a specific date
  const getLogEntryForDate = (date: Date): LogEntry | undefined => {
    return logEntries.find(entry => isSameDay(entry.date, date));
  };
  
  // Handle opening the quick log form
  const handleOpenQuickLog = (existingEntry?: LogEntry) => {
    setSelectedLogEntry(existingEntry || null);
    setShowQuickLog(true);
  };
  
  // Handle form submission
  const handleLogSubmit = (data: Omit<LogEntry, 'id'> & { id?: string }) => {
    if (onLogSubmit) {
      onLogSubmit({
        ...data,
        id: selectedLogEntry?.id || `log-${Date.now()}`
      } as LogEntry);
    }
    setShowQuickLog(false);
    setSelectedLogEntry(null);
  };
  
  // Sort milestones by date
  const sortedMilestones = [...defaultMilestones].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );
  
  // Sort log entries by date (most recent first)
  const sortedLogEntries = [...logEntries].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );
  
  return (
    <div className={cn("space-y-8", className)}>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Days Smoke-Free</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.max(0, daysSinceQuit)}</div>
            <p className="text-xs text-muted-foreground">
              Since {format(quitDate, "MMM d, yyyy")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cigarettes Avoided</CardTitle>
            <Cigarette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(0, daysSinceQuit) * 10}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on average consumption
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Health Improved</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.min(100, Math.round(Math.max(0, daysSinceQuit) / 90 * 100))}%
            </div>
            <p className="text-xs text-muted-foreground">
              Based on recovery timeline
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {sortedMilestones.find(m => !m.achieved) ? (
              <>
                <div className="text-md font-bold truncate">
                  {sortedMilestones.find(m => !m.achieved)?.title}
                </div>
                <p className="text-xs text-muted-foreground">
                  In {differenceInDays(
                    sortedMilestones.find(m => !m.achieved)?.date || new Date(),
                    new Date()
                  )} days
                </p>
              </>
            ) : (
              <>
                <div className="text-md font-bold">All Complete!</div>
                <p className="text-xs text-muted-foreground">
                  You've reached all milestones
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Timeline Section */}
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-primary/50 before:to-transparent before:content-[''] md:before:mx-auto md:before:left-0 md:before:right-0">
        {sortedMilestones.map((milestone) => (
          <div key={milestone.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-md dark:bg-gray-900 md:mx-auto">
              {milestone.achieved ? (
                <Check className="h-5 w-5 text-primary" />
              ) : (
                getMilestoneIcon(milestone.type, milestone.iconColor)
              )}
            </div>
            
            <Card className={cn(
              "w-[calc(100%-4rem)] md:w-[calc(50%-4rem)]",
              !milestone.achieved && "opacity-70"
            )}>
              <CardHeader className="p-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{milestone.title}</CardTitle>
                  <Badge variant={milestone.achieved ? "default" : "outline"}>
                    {milestone.achieved ? "Achieved" : "Upcoming"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground mb-2">
                  {milestone.description}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>{format(milestone.date, "MMMM d, yyyy")}</span>
                  
                  {/* If there's a log entry for this day, show it */}
                  {getLogEntryForDate(milestone.date) && (
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "ml-auto cursor-pointer",
                        getLogEntryColorClass(getLogEntryForDate(milestone.date)?.count || 0)
                      )}
                      onClick={() => {
                        const entry = getLogEntryForDate(milestone.date);
                        if (entry) handleOpenQuickLog(entry);
                      }}
                    >
                      <Cigarette className="h-3 w-3 mr-1" />
                      {getLogEntryForDate(milestone.date)?.count || 0} smoked
                    </Badge>
                  )}
                  
                  {/* If there's no log entry and the date is in the past, allow adding */}
                  {!getLogEntryForDate(milestone.date) && milestone.date <= new Date() && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto h-6 text-xs"
                      onClick={() => handleOpenQuickLog({
                        id: `new-${Date.now()}`,
                        date: milestone.date,
                        count: 0,
                        craving: 3,
                        mood: 3
                      })}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add log
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Recent Logs Section */}
      {sortedLogEntries.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Recent Log Entries</h3>
          <div className="space-y-3">
            {sortedLogEntries.slice(0, 5).map((entry) => (
              <Card 
                key={entry.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                onClick={() => handleOpenQuickLog(entry)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      getLogEntryColorClass(entry.count)
                    )}>
                      <Cigarette className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{format(entry.date, "MMMM d, yyyy")}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[240px]">
                        {entry.notes || `Cigarettes: ${entry.count}, Craving: ${entry.craving}, Mood: ${entry.mood}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={entry.count === 0 ? "default" : "outline"}>
                    {entry.count} cigarettes
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {sortedLogEntries.length > 5 && (
            <Button variant="outline" className="w-full mt-3">
              View All Logs
            </Button>
          )}
        </div>
      )}
      
      {/* Add Log Button */}
      <div className="mt-6 flex justify-center">
        <Button onClick={() => handleOpenQuickLog({
          id: `new-${Date.now()}`,
          date: new Date(),
          count: 0,
          craving: 3,
          mood: 3
        })}>
          <Plus className="h-4 w-4 mr-2" />
          Log New Entry
        </Button>
      </div>
      
      {/* Quick Log Form */}
      {showQuickLog && (
        <QuickLogForm
          initialData={selectedLogEntry || undefined}
          onSubmit={handleLogSubmit}
          onCancel={() => setShowQuickLog(false)}
          isOpen={showQuickLog}
        />
      )}
    </div>
  );
} 