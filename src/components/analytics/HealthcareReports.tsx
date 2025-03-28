import React, { useState, useEffect } from 'react';
import { format as formatDate, subDays } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useAuth } from '@/components/AuthProvider';
import { useApi } from '@/hooks/useApi';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { ReportPreview } from './ReportPreview';
import { CustomizeReportDialog } from './CustomizeReportDialog';
import { ReportTemplate, DateRange } from '@/lib/reports/types';

// Define default report templates
const DEFAULT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'comprehensive',
    name: 'Comprehensive Report',
    description: 'Complete overview of smoking cessation progress',
    sections: [
      { id: 'smoking-behavior', title: 'Smoking Behavior', description: 'Overview of smoking patterns and triggers', enabled: true, order: 1, dataType: 'line' },
      { id: 'cravings', title: 'Cravings', description: 'Frequency and intensity of cravings over time', enabled: true, order: 2, dataType: 'line' },
      { id: 'mood-patterns', title: 'Mood & Energy Patterns', description: 'Tracking mood and energy levels during quit journey', enabled: true, order: 3, dataType: 'bar' },
      { id: 'sleep-quality', title: 'Sleep Quality', description: 'Sleep duration and quality metrics', enabled: true, order: 4, dataType: 'line' },
      { id: 'health-improvements', title: 'Health Improvements', description: 'Measurable health benefits since quitting', enabled: true, order: 5, dataType: 'pie' },
      { id: 'money-saved', title: 'Money Saved', description: 'Financial benefits of quitting smoking', enabled: true, order: 6, dataType: 'bar' },
      { id: 'interventions', title: 'Effective Interventions', description: 'What techniques have worked best', enabled: true, order: 7, dataType: 'table' },
      { id: 'recommendations', title: 'Provider Recommendations', description: 'Healthcare provider suggestions', enabled: true, order: 8, dataType: 'text' },
    ],
    isDefault: true
  },
  {
    id: 'health-metrics',
    name: 'Health Metrics',
    description: 'Focus on health improvements since quitting',
    sections: [
      { id: 'health-improvements', title: 'Health Improvements', description: 'Measurable health benefits since quitting', enabled: true, order: 1, dataType: 'pie' },
      { id: 'vitals', title: 'Vital Signs', description: 'Heart rate, blood pressure, and other metrics', enabled: true, order: 2, dataType: 'line' },
      { id: 'respiratory', title: 'Respiratory Improvement', description: 'Lung function and breathing metrics', enabled: true, order: 3, dataType: 'line' },
      { id: 'sleep-quality', title: 'Sleep Quality', description: 'Sleep duration and quality metrics', enabled: true, order: 4, dataType: 'line' },
    ],
    isDefault: true
  },
  {
    id: 'behavioral',
    name: 'Behavioral Insights',
    description: 'Focus on triggers, cravings, and interventions',
    sections: [
      { id: 'smoking-behavior', title: 'Smoking Behavior', description: 'Overview of smoking patterns and triggers', enabled: true, order: 1, dataType: 'line' },
      { id: 'cravings', title: 'Cravings', description: 'Frequency and intensity of cravings over time', enabled: true, order: 2, dataType: 'line' },
      { id: 'triggers', title: 'Trigger Analysis', description: 'Common triggers and contexts', enabled: true, order: 3, dataType: 'pie' },
      { id: 'interventions', title: 'Effective Interventions', description: 'What techniques have worked best', enabled: true, order: 4, dataType: 'table' },
    ],
    isDefault: true
  }
];

// Available report formats
const REPORT_FORMATS = [
  { id: 'pdf', label: 'PDF Document' },
  { id: 'csv', label: 'CSV (Spreadsheet)' },
  { id: 'excel', label: 'Excel Workbook' }
];

