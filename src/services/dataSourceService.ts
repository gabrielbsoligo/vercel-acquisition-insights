
import supabase from './supabaseService';
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

// Modified to handle both CSV and Supabase data sources
export const fetchFilteredData = async (
  tableName: string,
  dateRange: { from: Date, to: Date },
  additionalFilters?: Record<string, any>
) => {
  try {
    // Check if Supabase is properly configured
    const isSupabaseConfigured = 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_ANON_KEY;
      
    // Use Supabase if configured
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from(tableName).select('*');
        
        // Add date range filters if applicable
        // Note: This assumes your table has a 'date' or similar column
        // Adjust the column name based on your actual schema
        
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
          console.error('Error fetching data from Supabase:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.warn('Error with Supabase query, falling back to CSV:', error);
        return fetchCSVData(tableName);
      }
    } else {
      // Fallback to CSV files if Supabase is not configured
      console.warn('Falling back to CSV data as Supabase is not configured.');
      return fetchCSVData(tableName);
    }
  } catch (error) {
    console.error(`Error fetching data for ${tableName}:`, error);
    return [];
  }
};

// Helper function to fetch data from CSV files
const fetchCSVData = async (tableName: string) => {
  try {
    const response = await fetch(`/src/data/${mapTableNameToFile(tableName)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV file for ${tableName}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    const { data } = Papa.parse(csvText, { header: true });
    return data || [];
  } catch (error) {
    console.error(`Error fetching CSV data for ${tableName}:`, error);
    return [];
  }
};

// Map table names to CSV file paths
const mapTableNameToFile = (tableName: string): string => {
  // Map Supabase table names to CSV file names
  const mapping: Record<string, string> = {
    'sdr_meta': 'Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Meta Pré Venda (1).csv',
    'closer_meta': 'Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Meta Closer.csv',
    'empresa_meta': 'Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Meta Empresa.csv',
    'sdr_performance': 'Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Outbound.csv',
    'closer_performance': 'Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Controle de Performance Closer.csv',
    'negociacoes': 'Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Negociações BR.csv',
    'recomendacao': 'Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Recomendação.csv',
    'leadbroker': 'Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - LeadBroker.csv',
  };

  return mapping[tableName] || `${tableName}.csv`;
};

// SDR related functions
export const fetchSdrMetaData = async () => {
  try {
    // Assuming SDR meta data is stored in a table/file named 'sdr_meta'
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
    // Assuming closer meta data is stored in a table/file named 'closer_meta'
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
    // Assuming empresa meta data is stored in a table/file named 'empresa_meta'
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
