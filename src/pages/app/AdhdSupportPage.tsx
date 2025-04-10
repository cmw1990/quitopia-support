import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { supabaseRequest } from '@/utils/supabaseRequest';
import  ADHDSupportComponent from '@/components/adhd/ADHDSupport';
import {  CheckCircle2, PlusIcon, TrashIcon, ArrowDown, ArrowUp, CaretDown, CaretUp } from 'lucide-react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFacetedRowModel,
  getFilteredRowModel,
  getFacetedUniqueValues,
  OnChangeFn,
  PaginationState,
  HeaderContext,
  TableOptions,
} from '@tanstack/react-table';
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string | undefined;
}

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

interface Strategy {
  id: string;
  strategy_name: string;
  description: string;
  effectiveness_score: number;
  category: string;
}

const Priorities = ["high", "medium", "low"] as const

const PrioritiesEnum = {
    "high": "High",
    "medium": "Medium",
    "low": "Low"
}

const PrioritiesRanking = {
    "high": 1,
    "medium": 2,
    "low": 3
}
const Symptoms = ["distractibility", "impulsivity", "hyperactivity"] as const

const filterSymptoms = [
  {
    id: "distractibility",
    label: "Distractibility",
  },
  {
    id: "impulsivity",
    label: "Impulsivity",
  },
  {
    id: "hyperactivity",
    label: "Hyperactivity",
  }
]

const filterPriorities = [
  {
    id: "high",
    label: "High",
  },
  {
    id: "medium",
    label: "Medium",
  },
  {
    id: "low",
    label: "Low",
  }
]

// Function to create the columns
const getTaskColumns = (symptomsOptions: any) => {
  const symptomsAccessory = Object.keys(symptomsOptions).filter(key => symptomsOptions[key] === true);

  const columns: ColumnDef<Task, any>[] = [
  {
    accessorKey: "title",
    header: ({ column }:HeaderContext<Task, unknown>) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          {column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
    cell: ({ row }:any) => (<div className="capitalize">{String(row.getValue("title") ?? ''))}</div>),
    enableSorting: true,
  },
  {
    accessorKey: "description",
    header: () => (<div className="text-left">Description</div>),
    cell: ({ row }:any) => {
      const description = row.getValue("description");
      return (<div className="max-w-[500px] truncate">{String(description) ?? ''}</div>)
    },
    enableSorting: false,
  },
  {
    accessorKey: "priority",
    header: ({ column }:HeaderContext<Task, unknown>) => {
      return (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Priority
            {column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      )
    },
    cell: ({ row }:any) => {
      const priority = row.getValue("priority") as keyof typeof PrioritiesEnum;
      return (
        <div className="flex justify-end">
          {PrioritiesEnum[priority] ?? "-"}
        </div>
      )
    },
    filterFn: (row:Task, id:string, value:string[]) => {
      const rowValue = row.getValue(id) as keyof typeof PrioritiesRanking;
      return value.every((val:string) => PrioritiesRanking[rowValue] >= PrioritiesRanking[val as keyof typeof PrioritiesRanking])
    },
    enableSorting: true,
    
  },
  {
    accessorKey: "due_date",
    header: ({ column }:HeaderContext<Task, unknown>) => {
      return (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Due Date
            {column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      )
    },
    cell: ({ row }:any) => {
      const date = row.getValue("due_date");
      return (<div>{date ?? "-"}</div>)
    },
  },
  ]

  return columns
}

interface ADHDSupportPageProps {
  symptoms: any[];
  strategies: Strategy[];
}
const ADHDSupportPage: React.FC = () => {
  const { user, session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState(10);
  const [enableFilters, setEnableFilters] = useState<boolean>(false);
  const [isSymptomsOptions, setIsSymptomsOptions] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  useEffect(() => {
      const defaultIsSymptomsOptions = Symptoms.reduce((obj: any, item) => {
        obj[item] = true;
        return obj;
      }, {});

      setIsSymptomsOptions(defaultIsSymptomsOptions);
  }, []);

    const loadData = useCallback(async () => {
        if (!user) return;

        try {
            // Fetch tasks
            const { data: tasksData, error: tasksError } = await supabaseRequest<Task[]>({ // Use supabaseRequest
                method: 'GET',
                tableName: `/rest/v1/adhd_tasks8?user_id=eq.${user.id}&order=due_date.asc,priority.desc`,
            } as any);
            if (tasksError) throw new Error(`Error fetching tasks: ${tasksError.message}`);
            setTasks(tasksData || []);

            // Fetch strategies
            const { data: strategiesData, error: strategiesError } = await supabaseRequest<Strategy[]>({ // Use supabaseRequest
                method: 'GET',
                tableName: `/rest/v1/adhd_strategies8?select=*&order=effectiveness_score.desc`,
            } as any);
            if (strategiesError) throw new Error(`Error fetching strategies: ${strategiesError.message}`);
            setStrategies(strategiesData || []);

            // Fetch symptoms
            const { data: symptomsData, error: symptomsError } = await supabaseRequest<any[]>( // Use supabaseRequest
                `/rest/v1/adhd_symptoms8?user_id=eq.${user.id}&order=recorded_at.desc&limit=30`
            );
            if (symptomsError) throw new Error(`Error fetching symptoms: ${symptomsError.message}`);
            setSymptoms(symptomsData || []);
        } catch (error: any) {
            console.error("Error loading data:", error.message);
            toast({
                variant: "destructive",
                title: "Failed to load data",
                description: error.message,
            });
        }
  }, [user, toast]);

  useEffect(() => {
    loadData();
  },[loadData])

  const columns = React.useMemo(
    () => getTaskColumns(isSymptomsOptions),
    [isSymptomsOptions]
  )

    const tableOptions: TableOptions<Task> = {
        data: tasks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: (updater: OnChangeFn<PaginationState>) =>
            setPageIndex((updater(0) as {pageIndex: number}).pageIndex),
       
  getState: () => ({
            columnVisibility: columnVisibility,
            columnFilters: columnFilters,
            sorting: sorting,
            pagination: {
                pageIndex,
                pageSize,
            },
        }),
enableFacetedFiltering: enableFilters,
        enableSorting: enableFilters,
        enableColumnFilters: enableFilters,
        debugTable: false,
        debugSetup: false,
    };
  const table = useReactTable(tableOptions);

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">ADHD Support Tools</h1>
      </div>
      
      <ADHDSupportComponent symptoms={symptoms} strategies={strategies} key={symptoms.length + strategies.length} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                  <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : (
                      header.column.columnDef.header)
                    }
                </TableHead>
                )})}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(row)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of {table.getCoreRowModel().rows.length} row(s)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ADHDSupportPage;
