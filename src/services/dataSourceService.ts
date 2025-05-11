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
        return [];
      }
      
      return data || [];
    } else {
      // Fallback to CSV files if Supabase is not configured
      console.warn('Falling back to CSV data as Supabase is not configured.');
      
      // Implement CSV fallback logic here
      // This would need to be customized based on your CSV structure
      const response = await fetch(`/src/data/${tableName}.csv`);
      const csvText = await response.text();
      
      const { data } = Papa.parse(csvText, { header: true });
      return data || [];
    }
  } catch (error) {
    console.error(`Error fetching data for ${tableName}:`, error);
    return [];
  }
};

// SDR related functions
export const fetchSdrPerformanceData = async (
  dateRange: { from: Date, to: Date },
  selectedSdr?: string
) => {
  try {
    const data = await fetchFilteredData(
      'sdr_performance',
      dateRange,
      selectedSdr && selectedSdr !== 'all' ? { SDR: selectedSdr } : undefined
    );
    return data || [];
  } catch (error) {
    console.error('Error fetching SDR performance data:', error);
    return [];
  }
};

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
export const fetchCloserPerformanceData = async (
  dateRange: { from: Date, to: Date },
  selectedCloser?: string
) => {
  try {
    const data = await fetchFilteredData(
      'closer_performance',
      dateRange,
      selectedCloser && selectedCloser !== 'all' ? { Closer: selectedCloser } : undefined
    );
    return data || [];
  } catch (error) {
    console.error('Error fetching closer performance data:', error);
    return [];
  }
};

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
