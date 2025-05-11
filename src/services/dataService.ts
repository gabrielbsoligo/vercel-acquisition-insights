
// This is a placeholder for the real data service
// In a real application, this would fetch and process data from the backend

import { DateRange } from "react-day-picker";

// Define common interfaces for the data types
export interface KpiData {
  valorRealizado: number;
  meta?: number;
  percentComplete?: number;
}

export interface KpiPercentData {
  valorPercentual: number;
  metaPercentual?: number;
}

export interface SdrPerformanceData {
  sdrName: string;
  leadsAtivados: number;
  reunioesAgendadas: number;
  reunioesAcontecidas: number;
  metaLeadsAtivados?: number;
  metaReunioesAgendadas?: number;
  metaReunioesAcontecidas?: number;
}

export interface CloserPerformanceData {
  closerName: string;
  valorVendido: number;
  numVendas: number;
  ticketMedio: number;
}

export interface SalesFunnelData {
  etapa: string;
  valor: number;
}

// Mock functions to return sample data
// In real application, these would fetch from the CSV files

export const fetchSdrKpiData = async (
  metric: string,
  dateRange?: DateRange,
  sdr?: string
): Promise<KpiData> => {
  // Mock data - would be replaced with actual data processing
  return {
    valorRealizado: Math.floor(Math.random() * 500),
    meta: Math.floor(Math.random() * 600),
    percentComplete: Math.floor(Math.random() * 100),
  };
};

export const fetchSdrPerformanceData = async (
  dateRange?: DateRange,
  sdr?: string
): Promise<SdrPerformanceData[]> => {
  // Mock data - would be replaced with actual data processing
  return [
    {
      sdrName: "Gabi",
      leadsAtivados: 120,
      reunioesAgendadas: 45,
      reunioesAcontecidas: 30,
      metaLeadsAtivados: 150,
      metaReunioesAgendadas: 50,
      metaReunioesAcontecidas: 35,
    },
    {
      sdrName: "Jenni",
      leadsAtivados: 135,
      reunioesAgendadas: 52,
      reunioesAcontecidas: 38,
      metaLeadsAtivados: 150,
      metaReunioesAgendadas: 50,
      metaReunioesAcontecidas: 35,
    },
  ];
};

export const fetchCloserKpiData = async (
  metric: string,
  dateRangeStart?: DateRange,
  dateRangeEnd?: DateRange,
  closer?: string,
  origin?: string
): Promise<KpiData> => {
  // Mock data - would be replaced with actual data processing
  return {
    valorRealizado: Math.floor(Math.random() * 10000),
    meta: Math.floor(Math.random() * 12000),
    percentComplete: Math.floor(Math.random() * 100),
  };
};

export const fetchCloserPerformanceData = async (
  dateRangeStart?: DateRange,
  dateRangeEnd?: DateRange,
  closer?: string,
  origin?: string
): Promise<CloserPerformanceData[]> => {
  // Mock data - would be replaced with actual data processing
  return [
    {
      closerName: "Gabriel",
      valorVendido: 85000,
      numVendas: 15,
      ticketMedio: 5667,
    },
    {
      closerName: "Célio",
      valorVendido: 95000,
      numVendas: 17,
      ticketMedio: 5588,
    },
  ];
};

export const fetchSalesFunnelData = async (
  dateRangeStart?: DateRange,
  dateRangeEnd?: DateRange,
  filter?: string
): Promise<SalesFunnelData[]> => {
  // Mock data - would be replaced with actual data processing
  return [
    { etapa: "Leads Ativados", valor: 500 },
    { etapa: "Conexões", valor: 350 },
    { etapa: "Reuniões Agendadas", valor: 200 },
    { etapa: "Reuniões Acontecidas", valor: 150 },
  ];
};

// Additional mock data functions would be added here
