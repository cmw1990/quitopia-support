import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, X, Calendar, Copy, Heart, Cigarette, TrendingUp, Brain, Smile, BatteryMedium, Activity, AlertTriangle, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { ReportContent, ReportSection, UserData } from '@/lib/reports/types';

interface ReportPreviewProps {
  isOpen: boolean;
  content: ReportContent;
  onClose: () => void;
  onDownload: () => void;
}

// Mock smoking data
const mockSmokingData = [
  { date: '01/01', count: 15 },
  { date: '01/08', count: 12 },
  { date: '01/15', count: 10 },
  { date: '01/22', count: 8 },
  { date: '01/29', count: 5 },
  { date: '02/05', count: 6 },
  { date: '02/12', count: 3 },
  { date: '02/19', count: 2 },
  { date: '02/26', count: 0 },
];

// Mock craving data
const mockCravingData = [
  { trigger: 'Stress', count: 42 },
  { trigger: 'Social', count: 28 },
  { trigger: 'Boredom', count: 18 },
  { trigger: 'After Meal', count: 15 },
  { trigger: 'Morning Routine', count: 10 },
  { trigger: 'Other', count: 7 },
];

// Mock mood data
const mockMoodData = [
  { date: '01/01', score: 5 },
  { date: '01/08', score: 4 },
  { date: '01/15', score: 5 },
  { date: '01/22', score: 6 },
  { date: '01/29', score: 7 },
  { date: '02/05', score: 6 },
  { date: '02/12', score: 8 },
  { date: '02/19', score: 7 },
  { date: '02/26', score: 9 },
];

// Mock energy data
const mockEnergyData = [
  { date: '01/01', score: 4 },
  { date: '01/08', score: 5 },
  { date: '01/15', score: 6 },
  { date: '01/22', score: 7 },
  { date: '01/29', score: 6 },
  { date: '02/05', score: 7 },
  { date: '02/12', score: 8 },
  { date: '02/19', score: 8 },
  { date: '02/26', score: 9 },
];

// Mock focus data
const mockFocusData = [
  { date: '01/01', score: 5 },
  { date: '01/08', score: 5 },
  { date: '01/15', score: 6 },
  { date: '01/22', score: 7 },
  { date: '01/29', score: 8 },
  { date: '02/05', score: 7 },
  { date: '02/12', score: 8 },
  { date: '02/19', score: 9 },
  { date: '02/26', score: 9 },
];

