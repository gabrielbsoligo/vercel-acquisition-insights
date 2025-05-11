
// This service will handle CSV file loading and parsing
// In a real application, this would be used to load the CSV files from a specific location

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
  SDR_PERFORMANCE: '/data/Controle de Performance Pré Venda.csv',
  SDR_META: '/data/Meta Pré Venda.csv',
  CLOSER_PERFORMANCE: '/data/Controle de Performance Closer.csv',
  NEGOCIACOES: '/data/Negociações BR.csv',
  CLOSER_META: '/data/Meta Closer.csv',
  EMPRESA_META: '/data/Meta Empresa.csv',
  LEAD_BROKER: '/data/LeadBroker.csv',
  OUTBOUND: '/data/Outbound.csv',
  RECOMENDACAO: '/data/Recomendação.csv',
};
