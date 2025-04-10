import React, { useState, useEffect } from 'react';
import { contextSwitchingService } from '@/services/context-switching/contextSwitchingService';
import type { ContextSwitchSession } from '@/services/context-switching/contextSwitchingService';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Helper to format seconds nicely (e.g., 1m 30s)
const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined || seconds < 0) return 'N/A';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m${secs > 0 ? ` ${secs}s` : ''}`;
};

// Helper to format date/time
const formatDateTime = (isoString: string | null | undefined): string => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString();
  } catch (e) {
    return 'Invalid Date';
  }
};

export const ContextSwitchingHistory: React.FC = () => {
  const [sessions, setSessions] = useState<ContextSwitchSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await contextSwitchingService.getSwitchingSessionsHistory();
        if (fetchError) throw fetchError;
        setSessions(data || []);
      } catch (err: any) {
        console.error("Failed to fetch context switching history:", err);
        const errorMessage = err.message || "An unknown error occurred while fetching session history.";
        setError(errorMessage);
        toast({
          title: "Error Fetching History",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [toast]); // Dependency array includes toast

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (sessions.length === 0) {
     return (
      <Alert className="m-4">
        <Terminal className="h-4 w-4" />
        <AlertTitle>No History Found</AlertTitle>
        <AlertDescription>
          You haven't completed any context switching sessions yet. Start a switch using a template to build your history!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Context Switching Session History</h2>
      <Table>
        <TableCaption>A list of your recent context switching sessions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Start Time</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Template ID</TableHead> {/* Simple display for now */}
            <TableHead className="text-right">Rating</TableHead>
            {/* Add Notes column later if needed */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>{formatDateTime(session.start_time)}</TableCell>
              <TableCell className="truncate max-w-xs">{session.from_context}</TableCell>
              <TableCell className="truncate max-w-xs">{session.to_context}</TableCell>
              <TableCell>{formatDuration(session.duration_seconds)}</TableCell>
              <TableCell className="font-mono text-xs truncate max-w-[100px]">{session.template_id}</TableCell>
              <TableCell className="text-right">{session.success_rating ?? 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContextSwitchingHistory; 