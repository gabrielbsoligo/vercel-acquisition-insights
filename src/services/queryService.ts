
import { supabase } from '@/integrations/supabase/client';
import { SupabaseTableName, mapInternalToSupabaseTable, getDateColumnForTable } from './utils/tableMapping';
import { formatDateForQuery } from './utils/dateUtils';

/**
 * Fetches filtered data from Supabase based on various conditions
 * @param internalTableName The internal table name used in the application
 * @param dateRange The date range to filter by
 * @param additionalFilters Additional filters to apply
 * @param dateType Optional parameter to specify which date column to use (start, end, or default)
 * @returns The filtered data as array
 */
export const fetchFilteredData = async (
  internalTableName: string,
  dateRange: { from: Date, to: Date },
  additionalFilters?: Record<string, any>,
  dateType?: 'start' | 'end'
): Promise<any[]> => {
  try {
    const supabaseTableName = mapInternalToSupabaseTable(internalTableName);
    
    // Start with a basic query
    let query: any = supabase
      .from(supabaseTableName)
      .select('*');
    
    // Add date range filters on the server side
    const dateColumn = getDateColumnForTable(supabaseTableName, dateType);
    
    console.log(`QUERY_SERVICE_MAP: Mapeamento para "${internalTableName}": Tabela Supabase="${supabaseTableName}", Coluna Data="${dateColumn}" (tipo: ${dateType || 'default'})`);
    console.log(`Fetching data from table: ${supabaseTableName}`);
    console.log(`Using date column: ${dateColumn || 'No date column'} (type: ${dateType || 'default'})`);
    console.log(`Date range: ${dateRange.from.toISOString()} to ${dateRange.to.toISOString()}`);
    
    if (dateColumn) {
      // Format dates to ISO strings (YYYY-MM-DD)
      const fromDate = formatDateForQuery(dateRange.from);
      const toDate = formatDateForQuery(dateRange.to);
      
      console.log(`Formatted date range for query: ${fromDate} to ${toDate}`);
      console.log(`SQL filter will be: ${dateColumn} >= '${fromDate}' AND ${dateColumn} <= '${toDate}'`);
      
      query = query
        .gte(dateColumn, fromDate)
        .lte(dateColumn, toDate);
    } else {
      console.log('No date column found for filtering - will return all data');
    }
    
    // Add any additional filters
    if (additionalFilters) {
      console.log('Additional filters:', additionalFilters);
      Object.entries(additionalFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          console.log(`Applying filter: ${key} = ${value}`);
          
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
    
    console.log(`Fetched ${data?.length || 0} records from ${supabaseTableName}`);
    if (data && data.length > 0) {
      console.log('Sample data:', data[0]);
    } else {
      console.log('No data returned from query');
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching data for ${internalTableName}:`, error);
    return [];
  }
};
