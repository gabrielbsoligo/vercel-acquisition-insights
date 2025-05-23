import { DateRange } from "react-day-picker";
import { fetchFilteredData } from "./queryService";
import { normalizeDateRange, isDateInRange } from './utils/dateUtils';
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchSdrMetaData,
  fetchCloserMetaData,
  fetchEmpresaMetaData
} from './metaService';
import { parseDate } from './utils/dateUtils';
import { fetchNegociacoesData } from './negociacoesService';

// Fetch closer KPI data using Negociacoes table as primary source for all metrics
export const fetchCloserKpiData = async (
  kpiType: string, 
  dateRange?: DateRange, 
  additionalFilters?: Record<string, any>,
  closingDateRange?: DateRange
) => {
  try {
    console.log(`Fetching ${kpiType} KPI data with filters:`, additionalFilters);
    const normalizedDateRange = normalizeDateRange(dateRange);
    console.log('Normalized date range for KPI fetch:', normalizedDateRange);
    
    // Debug origin filter if present
    if (additionalFilters && additionalFilters.ORIGEM) {
      console.log(`DEBUG KPI - Origin filter value: "${additionalFilters.ORIGEM}"`);
    }
    
    // Fetch Negociacoes data for all metrics
    const negociacoesData = await fetchNegociacoesData(
      normalizedDateRange,
      additionalFilters,
      closingDateRange
    );
    
    console.log(`KPI Fetch: Got ${negociacoesData.length} rows from negociacoes after all filters`);
    
    // Debug origins in the fetched data
    if (negociacoesData && negociacoesData.length > 0) {
      const origins = [...new Set(negociacoesData.map(item => item.ORIGEM))];
      console.log(`DEBUG KPI - Origins in data: ${JSON.stringify(origins)}`);
      console.log(`DEBUG KPI - Count by origin:`, negociacoesData.reduce((acc, item) => {
        acc[item.ORIGEM || 'undefined'] = (acc[item.ORIGEM || 'undefined'] || 0) + 1;
        return acc;
      }, {}));
    }
    
    if (negociacoesData.length > 0) {
      console.log('KPI Fetch: First record:', negociacoesData[0]);
    }
    
    // Fetch meta data
    const closerMetaData = await fetchCloserMetaData();
    console.log(`Fetched ${closerMetaData.length} rows from meta data`);

    // Calculate based on KPI type
    let valorRealizado = 0;
    
    switch (kpiType) {
      case 'reunioesRealizadas':
        // Count all negotiations as initiated deals (reunioes realizadas)
        valorRealizado = negociacoesData.length;
        console.log(`KPI ${kpiType} calculation: counting all ${negociacoesData.length} negotiations`);
        break;
        
      case 'vendas':
        // Sales are tracked in the Negociacoes table
        valorRealizado = negociacoesData.filter((row: any) => 
          row.STATUS === 'Ganho' || 
          row.STATUS === 'Finalizado' || 
          row.STATUS === 'Contrato Assinado' || 
          row.STATUS === 'Contrato na Rua'
        ).length;
        console.log(`KPI ${kpiType} calculation: found ${valorRealizado} vendas with status "Ganho/Finalizado/Contrato Assinado/Contrato na Rua"`);
        break;
        
      case 'taxaConversao': {
        // Use all negotiations as the total
        const totalReunioes = negociacoesData.length;
          
        // Sales from Negociacoes  
        const totalVendas = negociacoesData.filter((row: any) => 
          row.STATUS === 'Ganho' || 
          row.STATUS === 'Finalizado' || 
          row.STATUS === 'Contrato Assinado' || 
          row.STATUS === 'Contrato na Rua'
        ).length;
          
        valorRealizado = totalReunioes > 0 ? (totalVendas / totalReunioes) * 100 : 0;
        console.log(`KPI ${kpiType} calculation: ${totalVendas} vendas / ${totalReunioes} reunioes = ${valorRealizado.toFixed(2)}%`);
        break;
      }
      
      case 'indicacoesColetadas':
        // Count negotiation entries with ORIGEM = "INDICAÇÃO"
        valorRealizado = negociacoesData.filter((row: any) => {
          // Make sure ORIGEM exists and do a case-insensitive comparison
          const origem = row.ORIGEM ? String(row.ORIGEM).toUpperCase() : '';
          const result = origem === 'INDICAÇÃO';
          return result;
        }).length;
        console.log(`KPI ${kpiType} calculation: found ${valorRealizado} with ORIGEM = "INDICAÇÃO"`);
        break;
        
      case 'valorVendido':
        // Get sum of VALOR for won deals
        valorRealizado = negociacoesData
          .filter((row: any) => 
            row.STATUS === 'Ganho' || 
            row.STATUS === 'Finalizado' || 
            row.STATUS === 'Contrato Assinado' || 
            row.STATUS === 'Contrato na Rua'
          )
          .reduce((sum: number, row: any) => sum + (row.VALOR || 0), 0);
        console.log(`KPI ${kpiType} calculation: sum of VALOR for won deals = ${valorRealizado}`);
        break;
        
      case 'ticketMedio': {
        // Calculate average ticket for won deals
        const vendasGanhas = negociacoesData.filter((row: any) => 
          row.STATUS === 'Ganho' || 
          row.STATUS === 'Finalizado' || 
          row.STATUS === 'Contrato Assinado' || 
          row.STATUS === 'Contrato na Rua'
        );
        const totalVendido = vendasGanhas.reduce((sum: number, row: any) => sum + (row.VALOR || 0), 0);
        valorRealizado = vendasGanhas.length > 0 ? totalVendido / vendasGanhas.length : 0;
        console.log(`KPI ${kpiType} calculation: ${totalVendido} / ${vendasGanhas.length} vendas = ${valorRealizado}`);
        break;
      }
      
      case 'cicloVendas': {
        // Calculate average sales cycle for won deals
        const vendasFinalizadas = negociacoesData.filter((row: any) => 
          (row.STATUS === 'Ganho' || 
          row.STATUS === 'Finalizado' || 
          row.STATUS === 'Contrato Assinado' || 
          row.STATUS === 'Contrato na Rua') && 
          row['CURVA DIAS'] !== null && 
          row['CURVA DIAS'] !== undefined
        );
        const totalDiasCiclo = vendasFinalizadas.reduce((sum: number, row: any) => sum + (row['CURVA DIAS'] || 0), 0);
        valorRealizado = vendasFinalizadas.length > 0 ? totalDiasCiclo / vendasFinalizadas.length : 0;
        console.log(`KPI ${kpiType} calculation: ${totalDiasCiclo} dias / ${vendasFinalizadas.length} vendas = ${valorRealizado}`);
        break;
      }
      
      default:
        valorRealizado = 0;
    }

    // Get meta from CLOSER_META data
    let meta = 0;
    const fromMonth = normalizedDateRange.from.getMonth() + 1; // Add 1 because JS months are 0-indexed
    const fromYear = normalizedDateRange.from.getFullYear();
    
    // Map KPI types to meta types
    const metaTypeMapping: Record<string, string> = {
      'reunioesRealizadas': 'Número de negócios iniciados',
      'vendas': 'Vendas',
      'taxaConversao': 'Conversão',
      'indicacoesColetadas': 'Indicações',
      'valorVendido': 'Receita',
      'ticketMedio': 'TKM',
      'cicloVendas': 'Curva Fechamento'
    };
    
    const metaType = metaTypeMapping[kpiType];
    
    if (metaType) {
      const filteredMetaData = closerMetaData.filter((row: any) => {
        if (!row.Mês) return false;
        
        const rowDate = parseDate(row.Mês);
        const rowMonth = rowDate.getMonth() + 1;
        const rowYear = rowDate.getFullYear();
        
        const matchesDate = rowMonth === fromMonth && rowYear === fromYear;
        const matchesType = row.Tipo === metaType;
        
        // Match closer if specified in additionalFilters
        let matchesCloser = true;
        if (additionalFilters && additionalFilters.CLOSER) {
          matchesCloser = row.Closer === additionalFilters.CLOSER;
        }
        
        return matchesDate && matchesType && matchesCloser;
      });
      
      meta = filteredMetaData.reduce((sum: number, row: any) => sum + (row.Valor || 0), 0);
      
      console.log(`Meta for ${kpiType} (${metaType}) in ${fromMonth}/${fromYear}: ${meta}`);
      if (filteredMetaData.length > 0) {
        console.log('Meta data sample:', filteredMetaData[0]);
      }
    }

    // Calculate percentage of completion
    const percentComplete = meta > 0 ? (valorRealizado / meta) * 100 : 0;

    console.log(`KPI ${kpiType} calculated:`, { valorRealizado, meta, percentComplete });
    return {
      valorRealizado,
      meta,
      percentComplete
    };
  } catch (error) {
    console.error(`Error fetching ${kpiType} closer KPI data:`, error);
    return {
      valorRealizado: 0,
      meta: 0,
      percentComplete: 0
    };
  }
};

