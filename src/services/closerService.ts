import { DateRange } from "react-day-picker";
import { fetchFilteredData } from "./queryService";
import { normalizeDateRange } from "./utils/dateUtils";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchSdrMetaData,
  fetchCloserMetaData,
  fetchEmpresaMetaData
} from './metaService';
import { parseDate, isDateInRange } from './utils/dateUtils';

// Fetch closer KPI data using Negociacoes table as primary source
export const fetchCloserKpiData = async (
  kpiType: string, 
  dateRange?: DateRange, 
  selectedCloser?: string
) => {
  try {
    console.log(`Fetching ${kpiType} KPI data for closer: ${selectedCloser || 'all'}`);
    const normalizedDateRange = normalizeDateRange(dateRange);
    console.log('Normalized date range:', normalizedDateRange);
    
    // Fetch Negociacoes data for sales metrics - explicitly use 'DATA DA CALL'
    const negociacoesData = await fetchFilteredData(
      'negociacoes', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { CLOSER: selectedCloser } : undefined,
      'start' // Explicitly use 'start' date column (DATA DA CALL)
    );
    
    console.log(`Fetched ${negociacoesData.length} rows from negociacoes`);
    
    // Fetch Closer Performance data for meeting metrics
    const closerPerformanceData = await fetchFilteredData(
      'closer_performance', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { Closer: selectedCloser } : undefined
    );
    
    console.log(`Fetched ${closerPerformanceData.length} rows from closer_performance`);
    
    // Fetch meta data
    const closerMetaData = await fetchCloserMetaData();
    console.log(`Fetched ${closerMetaData.length} rows from meta data`);

    // Calculate based on KPI type
    let valorRealizado = 0;
    
    switch (kpiType) {
      case 'reunioesRealizadas':
        // Meetings are tracked in the Controle Closer table
        valorRealizado = closerPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (row['Show Inbound'] || 0) + 
          (row['Show Outbound'] || 0) + 
          (row['Show Indicação'] || 0) +
          (row['Show Outros'] || 0), 0);
        break;
        
      case 'vendas':
        // Sales are tracked in the Negociacoes table
        valorRealizado = negociacoesData.filter((row: any) => 
          row.STATUS === 'Ganho' || 
          row.STATUS === 'Finalizado' || 
          row.STATUS === 'Contrato Assinado' || 
          row.STATUS === 'Contrato na Rua'
        ).length;
        break;
        
      case 'taxaConversao': {
        // Meetings from Controle Closer
        const totalReunioes = closerPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (row['Show Inbound'] || 0) + 
          (row['Show Outbound'] || 0) + 
          (row['Show Indicação'] || 0) +
          (row['Show Outros'] || 0), 0);
          
        // Sales from Negociacoes  
        const totalVendas = negociacoesData.filter((row: any) => 
          row.STATUS === 'Ganho' || 
          row.STATUS === 'Finalizado' || 
          row.STATUS === 'Contrato Assinado' || 
          row.STATUS === 'Contrato na Rua'
        ).length;
          
        valorRealizado = totalReunioes > 0 ? (totalVendas / totalReunioes) * 100 : 0;
        break;
      }
      
      case 'indicacoesColetadas':
        valorRealizado = closerPerformanceData.reduce((sum: number, row: any) => 
          sum + (row['Indicação Coletadas'] || 0), 0);
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
        const matchesCloser = !selectedCloser || selectedCloser === 'all' || row.Closer === selectedCloser;
        
        return matchesDate && matchesType && matchesCloser;
      });
      
      meta = filteredMetaData.reduce((sum: number, row: any) => sum + (row.Valor || 0), 0);
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

