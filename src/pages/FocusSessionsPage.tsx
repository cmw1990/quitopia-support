import React, { useEffect, useState } from 'react';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { Calendar, Clock, Activity, AlertTriangle, CheckCircle, PauseCircle, X, ChevronDown, ChevronUp, Filter, Plus, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import { FocusSession, FocusSessionStats, supabaseRestCall, getFocusSessionStats } from '@/api/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import FocusSessionPlanner from '@/components/FocusSessionPlanner';
import { Button } from "@/components/ui/button";

const FocusSessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<FocusSession[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FocusSessionStats>({
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    averageDuration: 0,
    totalFocusTime: 0,
    totalDistractions: 0,
  });
  
  // Filtering and sorting state
  const [filters, setFilters] = useState({
    status: 'all',
    focus_type: 'all',
    dateRange: 'all',
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Fetch focus sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch sessions using generic call (assuming RLS or need for user_id filter)
        const sessionsData = await supabaseRestCall<FocusSession[]>(
            `/rest/v1/focus_sessions?select=*&user_id=eq.${user.id}&order=created_at.desc`,
            { method: "GET" }
          );
        setSessions(sessionsData || []);
        // setFilteredSessions(sessionsData || []); // Filtering happens in separate useEffect
        
        // Fetch stats using specific function
        const statsData = await getFocusSessionStats();
        setStats(statsData || { totalSessions: 0, completedSessions: 0, cancelledSessions: 0, averageDuration: 0, totalFocusTime: 0, totalDistractions: 0 }); // Provide default
      } catch (err) {
        setError('Failed to load focus sessions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, [user]);
  
  // Filter and sort sessions
  useEffect(() => {
    if (!sessions.length) return;
    
    let result = [...sessions];
    
    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(session => session.status === filters.status);
    }
    
    // Apply focus_type filter
    if (filters.focus_type !== 'all') {
      result = result.filter(session => session.focus_type === filters.focus_type);
    }
    
    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      if (filters.dateRange === 'today') {
        result = result.filter(session => {
          const sessionDate = parseISO(session.created_at);
          return sessionDate >= todayStart;
        });
      } else if (filters.dateRange === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        result = result.filter(session => {
          const sessionDate = parseISO(session.created_at);
          return sessionDate >= weekStart;
        });
      } else if (filters.dateRange === 'month') {
        const monthStart = new Date(today);
        monthStart.setMonth(today.getMonth() - 1);
        result = result.filter(session => {
          const sessionDate = parseISO(session.created_at);
          return sessionDate >= monthStart;
        });
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'duration') {
        const durationA = a.duration_minutes || 0;
        const durationB = b.duration_minutes || 0;
        return sortDirection === 'asc' ? durationA - durationB : durationB - durationA;
      } else if (sortBy === 'focus_type') {
        const typeA = a.focus_type || '';
        const typeB = b.focus_type || '';
        return sortDirection === 'asc' 
          ? typeA.localeCompare(typeB)
          : typeB.localeCompare(typeA);
      }
      return 0;
    });
    
    setFilteredSessions(result);
  }, [sessions, filters, sortBy, sortDirection]);
  
  // Handle sorting change
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  // Toggle session expand
  const toggleSession = (id: string) => {
    setExpandedSession(expandedSession === id ? null : id);
  };
  
  // Handle session deletion with confirmation
  const handleDeleteSession = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this focus session?')) {
      try {
        // Use generic delete call for now
        // await deleteFocusSession(id); 
         await supabaseRestCall<void>(
           `/rest/v1/focus_sessions?id=eq.${id}`,
           { method: "DELETE" }
         );
        setSessions(prevSessions => prevSessions.filter(s => s.id !== id));
        toast.success("Focus session deleted."); // Add user feedback
      } catch (err) {
        console.error('Error deleting session:', err);
        setError('Failed to delete session');
        toast.error("Failed to delete session."); // Add user feedback
      }
    }
  };
  
  // Format duration for display (use minutes)
  const formatDuration = (minutes: number | null | undefined) => {
    if (minutes == null) return '0m';
    const mins = Math.round(minutes); // Already in minutes
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    
    return hours > 0 
      ? `${hours}h ${remainingMins}m`
      : `${remainingMins}m`;
  };
  
  // Get status icon
  const getStatusIcon = (status: FocusSession['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'paused':
        return <PauseCircle className="w-5 h-5 text-amber-500" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };
  
  // Calculate completion percentage
  const getCompletionPercentage = (session: FocusSession) => {
    // Requires start_time, end_time, planned_duration, actual_duration, status
    // Adapt based on available fields in FocusSession type from supabaseClient
    if (!session.status) return 0;
    if (session.status === 'completed') return 100;
    
    // Estimate based on duration_minutes if actual/planned not available
    // This is an approximation and might need refinement based on exact schema/data
    if (session.status === 'cancelled' || session.status === 'active' || session.status === 'paused') {
      // We lack planned vs actual duration here, maybe just show 0% for cancelled/paused?
      // Or base it on time elapsed if active? Requires start_time.
      if (session.status === 'active' && session.start_time) {
         // Estimate based on time elapsed vs standard session length? Risky.
         return 50; // Placeholder
      }
       return 0; // Placeholder for cancelled/paused without better data
    }
    
    return 0;
  };
  
  // Get unique techniques for filter
  const techniques = [...new Set(sessions.map(s => s.focus_type).filter(Boolean))] as string[];
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your focus sessions...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
          <div>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-600 dark:hover:text-red-200"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Focus Session Planner Component */}
      <FocusSessionPlanner />
      
      {/* Existing Sessions History Section Wrapped */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Session History</h2>
        </div>
        
        {/* Stats summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Sessions</h2>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalSessions}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.completedSessions} completed, {stats.cancelledSessions} cancelled
                </p>
              </div>
              <Calendar className="h-10 w-10 text-blue-500 opacity-75" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Focus Time</h2>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatDuration(stats.totalFocusTime)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Avg: {formatDuration(stats.averageDuration)} / completed session
                </p>
              </div>
              <Clock className="h-10 w-10 text-blue-500 opacity-75" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Distractions</h2>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalDistractions}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Avg: {stats.completedSessions ? (stats.totalDistractions / stats.completedSessions).toFixed(1) : '0'} / completed session
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-amber-500 opacity-75" />
            </div>
          </div>
        </div>
        
        {/* Filters and sorting */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-800 dark:text-gray-200">Filter & Sort</span>
            </div>
            {filterOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </div>
          
          {filterOpen && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={filters.status}
                    onChange={e => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">All statuses</option>
                    <option value="completed">Completed</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technique</label>
                  <select
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={filters.focus_type}
                    onChange={e => setFilters({...filters, focus_type: e.target.value})}
                  >
                    <option value="all">All techniques</option>
                    {techniques.map(technique => (
                      <option key={technique} value={technique} className="capitalize">{technique.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
                  <select
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    value={filters.dateRange}
                    onChange={e => setFilters({...filters, dateRange: e.target.value})}
                  >
                    <option value="all">All time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 days</option>
                    <option value="month">Last 30 days</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                    sortBy === 'date' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleSortChange('date')}
                >
                  Date
                  {sortBy === 'date' && (
                    sortDirection === 'asc' 
                      ? <ArrowUpWideNarrow className="h-3 w-3" />
                      : <ArrowDownWideNarrow className="h-3 w-3" />
                  )}
                </button>
                
                <button
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                    sortBy === 'duration' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleSortChange('duration')}
                >
                  Duration
                  {sortBy === 'duration' && (
                    sortDirection === 'asc' 
                      ? <ArrowUpWideNarrow className="h-3 w-3" />
                      : <ArrowDownWideNarrow className="h-3 w-3" />
                  )}
                </button>
                
                <button
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 capitalize ${
                    sortBy === 'focus_type' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleSortChange('focus_type')}
                >
                  Type
                  {sortBy === 'focus_type' && (
                    sortDirection === 'asc' 
                      ? <ArrowUpWideNarrow className="h-3 w-3" />
                      : <ArrowDownWideNarrow className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Session list */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-10 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No focus sessions found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {filters.status !== 'all' || filters.focus_type !== 'all' || filters.dateRange !== 'all'
                ? "Try adjusting your filters to see more sessions."
                : "You haven't created any focus sessions yet. Use the planner above to start one!"}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Completion
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSessions.map((session) => (
                    <React.Fragment key={session.id}>
                      <tr 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => toggleSession(session.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {format(parseISO(session.created_at), 'MMM d, yyyy')}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {format(parseISO(session.created_at), 'h:mm a')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {session.focus_type ? session.focus_type.replace('_', ' ') : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatDuration(session.duration_minutes)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(session.status)}
                            <span className="ml-1.5 text-sm text-gray-900 dark:text-white capitalize">
                              {session.status || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {session.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : session.status === 'cancelled' ? (
                            <X className="h-5 w-5 text-red-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-400" />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-2"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      
                      {expandedSession === session.id && (
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Session Details</h4>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                  <dt className="text-gray-500 dark:text-gray-400">Start Time</dt>
                                  <dd className="text-gray-900 dark:text-white">
                                    {session.start_time 
                                      ? format(parseISO(session.start_time), 'MMM d, yyyy h:mm a')
                                      : 'Not started'}
                                  </dd>
                                  
                                  <dt className="text-gray-500 dark:text-gray-400">End Time</dt>
                                  <dd className="text-gray-900 dark:text-white">
                                    {session.end_time 
                                      ? format(parseISO(session.end_time), 'MMM d, yyyy h:mm a')
                                      : 'Not ended'}
                                  </dd>
                                  
                                  <dt className="text-gray-500 dark:text-gray-400">Duration</dt>
                                  <dd className="text-gray-900 dark:text-white">
                                    {formatDuration(session.duration_minutes)}
                                  </dd>
                                  
                                  <dt className="text-gray-500 dark:text-gray-400">Distractions</dt>
                                  <dd className="text-gray-900 dark:text-white">
                                    {session.distractions_count || 0}
                                  </dd>
                                </dl>
                              </div>
                              
                              <div>
                                {session.notes && (
                                  <div className="mt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Notes</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                      {session.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusSessionsPage;