// Fetch closer performance data for charts - Using only negociacoes table now
export const fetchCloserPerformanceData = async (
  dateRange?: DateRange,
  additionalFilters?: Record<string, any>,
  closingDateRange?: DateRange
) => {
  try {
    // Ensure we have a valid date range
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    console.log('Performance data - Normalized date range:', normalizedDateRange);
    console.log('Performance data - Using filters:', additionalFilters);
    
    // Fetch negotiations data with filters including closingDateRange
    const negociacoesData = await fetchNegociacoesData(
      normalizedDateRange,
      additionalFilters,
      closingDateRange
    );
    
    console.log(`Fetched ${negociacoesData.length} rows from negociacoes after all filters`);
    
    // Get unique closers from dataset
    const closersFromNegociacoes = Array.from(new Set(negociacoesData.map((row: any) => row.CLOSER))).filter(Boolean);
    console.log('Unique closers from filtered data:', closersFromNegociacoes);
    
    // Combine unique closers
    const closers = closersFromNegociacoes;
    
    // If a specific closer is selected and it's not in the filtered data, add it
    if (additionalFilters?.CLOSER && !closers.includes(additionalFilters.CLOSER)) {
      closers.push(additionalFilters.CLOSER);
    }
    
    // Calculate metrics for each closer
    const closerPerformance = closers.map((closer: string) => {
      // All negotiations for this closer
      const closerNegociations = negociacoesData.filter((row: any) => row.CLOSER === closer);
      console.log(`Closer ${closer}: ${closerNegociations.length} negotiations`);
      
      // Count all negotiations as "reunioesRealizadas"
      const reunioesRealizadas = closerNegociations.length;
      
      // Count won deals
      const vendas = closerNegociations.filter((row: any) => 
        row.STATUS === 'Ganho' || 
        row.STATUS === 'Finalizado' || 
        row.STATUS === 'Contrato Assinado' || 
        row.STATUS === 'Contrato na Rua'
      ).length;
      
      // Count lost deals
      const negociosPerdidos = closerNegociations.filter((row: any) => 
        row.STATUS === 'Perdido'
      ).length;
        
      // Calculate conversion rate
      const taxaConversao = reunioesRealizadas > 0 
        ? (vendas / reunioesRealizadas) * 100 
        : 0;
        
      // Count indications (negotiations with ORIGEM = "INDICAÇÃO")
      const indicacoesColetadas = closerNegociations.filter((row: any) => 
        (row.ORIGEM || '').toUpperCase() === 'INDICAÇÃO'
      ).length;
      
      // Calculate total value sold
      const valorVendido = closerNegociations
        .filter((row: any) => 
          row.STATUS === 'Ganho' || 
          row.STATUS === 'Finalizado' || 
          row.STATUS === 'Contrato Assinado' || 
          row.STATUS === 'Contrato na Rua'
        )
        .reduce((sum: number, row: any) => sum + (row.VALOR || 0), 0);
      
      // Calculate ticket average
      const ticketMedio = vendas > 0 ? valorVendido / vendas : 0;
      
      // Calculate sales cycle average
      const negociosFinalizados = closerNegociations.filter((row: any) => 
        ((row.STATUS === 'Ganho' || 
        row.STATUS === 'Finalizado' || 
        row.STATUS === 'Contrato Assinado' || 
        row.STATUS === 'Contrato na Rua') || 
        row.STATUS === 'Perdido') && 
        row['CURVA DIAS'] !== null && 
        row['CURVA DIAS'] !== undefined
      );
      
      const totalDiasCiclo = negociosFinalizados.reduce((sum: number, row: any) => sum + (row['CURVA DIAS'] || 0), 0);
      const cicloMedio = negociosFinalizados.length > 0 ? totalDiasCiclo / negociosFinalizados.length : 0;
      
      return {
        closerName: closer,
        reunioesRealizadas,
        vendas,
        negociosPerdidos,
        taxaConversao,
        indicacoesColetadas,
        valorVendido,
        ticketMedio,
        cicloMedio
      };
    });
    
    // Add total for all closers
    const totalReunioesRealizadas = closerPerformance.reduce((sum, closer) => sum + closer.reunioesRealizadas, 0);
    const totalVendas = closerPerformance.reduce((sum, closer) => sum + closer.vendas, 0);
    const totalNegociosPerdidos = closerPerformance.reduce((sum, closer) => sum + closer.negociosPerdidos, 0);
    const totalTaxaConversao = totalReunioesRealizadas > 0 
      ? (totalVendas / totalReunioesRealizadas) * 100 
      : 0;
    const totalIndicacoesColetadas = closerPerformance.reduce((sum, closer) => sum + closer.indicacoesColetadas, 0);
    const totalValorVendido = closerPerformance.reduce((sum, closer) => sum + closer.valorVendido, 0);
    const totalTicketMedio = totalVendas > 0 ? totalValorVendido / totalVendas : 0;
    
    // For cycle average, calculate weighted average
    const totalCicloMedio = closerPerformance.reduce((sum, closer) => {
      // Only include closers with finalized deals
      if ((closer.vendas + closer.negociosPerdidos) > 0) {
        return sum + (closer.cicloMedio * (closer.vendas + closer.negociosPerdidos));
      }
      return sum;
    }, 0) / (totalVendas + totalNegociosPerdidos) || 0;
    
    closerPerformance.push({
      closerName: 'Total Equipe',
      reunioesRealizadas: totalReunioesRealizadas,
      vendas: totalVendas,
      negociosPerdidos: totalNegociosPerdidos,
      taxaConversao: totalTaxaConversao,
      indicacoesColetadas: totalIndicacoesColetadas,
      valorVendido: totalValorVendido,
      ticketMedio: totalTicketMedio,
      cicloMedio: totalCicloMedio
    });
    
    console.log('Performance data calculated for closers:', closerPerformance.map(c => c.closerName));
    return closerPerformance;
  } catch (error) {
    console.error('Error fetching closer performance data:', error);
    return [];
  }
};