// Fetch closer performance data for charts - Using only DATA DA CALL for filtering
export const fetchCloserPerformanceData = async (
  dateRange?: DateRange,
  selectedCloser?: string,
  selectedOrigin?: string
) => {
  try {
    // Ensure we have a valid date range
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    console.log('Performance data - Normalized date range:', normalizedDateRange);
    
    // Fetch Controle Closer data for meetings
    const closerPerformanceData = await fetchFilteredData(
      'closer_performance', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { Closer: selectedCloser } : undefined
    );
    
    console.log(`Fetched ${closerPerformanceData.length} rows from closer_performance`);
    
    // Fetch negotiations data - using 'DATA DA CALL' for filtering
    const negociacoesData = await fetchFilteredData(
      'negociacoes', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { CLOSER: selectedCloser } : undefined,
      'start' // Use 'DATA DA CALL' for filtering
    );
    
    console.log(`Fetched ${negociacoesData.length} rows from negociacoes`);
    
    // Apply origin filter if selected
    let filteredNegociacoes = negociacoesData;
    if (selectedOrigin && selectedOrigin !== 'all') {
      filteredNegociacoes = filteredNegociacoes.filter((row: any) => row.ORIGEM === selectedOrigin);
      console.log(`Applied origin filter. Remaining rows: ${filteredNegociacoes.length}`);
    }
    
    // Get unique closers from both datasets
    const closersFromPerformance = Array.from(new Set(closerPerformanceData.map((row: any) => row.Closer))).filter(Boolean);
    const closersFromNegociacoes = Array.from(new Set(filteredNegociacoes.map((row: any) => row.CLOSER))).filter(Boolean);
    
    // Combine unique closers from both datasets
    const closers = Array.from(new Set([...closersFromPerformance, ...closersFromNegociacoes]));
    
    // If a specific closer is selected and it's not in the filtered data, add it
    if (selectedCloser && selectedCloser !== 'all' && !closers.includes(selectedCloser)) {
      closers.push(selectedCloser);
    }
    
    // Calculate metrics for each closer
    const closerPerformance = closers.map((closer: string) => {
      // Meetings data from closerPerformanceData
      const closerData = closerPerformanceData.filter((row: any) => row.Closer === closer);
      
      const reunioesRealizadas = closerData.reduce((sum: number, row: any) => 
        sum + 
        (row['Show Inbound'] || 0) + 
        (row['Show Outbound'] || 0) + 
        (row['Show Indicação'] || 0) +
        (row['Show Outros'] || 0), 0);
      
      // Sales data from negociacoesData
      const closerNegociations = filteredNegociacoes.filter((row: any) => row.CLOSER === closer);
      const vendas = closerNegociations.filter((row: any) => 
        row.STATUS === 'Ganho' || 
        row.STATUS === 'Finalizado' || 
        row.STATUS === 'Contrato Assinado' || 
        row.STATUS === 'Contrato na Rua'
      ).length;
      
      const negociosPerdidos = closerNegociations.filter((row: any) => 
        row.STATUS === 'Perdido'
      ).length;
        
      const taxaConversao = reunioesRealizadas > 0 
        ? (vendas / reunioesRealizadas) * 100 
        : 0;
        
      const indicacoesColetadas = closerData.reduce((sum: number, row: any) => 
        sum + (row['Indicação Coletadas'] || 0), 0);
      
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
    
    return closerPerformance;
  } catch (error) {
    console.error('Error fetching closer performance data:', error);
    return [];
  }
};

// Function for sales funnel data - only using DATA DA CALL for filtering
export const fetchCloserSalesFunnelData = async (
  dateRange?: DateRange,
  selectedCloser?: string,
  selectedOrigin?: string
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    console.log('Fetching sales funnel data with date range:');
    console.log('Date range:', normalizedDateRange);
    
    // Fetch Negociacoes data with filters - using 'DATA DA CALL' (start)
    let negociacoesData = await fetchFilteredData(
      'negociacoes', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { CLOSER: selectedCloser } : undefined,
      'start'
    );
    
    console.log(`Fetched ${negociacoesData.length} rows from negociacoes`);
    
    // Apply origin filter if selected
    if (selectedOrigin && selectedOrigin !== 'all') {
      negociacoesData = negociacoesData.filter((row: any) => row.ORIGEM === selectedOrigin);
      console.log(`Applied origin filter. Remaining rows: ${negociacoesData.length}`);
    }
    
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
      { etapa: 'Em Negociaç��o', valor: emNegociacao },
      { etapa: 'Ganhos', valor: ganhos },
      { etapa: 'Perdidos', valor: perdidos }
    ];
  } catch (error) {
    console.error('Error fetching sales funnel data:', error);
    return [];
  }
};

// Function for loss reasons data - only using DATA DA CALL for filtering
export const fetchCloserLossReasonsData = async (
  dateRange?: DateRange,
  selectedCloser?: string,
  selectedOrigin?: string
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch Negociacoes data with filters - using 'DATA DA CALL' (start)
    let negociacoesData = await fetchFilteredData(
      'negociacoes', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { CLOSER: selectedCloser } : undefined,
      'start'
    );
    
    // Apply origin filter if selected
    if (selectedOrigin && selectedOrigin !== 'all') {
      negociacoesData = negociacoesData.filter((row: any) => row.ORIGEM === selectedOrigin);
    }
    
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

// Function for sales cycle data - only using DATA DA CALL for filtering
export const fetchCloserSalesCycleData = async (
  dateRange?: DateRange,
  selectedCloser?: string,
  selectedOrigin?: string
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch Negociacoes data with filters - using 'DATA DA CALL' (start)
    let negociacoesData = await fetchFilteredData(
      'negociacoes', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { CLOSER: selectedCloser } : undefined,
      'start'
    );
    
    // Apply origin filter if selected
    if (selectedOrigin && selectedOrigin !== 'all') {
      negociacoesData = negociacoesData.filter((row: any) => row.ORIGEM === selectedOrigin);
    }
    
    // Define cycle ranges
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

// Fetch negotiations based on filters - Using only DATA DA CALL for filtering
export const fetchNegotiations = async (
  dateRange?: DateRange,
  selectedCloser?: string,
  selectedOrigin?: string
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch Negociacoes data with filters - using 'DATA DA CALL' (start)
    let negociacoesData = await fetchFilteredData(
      'negociacoes', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { CLOSER: selectedCloser } : undefined,
      'start'
    );
    
    // Apply origin filter if selected
    if (selectedOrigin && selectedOrigin !== 'all') {
      negociacoesData = negociacoesData.filter((row: any) => 
        row.ORIGEM && row.ORIGEM.toLowerCase() === selectedOrigin.toLowerCase()
      );
      console.log(`Applied origin filter (${selectedOrigin}). Remaining rows: ${negociacoesData.length}`);
    }
    
    return negociacoesData;
  } catch (error) {
    console.error('Error fetching negotiations data:', error);
    return [];
  }
};
