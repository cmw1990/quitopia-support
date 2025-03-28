import { User } from "@/types";

export type ReportFormat = "pdf" | "csv" | "excel";

export type ReportSection = {
  id: string;
  title: string;
  description?: string;
  enabled: boolean;
  order: number;
  dataType?: "line" | "bar" | "pie" | "table" | "text";
};

export type ReportTemplate = {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  isDefault?: boolean;
};

export interface DateRange {
  from: Date;
  to: Date;
}

export type ReportContent = {
  patientInfo: {
    name: string;
    email: string;
    quitDate?: string;
    profileId?: string;
    userId?: string;
  };
  sections: {
    id: string;
    title: string;
    data: any;
    dataType: "line" | "bar" | "pie" | "table" | "text";
  }[];
  summary: string;
  recommendations: string[];
  generatedAt: string;
};

export type GenerateReportParams = {
  templateId: string;
  dateRange: DateRange;
  userId?: string;
  format: ReportFormat;
};

export type ShareReportParams = {
  reportId: string;
  providerId: string;
  expiresAt?: Date;
  message?: string;
};

export interface UserData {
  id: string;
  user_id: string;
  full_name: string;
  dob?: string;
  quit_date?: string;
  daily_cigarettes?: number;
  cigarettes_per_pack?: number;
  price_per_pack?: number;
}

export interface LogEntry {
  id: string;
  user_id: string;
  date: string;
  value?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SmokingLogEntry extends LogEntry {
  cigarettes: number;
  cravings: number;
  triggers?: string[];
}

export interface MoodLogEntry extends LogEntry {
  score: number;
}

export interface ReportData {
  [key: string]: LogEntry[];
}

export interface ReportResult {
  url: string;
} 