import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/supabase-client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface TableInfo {
  name: string;
  rowCount: number;
  columns: { name: string; type: string }[];
  recentData?: any[];
}

export const DatabasePanel: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTableInfo = async () => {
      try {
        // Get list of tables
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');

        if (tablesError) throw tablesError;

        // Get info for each table
        const tableInfoPromises = tablesData.map(async ({ table_name }) => {
          // Get column information
          const { data: columnsData } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type')
            .eq('table_schema', 'public')
            .eq('table_name', table_name);

          // Get row count and sample data
          const { count } = await supabase
            .from(table_name)
            .select('*', { count: 'exact', head: true });

          const { data: recentData } = await supabase
            .from(table_name)
            .select('*')
            .limit(3);

          return {
            name: table_name,
            rowCount: count || 0,
            columns: columnsData?.map(col => ({
              name: col.column_name,
              type: col.data_type
            })) || [],
            recentData
          };
        });

        const tableInfo = await Promise.all(tableInfoPromises);
        setTables(tableInfo);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching database info:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchTableInfo();
  }, []);

  if (loading) {
    return (
      <div className="h-1/2 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-1/2 p-4 text-destructive">
        <p>Error loading database info: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-1/2 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Database</h2>
        <Badge variant="outline">
          {tables.length} Tables
        </Badge>
      </div>

      <ScrollArea className="h-[calc(100%-2rem)]">
        <Accordion type="single" collapsible className="w-full">
          {tables.map((table) => (
            <AccordionItem key={table.name} value={table.name}>
              <AccordionTrigger className="text-sm">
                <div className="flex items-center">
                  <span>{table.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {table.rowCount} rows
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  <div className="text-xs text-muted-foreground">
                    Columns:
                    {table.columns.map(col => (
                      <div key={col.name} className="pl-2">
                        • {col.name}: <span className="text-primary">{col.type}</span>
                      </div>
                    ))}
                  </div>
                  {table.recentData && table.recentData.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Recent Data:
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(table.recentData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
};
