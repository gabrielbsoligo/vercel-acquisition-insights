
import { Database } from '@/integrations/supabase/types';

// Define the strict type for Supabase table names
export type SupabaseTableName = keyof Database['public']['Tables'];

/**
 * Maps internal table names to Supabase table names
 * @param internalName The internal table name used in the application
 * @returns The corresponding Supabase table name
 */
export const mapInternalToSupabaseTable = (internalName: string): SupabaseTableName => {
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

/**
 * Gets the appropriate date column for a specific table and date type
 * @param tableName The Supabase table name
 * @param dateType Optional parameter to specify which date column to use (start, end, or default)
 * @returns The date column for filtering or null if none
 */
export const getDateColumnForTable = (
  tableName: SupabaseTableName, 
  dateType?: 'start' | 'end'
): string | null => {
  // Date columns for start dates (default)
  const startDateColumnMapping: Record<SupabaseTableName, string | null> = {
    'Controle Pre Venda': 'Data',
    'Controle Closer': 'Data', 
    'Negociacoes': 'DATA DA CALL',
    'Leadbroker': 'DATA DA COMPRA',
    'Recomendacao': 'DATA DA RECOMENDAÇÃO',
    'Outbound': 'DATA DO AGENDAMENTO',
    'Meta Pre Venda': 'Mês',
    'Meta Closer': 'Mês',
    'Meta Empresa': 'Mês'
  };
  
  // Date columns for end dates
  const endDateColumnMapping: Record<SupabaseTableName, string | null> = {
    'Controle Pre Venda': null,
    'Controle Closer': null, 
    'Negociacoes': 'DATA DO FEC.',
    'Leadbroker': null,
    'Recomendacao': null,
    'Outbound': null,
    'Meta Pre Venda': null,
    'Meta Closer': null,
    'Meta Empresa': null
  };
  
  return dateType === 'end' ? endDateColumnMapping[tableName] : startDateColumnMapping[tableName];
};