const HealthcareReports = () => {
  const { user } = useAuth();
  const api = useApi();
  
  // State for report configuration
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(DEFAULT_TEMPLATES[0]);
  const [customTemplates, setCustomTemplates] = useState<ReportTemplate[]>([]);
  const [reportFormat, setReportFormat] = useState<string>('pdf');
  const [dateRange, setDateRange] = useState<DateRange>({ 
    from: subDays(new Date(), 30), 
    to: new Date() 
  });
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [reportContent, setReportContent] = useState<any>(null);

  // Fetch user report templates if they exist
  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['reportTemplates', user?.id],
    queryFn: async () => {
      if (!user?.id) return DEFAULT_TEMPLATES;
      try {
        const response = await api.get(`/reports/templates/${user.id}`);
        if (response.data?.templates?.length > 0) {
          return [...DEFAULT_TEMPLATES, ...response.data.templates];
        }
        return DEFAULT_TEMPLATES;
      } catch (error) {
        console.error('Error fetching report templates:', error);
        return DEFAULT_TEMPLATES;
      }
    },
    enabled: !!user?.id
  });

  // Helper for setting date range
  const handleDateRangeChange = (date: Date, field: 'from' | 'to') => {
    setDateRange(prev => ({
      ...prev,
      [field]: date
    }));
  };

  // Template management
  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  const handleUpdateTemplate = (updatedTemplate: ReportTemplate) => {
    if (updatedTemplate.id === selectedTemplate.id) {
      setSelectedTemplate(updatedTemplate);
    }
    
    // If it's a custom template, update in the list
    if (!DEFAULT_TEMPLATES.some(t => t.id === updatedTemplate.id)) {
      setCustomTemplates(prev => 
        prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t)
      );
    }
    
    setIsCustomizing(false);
  };

  // Preview report
  const handlePreviewReport = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate reports",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await api.post('/reports/preview', {
        templateId: selectedTemplate.id,
        dateRange: {
          from: formatDate(dateRange.from, 'yyyy-MM-dd'),
          to: formatDate(dateRange.to, 'yyyy-MM-dd')
        },
        userId: user.id
      });
      
      setReportContent(response.data);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Error generating report preview:', error);
      toast({
        title: "Preview Generation Failed",
        description: "Unable to generate report preview. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Generate report mutation
  const generateMutation = useMutation({
    mutationFn: async (format: string) => {
      const response = await api.post('/reports/generate', {
        templateId: selectedTemplate.id,
        dateRange: {
          from: formatDate(dateRange.from, 'yyyy-MM-dd'),
          to: formatDate(dateRange.to, 'yyyy-MM-dd')
        },
        userId: user?.id,
        format
      });
      return response.data;
    },
    onSuccess: (data) => {
      // If it's a downloadable format, trigger download
      if (data.url) {
        window.open(data.url, '_blank');
      }
      
      toast({
        title: "Report Generated",
        description: `Your report has been successfully generated in ${reportFormat.toUpperCase()} format.`,
        variant: "success"
      });
    },
    onError: (error) => {
      console.error('Error generating report:', error);
      toast({
        title: "Report Generation Failed",
        description: "Unable to generate report. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Share report with a healthcare provider
  const shareMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const response = await api.post('/reports/share', {
        templateId: selectedTemplate.id,
        dateRange: {
          from: formatDate(dateRange.from, 'yyyy-MM-dd'),
          to: formatDate(dateRange.to, 'yyyy-MM-dd')
        },
        userId: user?.id,
        providerId,
        format: reportFormat
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Report Shared",
        description: `Your report has been shared with your healthcare provider.`,
        variant: "success"
      });
    },
    onError: (error) => {
      console.error('Error sharing report:', error);
      toast({
        title: "Sharing Failed",
        description: "Unable to share report with provider. Please try again.",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Healthcare Reports</h2>
          <p className="text-muted-foreground">
            Create and share comprehensive reports with your healthcare providers.
          </p>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Create Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
          <TabsTrigger value="shared">Shared Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>
                Select a template and customize your report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Template</label>
                  <Select 
                    defaultValue={selectedTemplate.id} 
                    onValueChange={handleTemplateSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Format</label>
                  <Select 
                    defaultValue={reportFormat} 
                    onValueChange={setReportFormat}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_FORMATS.map(reportFormatOption => (
                        <SelectItem key={reportFormatOption.id} value={reportFormatOption.id}>
                          {reportFormatOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date</label>
                  <DatePicker 
                    date={dateRange.from}
                    onSelect={(date) => date && handleDateRangeChange(date, 'from')}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">To Date</label>
                  <DatePicker 
                    date={dateRange.to}
                    onSelect={(date) => date && handleDateRangeChange(date, 'to')}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Sections</label>
                <div className="border rounded-md p-3 space-y-2">
                  {selectedTemplate.sections
                    .filter(section => section.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map(section => (
                      <div key={section.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{section.title}</p>
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-muted">
                          {section.dataType}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setIsCustomizing(true)}
              >
                Customize Template
              </Button>
              <div className="space-x-2">
                <Button 
                  variant="secondary"
                  onClick={handlePreviewReport}
                >
                  Preview Report
                </Button>
                <Button 
                  onClick={() => generateMutation.mutate(reportFormat)}
                  disabled={generateMutation.isPending}
                >
                  Generate Report
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold">Report Privacy</h4>
                <p>Reports are stored securely and are only shared with healthcare providers with your explicit permission.</p>
              </div>
              <div>
                <h4 className="font-semibold">Medical Disclaimer</h4>
                <p>The information in these reports should be used as a supplement to, not a replacement for, professional medical advice.</p>
              </div>
              <div>
                <h4 className="font-semibold">Data Accuracy</h4>
                <p>Reports are generated based on the data you've logged in the app. More consistent logging leads to more accurate reports.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {/* Report history tab content - to be implemented */}
          <Card>
            <CardHeader>
              <CardTitle>Your Report History</CardTitle>
              <CardDescription>
                Access and manage your previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Your generated reports will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shared" className="space-y-4">
          {/* Shared reports tab content - to be implemented */}
          <Card>
            <CardHeader>
              <CardTitle>Shared Reports</CardTitle>
              <CardDescription>
                Reports you've shared with healthcare providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Reports that you've shared with healthcare providers will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
      {isCustomizing && (
        <CustomizeReportDialog
          isOpen={isCustomizing}
          onClose={() => setIsCustomizing(false)}
          template={selectedTemplate}
          onUpdateTemplate={handleUpdateTemplate}
        />
      )}
      
      {isPreviewOpen && reportContent && (
        <ReportPreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          content={reportContent}
          onDownload={() => generateMutation.mutate(reportFormat)}
        />
      )}
    </div>
  );
};

export default HealthcareReports; 