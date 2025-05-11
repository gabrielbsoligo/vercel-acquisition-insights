
// This service handles CSV file loading and parsing
import Papa from 'papaparse';

interface CsvLoadOptions {
  header?: boolean;
  skipEmptyLines?: boolean;
  dynamicTyping?: boolean;
}

export const loadCsvFile = async (
  filePath: string, 
  options: CsvLoadOptions = { header: true, skipEmptyLines: true, dynamicTyping: true }
): Promise<any[]> => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load CSV file: ${filePath}`);
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        ...options,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading CSV file:', error);
    throw error;
  }
};

// Define paths to CSV files - these would be updated to point to the actual file locations
export const CSV_PATHS = {
  SDR_PERFORMANCE: '/src/data/Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Controle de Performance Pré Venda.csv',
  SDR_META: '/src/data/Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Meta Pré Venda (1).csv',
  CLOSER_PERFORMANCE: '/src/data/Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Controle de Performance Closer.csv',
  NEGOCIACOES: '/src/data/Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Negociações BR.csv',
  CLOSER_META: '/src/data/Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Meta Closer.csv',
  EMPRESA_META: '/src/data/Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Meta Empresa.csv',
  LEAD_BROKER: '/src/data/Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - LeadBroker.csv',
  OUTBOUND: '/src/data/Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Outbound.csv',
  RECOMENDACAO: '/src/data/Fork to Vercel - 10_05 - Dash de Aquisição _ Ruston & Co. - Recomendação.csv',
};

// Utility function to parse date strings from CSV files
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
