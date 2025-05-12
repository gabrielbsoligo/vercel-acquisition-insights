
import { DateRange } from "react-day-picker";
import { 
  fetchFilteredData,
  parseDate,
  fetchCloserMetaData
} from "./dataSourceService";
import { normalizeDateRange } from "./utils/dateUtils";

// Fetch closer KPI data using Negociacoes table as primary source
export const fetchCloserKpiData = async (
  kpiType: string, 
  dateRange?: DateRange, 
  selectedCloser?: string
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch Negociacoes data for sales metrics
    const negociacoesData = await fetchFilteredData(
      'negociacoes', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { CLOSER: selectedCloser } : undefined
    );
    
    // Fetch Closer Performance data for meeting metrics
    const closerPerformanceData = await fetchFilteredData(
      'closer_performance', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { Closer: selectedCloser } : undefined
    );
    
    // Fetch meta data
    const closerMetaData = await fetchCloserMetaData();

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
          row.STATUS === 'Ganho' || row.STATUS === 'Finalizado'
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
          row.STATUS === 'Ganho' || row.STATUS === 'Finalizado'
        ).length;
          
        valorRealizado = totalReunioes > 0 ? (totalVendas / totalReunioes) * 100 : 0;
        break;
      }
      
      case 'indicacoesColetadas':
        valorRealizado = closerPerformanceData.reduce((sum: number, row: any) => 
          sum + (row['Indicação Coletadas'] || 0), 0);
        break;
        
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
      'indicacoesColetadas': 'Indicações'
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

// Fetch closer performance data for charts
export const fetchCloserPerformanceData = async (
  dateRange?: DateRange, 
  selectedCloser?: string
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch Controle Closer data for meetings
    const closerPerformanceData = await fetchFilteredData(
      'closer_performance', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { Closer: selectedCloser } : undefined
    );
    
    // Fetch Negociacoes data for sales
    const negociacoesData = await fetchFilteredData(
      'negociacoes', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { CLOSER: selectedCloser } : undefined
    );
    
    // Get unique closers from both datasets
    const closersFromPerformance = Array.from(new Set(closerPerformanceData.map((row: any) => row.Closer))).filter(Boolean);
    const closersFromNegociacoes = Array.from(new Set(negociacoesData.map((row: any) => row.CLOSER))).filter(Boolean);
    
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
      const closerNegociations = negociacoesData.filter((row: any) => row.CLOSER === closer);
      const vendas = closerNegociations.filter((row: any) => 
        row.STATUS === 'Ganho' || row.STATUS === 'Finalizado'
      ).length;
        
      const taxaConversao = reunioesRealizadas > 0 
        ? (vendas / reunioesRealizadas) * 100 
        : 0;
        
      const indicacoesColetadas = closerData.reduce((sum: number, row: any) => 
        sum + (row['Indicação Coletadas'] || 0), 0);
      
      return {
        closerName: closer,
        reunioesRealizadas,
        vendas,
        taxaConversao,
        indicacoesColetadas
      };
    });
    
    // Add total for all closers
    const totalReunioesRealizadas = closerPerformance.reduce((sum, closer) => sum + closer.reunioesRealizadas, 0);
    const totalVendas = closerPerformance.reduce((sum, closer) => sum + closer.vendas, 0);
    const totalTaxaConversao = totalReunioesRealizadas > 0 
      ? (totalVendas / totalReunioesRealizadas) * 100 
      : 0;
    const totalIndicacoesColetadas = closerPerformance.reduce((sum, closer) => sum + closer.indicacoesColetadas, 0);
    
    closerPerformance.push({
      closerName: 'Total Equipe',
      reunioesRealizadas: totalReunioesRealizadas,
      vendas: totalVendas,
      taxaConversao: totalTaxaConversao,
      indicacoesColetadas: totalIndicacoesColetadas
    });
    
    return closerPerformance;
  } catch (error) {
    console.error('Error fetching closer performance data:', error);
    return [];
  }
};
