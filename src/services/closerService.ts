
import { DateRange } from "react-day-picker";
import { 
  fetchFilteredData,
  parseDate,
  fetchCloserMetaData
} from "./dataSourceService";
import { normalizeDateRange } from "./utils/dateUtils";

// Fetch closer KPI data
export const fetchCloserKpiData = async (
  kpiType: string, 
  dateRange?: DateRange, 
  selectedCloser?: string
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch data from Supabase
    const closerPerformanceData = await fetchFilteredData(
      'closer_performance', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { Closer: selectedCloser } : undefined
    );
    
    const closerMetaData = await fetchCloserMetaData();

    // Calculate based on KPI type
    let valorRealizado = 0;
    
    switch (kpiType) {
      case 'reunioesRealizadas':
        valorRealizado = closerPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (Number(row['Show Inbound']) || 0) + 
          (Number(row['Show Outbound']) || 0) + 
          (Number(row['Show Indicação']) || 0) +
          (Number(row['Show Outros']) || 0), 0);
        break;
        
      case 'vendas':
        valorRealizado = closerPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (Number(row['Vendas Inbound']) || 0) + 
          (Number(row['Vendas Outbound']) || 0) + 
          (Number(row['Vendas indicação']) || 0) +
          (Number(row['Vendas Outros']) || 0), 0);
        break;
        
      case 'taxaConversao': {
        const totalReunioes = closerPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (Number(row['Show Inbound']) || 0) + 
          (Number(row['Show Outbound']) || 0) + 
          (Number(row['Show Indicação']) || 0) +
          (Number(row['Show Outros']) || 0), 0);
          
        const totalVendas = closerPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (Number(row['Vendas Inbound']) || 0) + 
          (Number(row['Vendas Outbound']) || 0) + 
          (Number(row['Vendas indicação']) || 0) +
          (Number(row['Vendas Outros']) || 0), 0);
          
        valorRealizado = totalReunioes > 0 ? (totalVendas / totalReunioes) * 100 : 0;
        break;
      }
      
      case 'indicacoesColetadas':
        valorRealizado = closerPerformanceData.reduce((sum: number, row: any) => 
          sum + (Number(row['Indicação Coletadas']) || 0), 0);
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
        if (!rowDate) return false;
        
        const rowMonth = rowDate.getMonth() + 1;
        const rowYear = rowDate.getFullYear();
        
        const matchesDate = rowMonth === fromMonth && rowYear === fromYear;
        const matchesType = row.Tipo === metaType;
        const matchesCloser = !selectedCloser || selectedCloser === 'all' || row.Closer === selectedCloser;
        
        return matchesDate && matchesType && matchesCloser;
      });
      
      meta = filteredMetaData.reduce((sum: number, row: any) => sum + (Number(row.Valor) || 0), 0);
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
    
    // Fetch data from Supabase with filters
    const closerPerformanceData = await fetchFilteredData(
      'closer_performance', 
      normalizedDateRange,
      selectedCloser && selectedCloser !== 'all' ? { Closer: selectedCloser } : undefined
    );
    
    // Get unique closers
    const closers = Array.from(new Set(closerPerformanceData.map((row: any) => row.Closer))).filter(Boolean);
    
    // If a specific closer is selected and it's not in the filtered data, add it
    if (selectedCloser && selectedCloser !== 'all' && !closers.includes(selectedCloser)) {
      closers.push(selectedCloser);
    }
    
    // Calculate metrics for each closer
    const closerPerformance = closers.map((closer: string) => {
      const closerData = closerPerformanceData.filter((row: any) => row.Closer === closer);
      
      const reunioesRealizadas = closerData.reduce((sum: number, row: any) => 
        sum + 
        (Number(row['Show Inbound']) || 0) + 
        (Number(row['Show Outbound']) || 0) + 
        (Number(row['Show Indicação']) || 0) +
        (Number(row['Show Outros']) || 0), 0);
        
      const vendas = closerData.reduce((sum: number, row: any) => 
        sum + 
        (Number(row['Vendas Inbound']) || 0) + 
        (Number(row['Vendas Outbound']) || 0) + 
        (Number(row['Vendas indicação']) || 0) +
        (Number(row['Vendas Outros']) || 0), 0);
        
      const taxaConversao = reunioesRealizadas > 0 
        ? (vendas / reunioesRealizadas) * 100 
        : 0;
        
      const indicacoesColetadas = closerData.reduce((sum: number, row: any) => 
        sum + (Number(row['Indicação Coletadas']) || 0), 0);
      
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
