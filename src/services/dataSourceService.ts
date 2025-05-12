
import supabase from './supabaseService';
import { Database } from '@/integrations/supabase/types';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import Papa from 'papaparse';

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

// Define the strict type for Supabase table names
type SupabaseTableName = keyof Database['public']['Tables'];

// Map internal table names to Supabase table names with strict typing
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
  };
  
  const mappedTable = tableMapping[internalName];
  if (!mappedTable) {
    throw new Error(`Unknown table name: ${internalName}`);
  }
  
  return mappedTable;
};

// Map internal table names to appropriate date column for filtering
const getDateColumnForTable = (tableName: SupabaseTableName): string | null => {
  const dateColumnMapping: Record<SupabaseTableName, string | null> = {
    'Controle Pre Venda': 'Data',
    'Controle Closer': 'Data', 
    'Negociacoes': 'DATA DA CALL',
    'Leadbroker': 'DATA DA COMPRA',
    'Recomendacao': 'DATA DA RECOMENDAÇÃO',
    'Outbound': 'DATA DO AGENDAMENTO',
    'Meta Pre Venda': null,
    'Meta Closer': null,
    'Meta Empresa': null
  };
  
  return dateColumnMapping[tableName];
};

// Format date to ISO string for Supabase query (YYYY-MM-DD)
const formatDateForQuery = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Use a workaround to avoid TypeScript's deep instantiation issue
// by using type any for the intermediate query builder
export const fetchFilteredData = async (
  internalTableName: string,
  dateRange: { from: Date, to: Date },
  additionalFilters?: Record<string, any>
): Promise<any[]> => {
  try {
    const supabaseTableName = mapInternalToSupabaseTable(internalTableName);
    
    // Start with a basic query
    let query: any = supabase
      .from(supabaseTableName)
      .select('*');
    
    // Add date range filters on the server side
    const dateColumn = getDateColumnForTable(supabaseTableName);
    
    if (dateColumn) {
      // Format dates to ISO strings (YYYY-MM-DD)
      const fromDate = formatDateForQuery(dateRange.from);
      const toDate = formatDateForQuery(dateRange.to);
      
      query = query
        .gte(dateColumn, fromDate)
        .lte(dateColumn, toDate);
    }
    
    // Add any additional filters
    if (additionalFilters) {
      Object.entries(additionalFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Check if the key includes special operators (_gte, _lte, etc.)
          if (key.includes('_gte')) {
            const actualKey = key.split('_gte')[0];
            query = query.gte(actualKey, value);
          } else if (key.includes('_lte')) {
            const actualKey = key.split('_lte')[0];
            query = query.lte(actualKey, value);
          } else if (key.includes('_gt')) {
            const actualKey = key.split('_gt')[0];
            query = query.gt(actualKey, value);
          } else if (key.includes('_lt')) {
            const actualKey = key.split('_lt')[0];
            query = query.lt(actualKey, value);
          } else if (key.includes('_neq')) {
            const actualKey = key.split('_neq')[0];
            query = query.neq(actualKey, value);
          } else if (key.includes('_in')) {
            const actualKey = key.split('_in')[0];
            if (Array.isArray(value)) {
              query = query.in(actualKey, value);
            }
          } else {
            query = query.eq(key, value);
          }
        }
      });
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching data from Supabase table ${supabaseTableName}:`, error);
      throw error;
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
