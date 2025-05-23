
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
    // Process additionalFilters to remove 'all' values
    const cleanedFilters: Record<string, any> = {};
    
    if (additionalFilters) {
      Object.entries(additionalFilters).forEach(([key, value]) => {
        // Only add filter if it's not undefined, null, or 'all'
        if (value !== undefined && value !== null && value !== 'all') {
          cleanedFilters[key] = value;
        } else {
          console.log(`Removing '${key}' from filters because value is ${value}`);
        }
      });
    }
    
    if (Object.keys(cleanedFilters).length > 0) {
      console.log('Cleaned filters for negociacoes:', cleanedFilters);
    }

    // Log exact origin filter being used
    if (additionalFilters && additionalFilters.ORIGEM) {
      console.log(`DEBUG - Origin filter being applied: ${additionalFilters.ORIGEM}`);
    }

    // Fetch data using the primary date range (DATA DA CALL)
    const data = await fetchFilteredData('negociacoes', dateRange, cleanedFilters);
    console.log(`NegociacoesService: Fetched ${data?.length || 0} initial records`);
    
    // Debug origin data before applying closing date range
    if (data && data.length > 0) {
      const origins = [...new Set(data.map(item => item.ORIGEM))];
      console.log(`DEBUG - Origins before closing date filter: ${JSON.stringify(origins)}`);
      console.log(`DEBUG - Count by origin before closing filter:`, data.reduce((acc, item) => {
        acc[item.ORIGEM || 'undefined'] = (acc[item.ORIGEM || 'undefined'] || 0) + 1;
        return acc;
      }, {}));
    }
    
    // Apply closing date range filter if provided
    if (closingDateRange && closingDateRange.from) {
      const normalizedClosingDateRange = normalizeDateRange(closingDateRange);
      console.log(`Applying closing date filter: ${normalizedClosingDateRange.from.toISOString()} to ${normalizedClosingDateRange.to.toISOString()}`);
      
      const beforeFilter = data.length;
      const filteredByClosingDate = data.filter((row: any) => {
        // Skip items without closing date
        if (!row['DATA DO FEC.']) return false;
        
        try {
          // Parse the closing date using our improved parsing function
          const closingDate = parseDate(row['DATA DO FEC.']);
          const isInRange = isDateInRange(closingDate, normalizedClosingDateRange.from, normalizedClosingDateRange.to);
          return isInRange;
        } catch (error) {
          console.error(`Error filtering by closing date for row:`, row, error);
          return false;
        }
      });
      
      console.log(`After closing date filter: ${filteredByClosingDate.length} records (from ${beforeFilter})`);
      
      // Debug origin data after applying closing date range
      if (filteredByClosingDate.length > 0) {
        const origins = [...new Set(filteredByClosingDate.map(item => item.ORIGEM))];
        console.log(`DEBUG - Origins after closing date filter: ${JSON.stringify(origins)}`);
        console.log(`DEBUG - Count by origin after closing filter:`, filteredByClosingDate.reduce((acc, item) => {
          acc[item.ORIGEM || 'undefined'] = (acc[item.ORIGEM || 'undefined'] || 0) + 1;
          return acc;
        }, {}));
      }
      
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
