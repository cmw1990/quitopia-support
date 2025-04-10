import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRightLeft, 
  Calendar, 
  Check, 
  Clock, 
  HistoryIcon,
  RefreshCcw,
  X 
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import * as contextSwitchingService from '@/services/contextSwitchingService';
import { ContextSwitchLog, SavedContext } from './types';

interface SwitchingHistoryPanelProps {
  logs: ContextSwitchLog[];
  savedContexts: SavedContext[];
  onRefreshData: () => Promise<void>;
}

const SwitchingHistoryPanel: React.FC<SwitchingHistoryPanelProps> = ({
  logs,
  savedContexts,
  onRefreshData
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Instant';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    } else if (remainingSeconds === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  const groupLogsByDate = (logs: ContextSwitchLog[]) => {
    const grouped: Record<string, ContextSwitchLog[]> = {};
    
    logs.forEach(log => {
      if (!log.created_at) return;
      
      const date = new Date(log.created_at);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(log);
    });
    
    return grouped;
  };

  const getFormattedDate = (dateKey: string) => {
    const date = new Date(dateKey);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateKey === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateKey === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }).format(date);
    }
  };

  const groupedLogs = groupLogsByDate(logs);
  const dateKeys = Object.keys(groupedLogs).sort().reverse();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Context Switching History</h2>
        <Button variant="outline" onClick={onRefreshData}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {logs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Switching History</CardTitle>
            <CardDescription>
              You haven't switched contexts yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <HistoryIcon className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-center text-sm text-gray-500 mb-4">
              Your context switching history will appear here once you start switching between contexts.
              This helps you track your task transitions and analyze your productivity patterns.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {dateKeys.map(dateKey => (
            <Card key={dateKey}>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  <CardTitle>{getFormattedDate(dateKey)}</CardTitle>
                </div>
                <CardDescription>
                  {groupedLogs[dateKey].length} context {groupedLogs[dateKey].length === 1 ? 'switch' : 'switches'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">From → To</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedLogs[dateKey].map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <ArrowRightLeft className="h-4 w-4 text-primary mr-2" />
                            <div>
                              <div className="line-clamp-1">
                                {log.from_context_name || 'No context'} 
                              </div>
                              <div className="flex items-center">
                                <ArrowRightLeft className="h-3 w-3 rotate-90 mx-1 text-gray-400" />
                                <span className="font-semibold">{log.to_context_name}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-gray-500" />
                            {formatDuration(log.duration_seconds)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {log.completed ? (
                            <Badge variant="outline" className="bg-green-100">
                              <Check className="h-3 w-3 mr-1 text-green-600" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-100">
                              <X className="h-3 w-3 mr-1 text-amber-600" />
                              Interrupted
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SwitchingHistoryPanel; 