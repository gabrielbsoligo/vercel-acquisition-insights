
import { DateRange } from "react-day-picker";
import supabase from "./supabaseService";

// Helper function to convert a JS Date to ISO string date (YYYY-MM-DD)
export const dateToIsoString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Utility function to parse date strings
export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  // Try to parse DD/MM/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    // Month is 0-indexed in JavaScript Date
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  
  // Fallback to standard parsing
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

// Utility function to check if a date is within a date range
export const isDateInRange = (
  date: Date | null | undefined,
  range: { from?: Date; to?: Date } | undefined
): boolean => {
  if (!date || !range || (!range.from && !range.to)) return true;
  
  const timestamp = date.getTime();
  const fromValid = range.from ? timestamp >= range.from.getTime() : true;
  const toValid = range.to ? timestamp <= range.to.getTime() : true;
  
  return fromValid && toValid;
};

// Fetch SDR performance data
export const fetchSdrPerformanceData = async () => {
  const { data, error } = await supabase
    .from('sdr_performance')
    .select('*');
  
  if (error) {
    console.error('Error fetching SDR performance data:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch SDR meta data
export const fetchSdrMetaData = async () => {
  const { data, error } = await supabase
    .from('sdr_meta')
    .select('*');
  
  if (error) {
    console.error('Error fetching SDR meta data:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch closer performance data
export const fetchCloserPerformanceData = async () => {
  const { data, error } = await supabase
    .from('closer_performance')
    .select('*');
  
  if (error) {
    console.error('Error fetching closer performance data:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch closer meta data
export const fetchCloserMetaData = async () => {
  const { data, error } = await supabase
    .from('closer_meta')
    .select('*');
  
  if (error) {
    console.error('Error fetching closer meta data:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch negotiations data
export const fetchNegociacoesData = async () => {
  const { data, error } = await supabase
    .from('negociacoes')
    .select('*');
  
  if (error) {
    console.error('Error fetching negociacoes data:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch empresa meta data
export const fetchEmpresaMetaData = async () => {
  const { data, error } = await supabase
    .from('empresa_meta')
    .select('*');
  
  if (error) {
    console.error('Error fetching empresa meta data:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch lead broker data
export const fetchLeadBrokerData = async () => {
  const { data, error } = await supabase
    .from('lead_broker')
    .select('*');
  
  if (error) {
    console.error('Error fetching lead broker data:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch outbound data
export const fetchOutboundData = async () => {
  const { data, error } = await supabase
    .from('outbound')
    .select('*');
  
  if (error) {
    console.error('Error fetching outbound data:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch recomendacao data
export const fetchRecomendacaoData = async () => {
  const { data, error } = await supabase
    .from('recomendacao')
    .select('*');
  
  if (error) {
    console.error('Error fetching recomendacao data:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch data with filters (date range and other filters)
export const fetchFilteredData = async (
  table: string,
  dateRange?: DateRange,
  filters?: Record<string, any>
) => {
  // Start building the query
  let query = supabase.from(table).select('*');
  
  // Apply date filter if provided
  if (dateRange && dateRange.from) {
    const fromDate = dateToIsoString(dateRange.from);
    query = query.gte('Data', fromDate);
  }
  
  if (dateRange && dateRange.to) {
    const toDate = dateToIsoString(dateRange.to);
    query = query.lte('Data', toDate);
  }
  
  // Apply other filters if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== 'all') {
        query = query.eq(key, value);
      }
    });
  }
  
  // Execute the query
  const { data, error } = await query;
  
  if (error) {
    console.error(`Error fetching filtered data from ${table}:`, error);
    throw error;
  }
  
  return data || [];
};
