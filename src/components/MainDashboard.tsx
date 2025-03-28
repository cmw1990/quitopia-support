import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dashboard } from './Dashboard';
import { HolisticDashboard } from './health/HolisticDashboard';
import AdvancedAnalyticsDashboard from './analytics/AdvancedAnalyticsDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { BadgeCheck, BarChart3, BedDouble, MessageSquare, PieChart, Share } from 'lucide-react';

interface MainDashboardProps {
  session: any;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ session }) => {
  return (
    <Tabs defaultValue="overview" className="space-y-8">
      <div className="sticky top-0 z-10 bg-background pt-2 pb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holistic">Holistic Health</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Access your most important tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            <Link to="/app/sleep-quality">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2 items-center justify-center">
                <BedDouble className="h-6 w-6" />
                <span>Sleep Quality</span>
              </Button>
            </Link>
            <Link to="/app/private-messaging">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2 items-center justify-center">
                <MessageSquare className="h-6 w-6" />
                <span>Private Messages</span>
              </Button>
            </Link>
            <Link to="/app/healthcare-reports">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2 items-center justify-center">
                <Share className="h-6 w-6" />
                <span>Healthcare Reports</span>
              </Button>
            </Link>
            <Link to="/app/advanced-analytics">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2 items-center justify-center">
                <PieChart className="h-6 w-6" />
                <span>Analytics</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <TabsContent value="overview" className="space-y-4">
        <Dashboard session={session} />
      </TabsContent>
      
      <TabsContent value="holistic" className="space-y-4">
        <HolisticDashboard session={session} />
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-4">
        <AdvancedAnalyticsDashboard />
      </TabsContent>
    </Tabs>
  );
};

export default MainDashboard; 