// Mock health improvements data
const mockHealthData = [
  { milestone: 'Blood Pressure Normalized', value: 100, maxValue: 100 },
  { milestone: 'Carbon Monoxide Levels Normalized', value: 100, maxValue: 100 },
  { milestone: 'Lung Function Improvement', value: 60, maxValue: 100 },
  { milestone: 'Circulation Improvement', value: 75, maxValue: 100 },
  { milestone: 'Risk of Heart Attack Reduction', value: 40, maxValue: 100 },
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FD0', '#FF6B6B'];

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  isOpen,
  content,
  onClose,
  onDownload
}) => {
  const { patientInfo, sections, summary, recommendations, generatedAt } = content;
  
  const renderSectionContent = (section: {
    id: string;
    title: string;
    data: any;
    dataType: "line" | "bar" | "pie" | "table" | "text";
  }) => {
    const sectionData = section.data || [];
    
    if (sectionData.length === 0) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">No data available for this period</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {section.dataType !== 'table' && section.dataType !== 'text' && (
          <Card className="bg-muted/30">
            <CardContent className="pt-6 pb-2">
              <ResponsiveContainer width="100%" height={300}>
                {renderChart(section.dataType, sectionData, section.dataType)}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Date</th>
                {section.dataType === 'table' && (
                  <>
                    <th className="text-left py-2 font-medium">Cigarettes</th>
                    <th className="text-left py-2 font-medium">Craving Level</th>
                    <th className="text-left py-2 font-medium">Triggers</th>
                  </>
                )}
                {section.dataType === 'text' && (
                  <>
                    <th className="text-left py-2 font-medium">Mood Score</th>
                    <th className="text-left py-2 font-medium">Notes</th>
                  </>
                )}
                {(section.dataType !== 'table' && section.dataType !== 'text') && (
                  <>
                    <th className="text-left py-2 font-medium">Value</th>
                    <th className="text-left py-2 font-medium">Notes</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {sectionData.slice(0, 10).map((item: any, index: number) => (
                <tr key={index} className="border-b border-muted">
                  <td className="py-2">{format(new Date(item.date), 'MM/dd/yyyy')}</td>
                  {section.dataType === 'table' && (
                    <>
                      <td className="py-2">{item.cigarettes || 0}</td>
                      <td className="py-2">{item?.cravings || 0}</td>
                      <td className="py-2">{item.triggers?.join(', ') || '-'}</td>
                    </>
                  )}
                  {section.dataType === 'text' && (
                    <>
                      <td className="py-2">{item.score || 0}</td>
                      <td className="py-2">{item.notes || '-'}</td>
                    </>
                  )}
                  {(section.dataType !== 'table' && section.dataType !== 'text') && (
                    <>
                      <td className="py-2">{item.value || 0}</td>
                      <td className="py-2">{item.notes || '-'}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {sectionData.length > 10 && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing 10 of {sectionData.length} entries
            </p>
          )}
        </div>
      </div>
    );
  };
  
  const renderChart = (chartType: string, chartData: any[], dataType: string) => {
    const processedData = processChartData(chartData, dataType);
    
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#0ea5e9" />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={processPieData(processedData)}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {processPieData(processedData).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      default:
        return (
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#0ea5e9" />
          </LineChart>
        );
    }
  };
  
  const processChartData = (chartData: any[], dataType: string) => {
    return chartData.slice(0, 14).map(item => {
      const formattedDate = format(new Date(item.date), 'MM/dd');
      
      if (dataType === 'table') {
        return {
          date: formattedDate,
          value: item.cigarettes || 0,
          cravings: item?.cravings || 0
        };
      } else if (dataType === 'text') {
        return {
          date: formattedDate,
          value: item.score || 0
        };
      } else {
        return {
          date: formattedDate,
          value: item.value || 0
        };
      }
    });
  };
  
  const processPieData = (data: any[]) => {
    const valueMap: Record<string, number> = {};
    
    data.forEach(item => {
      valueMap[item.date] = item.value;
    });
    
    return Object.entries(valueMap).map(([date, value]) => ({
      name: date,
      value
    }));
  };
  
  const getSectionIcon = (dataType: string) => {
    const iconClass = "h-4 w-4 mr-2";
    
    switch (dataType) {
      case 'smoking':
        return <span className={`${iconClass} text-red-500`}>🚬</span>;
      case 'cravings':
        return <span className={`${iconClass} text-orange-500`}>🔥</span>;
      case 'mood':
        return <span className={`${iconClass} text-blue-500`}>😊</span>;
      case 'energy':
        return <span className={`${iconClass} text-yellow-500`}>⚡</span>;
      case 'focus':
        return <span className={`${iconClass} text-purple-500`}>🎯</span>;
      case 'health':
        return <span className={`${iconClass} text-green-500`}>❤️</span>;
      default:
        return <span className={`${iconClass} text-gray-500`}>📊</span>;
    }
  };
  
  const renderPatientInfo = (patient: UserData | null) => {
    if (!patient) return null;
    
    return (
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle className="text-base">Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{patient.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quit Date</p>
              <p className="font-medium">
                {patient.quit_date 
                  ? format(new Date(patient.quit_date), 'MM/dd/yyyy')
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <p className="font-medium">
                {patient.dob 
                  ? format(new Date(patient.dob), 'MM/dd/yyyy')
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Report Period</p>
              <p className="font-medium">
                {patientInfo.dateRange.startDate} - {patientInfo.dateRange.endDate}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{patientInfo.template.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Patient Information */}
          {renderPatientInfo(patientInfo.userData)}
          
          {/* Selected Sections */}
          <Tabs defaultValue="sections">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sections">Selected Sections</TabsTrigger>
              <TabsTrigger value="summary">Summary & Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sections" className="space-y-6 mt-6">
              {sections.filter(s => s.selected).map((section) => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      {getSectionIcon(section.dataType)}
                      {section.title}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderSectionContent(section)}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="summary" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Summary & Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Key Observations</h3>
                    <p className="text-sm text-muted-foreground">
                      Based on the data collected during this period, we observe the following patterns:
                    </p>
                    <ul className="list-disc pl-5 text-sm">
                      <li>Patient shows consistent improvement in reduction of cigarette consumption</li>
                      <li>Mood patterns show correlation with craving intensity</li>
                      <li>Reported energy levels are still below optimal range</li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Recommendations</h3>
                    <p className="text-sm text-muted-foreground">
                      The following recommendations are suggested based on the observed data:
                    </p>
                    <ul className="list-disc pl-5 text-sm">
                      <li>Continue with current NRT regimen</li>
                      <li>Focus on sleep hygiene to improve energy levels</li>
                      <li>Consider increasing physical activity to manage cravings</li>
                      <li>Schedule follow-up within 4 weeks to assess progress</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              {patientInfo.includeNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(patientInfo.data).some(([_, items]) => {
                        return Array.isArray(items) && items.some((item: any) => item.notes);
                      }) ? (
                        Object.entries(patientInfo.data).map(([type, items]) => {
                          if (!Array.isArray(items)) return null;
                          return (
                            <React.Fragment key={type}>
                              {items.filter((item: any) => item.notes).map((item: any, index: number) => (
                                <div key={index} className="border-b pb-2 mb-2 last:border-0">
                                  <div className="flex justify-between">
                                    <p className="text-sm font-medium">
                                      {format(new Date(item.date), 'MM/dd/yyyy')}
                                    </p>
                                    <Badge variant="outline">{type}</Badge>
                                  </div>
                                  <p className="text-sm mt-1">{item.notes}</p>
                                </div>
                              ))}
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <p className="text-muted-foreground text-sm">No notes available for this period</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Disclaimer */}
          <div className="flex items-start gap-2 bg-muted/20 p-3 rounded-md">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              This report was generated by Mission Fresh. The data is based on self-reported information and may not be medically verified. 
              This report is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreview; 