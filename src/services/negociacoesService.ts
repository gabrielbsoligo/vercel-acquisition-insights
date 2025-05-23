
import { DateRange } from "react-day-picker";
import { fetchFilteredData } from './queryService';
import { normalizeDateRange, isDateInRange, parseDate } from './utils/dateUtils';

/**
 * Fetches negociacoes data based on date range
 * @param dateRange The date range to filter by
 * @returns Filtered negociacoes data
 */
export const fetchNegociacoesData = async (
  dateRange: { from: Date, to: Date },
  additionalFilters?: Record<string, any>,
  closingDateRange?: DateRange
) => {
  try {
    // Ensure any 'all' values are removed from filters
    const cleanedFilters = additionalFilters ? {...additionalFilters} : {};
    
    // Remove any 'all' values from filters as they should be treated as no filter
    Object.entries(cleanedFilters).forEach(([key, value]) => {
      if (value === 'all') {
        console.log(`Removing '${key}' from filters because value is 'all'`);
        delete cleanedFilters[key];
      }
    });
    
    if (Object.keys(cleanedFilters).length > 0) {
      console.log('Cleaned filters for negociacoes:', cleanedFilters);
    }

    // Fetch data using the primary date range (DATA DA CALL)
    const data = await fetchFilteredData('negociacoes', dateRange, cleanedFilters);
    console.log(`NegociacoesService: Fetched ${data?.length || 0} initial records`);
    
    // Apply closing date range filter if provided
    if (closingDateRange && closingDateRange.from) {
      const normalizedClosingDateRange = normalizeDateRange(closingDateRange);
      console.log(`Applying closing date filter: ${normalizedClosingDateRange.from.toISOString()} to ${normalizedClosingDateRange.to.toISOString()}`);
      
      const filteredByClosingDate = data.filter((row: any) => {
        // Skip items without closing date
        if (!row['DATA DO FEC.']) return false;
        
        try {
          // Parse the closing date using our improved parsing function
          const closingDate = parseDate(row['DATA DO FEC.']);
          const isInRange = isDateInRange(closingDate, normalizedClosingDateRange.from, normalizedClosingDateRange.to);
          
          if (isInRange) {
            return true;
          }
          return false;
        } catch (error) {
          console.error(`Error filtering by closing date for row:`, row, error);
          return false;
        }
      });
      
      console.log(`After closing date filter: ${filteredByClosingDate.length} records (from ${data.length})`);
      return filteredByClosingDate;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching negociacoes data:', error);
    return [];
  }
};

/**
 * Counts the number of negotiations by status
 * @param negotiations Array of negotiation objects
 * @returns Object with status counts
 */
export const countNegotiationsByStatus = (negotiations: any[]) => {
  const counts = {
    total: negotiations.length,
    ganhos: 0,
    perdidos: 0,
    negociacao: 0,
    followLongo: 0
  };
  
  negotiations.forEach((negotiation) => {
    const status = negotiation.STATUS?.toLowerCase() || '';
    
    if (status === 'ganho' || status === 'finalizado' || 
        status === 'contrato assinado' || status === 'contrato na rua') {
      counts.ganhos++;
    } else if (status === 'perdido') {
      counts.perdidos++;
    } else if (status === 'negociação') {
      counts.negociacao++;
    } else if (status === 'follow longo') {
      counts.followLongo++;
    }
  });
  
  return counts;
};

/**
 * Calculates metrics based on negotiations data
 * @param negotiations Array of negotiation objects
 * @returns Object with calculated metrics
 */
export const calculateNegotiationsMetrics = (negotiations: any[]) => {
  const statusCounts = countNegotiationsByStatus(negotiations);
  
  // Calculate total value of won deals
  const valorVendido = negotiations
    .filter((row) => 
      row.STATUS === 'Ganho' || 
      row.STATUS === 'Finalizado' || 
      row.STATUS === 'Contrato Assinado' || 
      row.STATUS === 'Contrato na Rua'
    )
    .reduce((sum, row) => sum + (row.VALOR || 0), 0);
  
  // Calculate conversion rate
  const taxaConversao = statusCounts.total > 0 
    ? (statusCounts.ganhos / statusCounts.total) * 100 
    : 0;
  
  // Calculate average ticket
  const ticketMedio = statusCounts.ganhos > 0 
    ? valorVendido / statusCounts.ganhos 
    : 0;
  
  // Calculate average sales cycle
  const vendasFinalizadas = negotiations.filter((row) => 
    ((row.STATUS === 'Ganho' || 
      row.STATUS === 'Finalizado' || 
      row.STATUS === 'Contrato Assinado' || 
      row.STATUS === 'Contrato na Rua') || 
      row.STATUS === 'Perdido') && 
    row['CURVA DIAS'] !== null && 
    row['CURVA DIAS'] !== undefined
  );
  
  const totalDiasCiclo = vendasFinalizadas.reduce((sum, row) => sum + (row['CURVA DIAS'] || 0), 0);
  const cicloMedio = vendasFinalizadas.length > 0 ? totalDiasCiclo / vendasFinalizadas.length : 0;
  
  return {
    totalNegociacoes: statusCounts.total,
    ganhos: statusCounts.ganhos,
    perdidos: statusCounts.perdidos,
    emNegociacao: statusCounts.negociacao + statusCounts.followLongo,
    valorVendido,
    taxaConversao,
    ticketMedio,
    cicloMedio
  };
};