// Function for sales funnel data
export const fetchCloserSalesFunnelData = async (
  dateRange?: DateRange,
  additionalFilters?: Record<string, any>,
  closingDateRange?: DateRange
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    console.log('Fetching sales funnel data with filters:', additionalFilters);
      
    // Fetch Negociacoes data with filters including closingDateRange
    const negociacoesData = await fetchNegociacoesData(
      normalizedDateRange,
      additionalFilters,
      closingDateRange
    );
    
    console.log(`Fetched ${negociacoesData.length} rows from negociacoes for funnel after all filters`);
    
    // Count by funnel stage
    const iniciados = negociacoesData.length;
    const emNegociacao = negociacoesData.filter((row: any) => 
      row.STATUS === 'Negociação' || row.STATUS === 'Follow Longo').length;
    
    const ganhos = negociacoesData.filter((row: any) => 
      row.STATUS === 'Ganho' || 
      row.STATUS === 'Finalizado' || 
      row.STATUS === 'Contrato Assinado' || 
      row.STATUS === 'Contrato na Rua'
    ).length;
    
    const perdidos = negociacoesData.filter((row: any) => row.STATUS === 'Perdido').length;
    
    // Create funnel data array
    return [
      { etapa: 'Oportunidades Iniciadas', valor: iniciados },
      { etapa: 'Em Negociação', valor: emNegociacao },
      { etapa: 'Ganhos', valor: ganhos },
      { etapa: 'Perdidos', valor: perdidos }
    ];
  } catch (error) {
    console.error('Error fetching sales funnel data:', error);
    return [];
  }
};

