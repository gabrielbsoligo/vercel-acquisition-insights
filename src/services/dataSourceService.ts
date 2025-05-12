
import supabase from './supabaseService';
import Papa from 'papaparse';
import { type PostgrestQueryBuilder } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

export const parseDate = (dateString: string): Date => {
  // Support for both DD/MM/YYYY and YYYY-MM-DD formats
  const parts = dateString.split(/[\/\-]/);
  
  if (parts.length !== 3) {
    return new Date(); // Return current date if format is invalid
  }
  
  // Check if first part is a year (YYYY-MM-DD format)
  if (parts[0].length === 4) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  
  // Otherwise assume DD/MM/YYYY format
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
};

export const isDateInRange = (date: Date, from: Date, to: Date): boolean => {
  return date >= from && date <= to;
};

// Type for valid Supabase tables
type SupabaseTableName = keyof Database['public']['Tables'];

// Map internal table names to Supabase table names
const mapInternalToSupabaseTable = (internalName: string): SupabaseTableName => {
  const tableMapping: Record<string, SupabaseTableName> = {
    'sdr_meta': 'Meta Pre Venda',
    'closer_meta': 'Meta Closer',
    'empresa_meta': 'Meta Empresa',
    'sdr_performance': 'Controle Pre Venda',
    'closer_performance': 'Controle Closer',
    'negociacoes': 'Negociacoes',
    'recomendacao': 'Recomendacao',
    'leadbroker': 'Leadbroker',
    'outbound': 'Outbound'
  } as Record<string, SupabaseTableName>;
  
  return tableMapping[internalName] || 'Negociacoes';
};

// Map internal table names to appropriate date column for filtering
const getDateColumnForTable = (tableName: string): string | null => {
  const dateColumnMapping: Record<string, string> = {
    'Controle Pre Venda': 'Data',
    'Controle Closer': 'Data', 
    'Negociacoes': 'DATA DA REUNIÃO',
    'Leadbroker': 'DATA DA COMPRA',
    'Recomendacao': 'DATA DA RECOMENDAÇÃO',
    'Outbound': 'DATA DO AGENDAMENTO'
  };
  
  return dateColumnMapping[tableName] || null;
};

// Modified to use Supabase for data sources
export const fetchFilteredData = async (
  internalTableName: string,
  dateRange: { from: Date, to: Date },
  additionalFilters?: Record<string, any>
) => {
  try {
    const supabaseTableName = mapInternalToSupabaseTable(internalTableName);
    
    // Start the query using type assertion for proper typing
    let query = supabase.from(supabaseTableName).select('*');
    
    // Add date range filters if applicable
    const dateColumn = getDateColumnForTable(supabaseTableName);
    
    // Add any additional filters
    if (additionalFilters) {
      Object.entries(additionalFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching data from Supabase table ${supabaseTableName}:`, error);
      throw error;
    }
    
    // Filter by date range in JS for now since different tables have different date formats
    // Later we can implement server-side filtering when date formats are standardized
    if (dateColumn && data) {
      return data.filter((row: any) => {
        if (!row[dateColumn]) return true; // Include rows without dates
        
        const rowDate = parseDate(row[dateColumn]);
        return isDateInRange(rowDate, dateRange.from, dateRange.to);
      });
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching data for ${internalTableName}:`, error);
    return [];
  }
};

// SDR related functions
export const fetchSdrMetaData = async () => {
  try {
    // Fetch from Meta Pre Venda table
    const data = await fetchFilteredData(
      'sdr_meta',
      { from: new Date(2020, 0, 1), to: new Date(2030, 11, 31) } // Wide date range to get all data
    );
    return data || [];
  } catch (error) {
    console.error('Error fetching SDR meta data:', error);
    return [];
  }
};

// Closer related functions
export const fetchCloserMetaData = async () => {
  try {
    // Fetch from Meta Closer table
    const data = await fetchFilteredData(
      'closer_meta',
      { from: new Date(2020, 0, 1), to: new Date(2030, 11, 31) } // Wide date range to get all data
    );
    return data || [];
  } catch (error) {
    console.error('Error fetching closer meta data:', error);
    return [];
  }
};

// Channel related functions
export const fetchNegociacoesData = async (
  dateRange: { from: Date, to: Date }
) => {
  try {
    const data = await fetchFilteredData('negociacoes', dateRange);
    return data || [];
  } catch (error) {
    console.error('Error fetching negociacoes data:', error);
    return [];
  }
};

export const fetchEmpresaMetaData = async () => {
  try {
    // Fetch from Meta Empresa table
    const data = await fetchFilteredData(
      'empresa_meta',
      { from: new Date(2020, 0, 1), to: new Date(2030, 11, 31) } // Wide date range to get all data
    );
    return data || [];
  } catch (error) {
    console.error('Error fetching empresa meta data:', error);
    return [];
  }
};
