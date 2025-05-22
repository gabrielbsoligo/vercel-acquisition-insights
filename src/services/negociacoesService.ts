
import { DateRange } from "react-day-picker";
import { fetchFilteredData } from './queryService';
import { normalizeDateRange, isDateInRange } from './utils/dateUtils';

/**
 * Fetches negociacoes data based on date range
 * @param dateRange The date range to filter by
 * @returns Filtered negociacoes data
 */
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