// Function for loss reasons data
export const fetchCloserLossReasonsData = async (
  dateRange?: DateRange,
  additionalFilters?: Record<string, any>,
  closingDateRange?: DateRange
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch Negociacoes data with filters including closingDateRange
    const negociacoesData = await fetchNegociacoesData(
      normalizedDateRange,
      additionalFilters,
      closingDateRange
    );
    
    // Filter only lost deals
    const perdidos = negociacoesData.filter((row: any) => row.STATUS === 'Perdido');
    
    // Group by loss reason
    const motivosCount: Record<string, number> = {};
    
    perdidos.forEach((row: any) => {
      const motivo = row['MOTIVOS DE PERDA'] || 'Não informado';
      motivosCount[motivo] = (motivosCount[motivo] || 0) + 1;
    });
    
    // Convert to array and sort by frequency
    const motivosArray = Object.entries(motivosCount)
      .map(([motivoPerda, quantidade]) => ({ motivoPerda, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);
    
    // Calculate cumulative percentages
    const total = motivosArray.reduce((sum, item) => sum + item.quantidade, 0);
    let acumulado = 0;
    
    return motivosArray.map(item => {
      acumulado += total > 0 ? (item.quantidade / total) * 100 : 0;
      return {
        motivoPerda: item.motivoPerda,
        quantidade: item.quantidade,
        percentualAcumulado: Math.round(acumulado)
      };
    });
  } catch (error) {
    console.error('Error fetching loss reasons data:', error);
    return [];
  }
};

// Function for sales cycle data
export const fetchCloserSalesCycleData = async (
  dateRange?: DateRange,
  additionalFilters?: Record<string, any>,
  closingDateRange?: DateRange
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch Negociacoes data with filters including closingDateRange
    const negociacoesData = await fetchNegociacoesData(
      normalizedDateRange,
      additionalFilters,
      closingDateRange
    );
    
    // Define cycle ranges and filter finalized deals
    const faixas = {
      '0-7 dias': 0,
      '8-14 dias': 0,
      '15-30 dias': 0,
      '31-60 dias': 0,
      '61-90 dias': 0,
      '>90 dias': 0
    };
    
    // Filter only finalized deals with cycle defined
    const negociosFinalizados = negociacoesData.filter((row: any) => 
      ((row.STATUS === 'Ganho' || 
       row.STATUS === 'Finalizado' || 
       row.STATUS === 'Contrato Assinado' || 
       row.STATUS === 'Contrato na Rua') || 
       row.STATUS === 'Perdido') && 
      row['CURVA DIAS'] !== null && 
      row['CURVA DIAS'] !== undefined
    );
    
    // Classify by cycle range
    negociosFinalizados.forEach((row: any) => {
      const ciclo = row['CURVA DIAS'];
      if (ciclo <= 7) {
        faixas['0-7 dias']++;
      } else if (ciclo <= 14) {
        faixas['8-14 dias']++;
      } else if (ciclo <= 30) {
        faixas['15-30 dias']++;
      } else if (ciclo <= 60) {
        faixas['31-60 dias']++;
      } else if (ciclo <= 90) {
        faixas['61-90 dias']++;
      } else {
        faixas['>90 dias']++;
      }
    });
    
    // Convert to array
    return Object.entries(faixas).map(([faixaCiclo, quantidade]) => ({
      faixaCiclo,
      quantidade
    }));
  } catch (error) {
    console.error('Error fetching sales cycle data:', error);
    return [];
  }
};

/**
 * Fetches negotiation data based on various filters
 */
export const fetchNegotiations = async (
  dateRange: DateRange | undefined,
  selectedCloser: string,
  selectedOrigin: string,
  selectedStatus: string,
  selectedTemperature: string,
  closingDateRange: DateRange | undefined
) => {
  try {
    // Build additionalFilters properly
    const additionalFilters: Record<string, any> = {};
    
    // Only add each filter if it's not 'all'
    if (selectedCloser !== 'all') {
      additionalFilters.CLOSER = selectedCloser;
    }
    
    if (selectedOrigin !== 'all') {
      additionalFilters.ORIGEM = selectedOrigin;
    }
    
    if (selectedStatus !== 'all') {
      additionalFilters.STATUS = selectedStatus;
    }
    
    if (selectedTemperature !== 'all') {
      additionalFilters.TEMPERATURA = selectedTemperature;
    }
    
    console.log("Fetching negotiations with filters:", additionalFilters);
    
    // Fetch negotiations with filters
    const negotiations = await fetchNegociacoesData(
      normalizeDateRange(dateRange), 
      additionalFilters,
      closingDateRange
    );
    
    console.log(`Fetched ${negotiations.length} rows from negociacoes after all filters`);
    
    return negotiations;
  } catch (error) {
    console.error('Error fetching negotiations:', error);
    return [];
  }
};
