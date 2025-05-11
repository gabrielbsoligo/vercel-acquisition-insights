
import { DateRange } from "react-day-picker";
import { 
  fetchSdrPerformanceData, 
  fetchSdrMetaData,
  fetchCloserPerformanceData,
  fetchCloserMetaData,
  fetchFilteredData,
  parseDate,
  isDateInRange
} from "./dataSourceService";

// Helper function to ensure DateRange has proper values
const normalizeDateRange = (dateRange?: DateRange): { from: Date; to: Date } => {
  // If no dateRange provided, use default range
  if (!dateRange) {
    const today = new Date();
    return { 
      from: new Date(today.getFullYear(), today.getMonth(), 1), 
      to: today 
    };
  }
  
  // If 'from' is missing, use the first day of the current month
  const from = dateRange.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  
  // If 'to' is missing, use the current date
  const to = dateRange.to || new Date();
  
  return { from, to };
};

// Fetch SDR KPI data
export const fetchSdrKpiData = async (
  kpiType: string, 
  dateRange?: DateRange, 
  selectedSdr?: string
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch data from Supabase
    const sdrPerformanceData = await fetchFilteredData(
      'sdr_performance', 
      normalizedDateRange,
      selectedSdr && selectedSdr !== 'all' ? { SDR: selectedSdr } : undefined
    );
    
    const sdrMetaData = await fetchSdrMetaData();

    // Calculate based on KPI type
    let valorRealizado = 0;
    
    switch (kpiType) {
      case 'leadsAtivados':
        valorRealizado = sdrPerformanceData.reduce((sum: number, row: any) => 
          sum + (Number(row['Empresas Ativadas']) || 0), 0);
        break;
        
      case 'ligacoesFeitas':
        valorRealizado = sdrPerformanceData.reduce((sum: number, row: any) => 
          sum + (Number(row['Ligações Realizadas']) || 0), 0);
        break;
        
      case 'ligacoesAtendidas':
        valorRealizado = sdrPerformanceData.reduce((sum: number, row: any) => 
          sum + (Number(row['Ligações Atendidas']) || 0), 0);
        break;
        
      case 'tempoLinha':
        // Assuming time is in format HH:MM:SS or similar
        valorRealizado = sdrPerformanceData.reduce((sum: number, row: any) => {
          if (!row.Tempo) return sum;
          
          // Try to parse time string to seconds
          const timeStr = row.Tempo.trim();
          const timeParts = timeStr.split(':');
          
          if (timeParts.length === 3) {
            const hours = parseInt(timeParts[0], 10) || 0;
            const minutes = parseInt(timeParts[1], 10) || 0;
            const seconds = parseInt(timeParts[2], 10) || 0;
            return sum + (hours * 3600 + minutes * 60 + seconds);
          }
          
          return sum;
        }, 0);
        break;
        
      case 'reunioesAgendadas':
        valorRealizado = sdrPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (Number(row['Marcadas Out']) || 0) + 
          (Number(row['Marcadas Recom']) || 0) + 
          (Number(row['Marcadas Inbound']) || 0), 0);
        break;
        
      case 'reunioesAcontecidas':
        valorRealizado = sdrPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (Number(row['Show Out']) || 0) + 
          (Number(row['Show Recom']) || 0) + 
          (Number(row['Show Inbound']) || 0), 0);
        break;
        
      case 'taxaLeadsConexoes': {
        const totalLeads = sdrPerformanceData.reduce((sum: number, row: any) => 
          sum + (Number(row['Empresas Ativadas']) || 0), 0);
          
        const totalConexoes = sdrPerformanceData.reduce((sum: number, row: any) => 
          sum + (Number(row['Novas Conexões Stakeholder']) || 0), 0);
          
        valorRealizado = totalLeads > 0 ? (totalConexoes / totalLeads) * 100 : 0;
        break;
      }
      
      case 'taxaConexoesAgendadas': {
        const totalConexoes = sdrPerformanceData.reduce((sum: number, row: any) => 
          sum + (Number(row['Novas Conexões Stakeholder']) || 0), 0);
          
        const totalAgendadas = sdrPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (Number(row['Marcadas Out']) || 0) + 
          (Number(row['Marcadas Recom']) || 0) + 
          (Number(row['Marcadas Inbound']) || 0), 0);
          
        valorRealizado = totalConexoes > 0 ? (totalAgendadas / totalConexoes) * 100 : 0;
        break;
      }
      
      case 'taxaAgendasAcontecidas': {
        const totalAgendadas = sdrPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (Number(row['Marcadas Out']) || 0) + 
          (Number(row['Marcadas Recom']) || 0) + 
          (Number(row['Marcadas Inbound']) || 0), 0);
          
        const totalAcontecidas = sdrPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (Number(row['Show Out']) || 0) + 
          (Number(row['Show Recom']) || 0) + 
          (Number(row['Show Inbound']) || 0), 0);
          
        valorRealizado = totalAgendadas > 0 ? (totalAcontecidas / totalAgendadas) * 100 : 0;
        break;
      }
      
      default:
        valorRealizado = 0;
    }

    // Get meta from SDR_META data
    let meta = 0;
    const fromMonth = normalizedDateRange.from.getMonth() + 1; // Add 1 because JS months are 0-indexed
    const fromYear = normalizedDateRange.from.getFullYear();
    
    // Map KPI types to meta types
    const metaTypeMapping: Record<string, string> = {
      'leadsAtivados': 'Ativadas',
      'ligacoesFeitas': 'Ligações Realizadas',
      'ligacoesAtendidas': 'Ligações Atendidas',
      'tempoLinha': 'Tempo total em linha',
      'reunioesAgendadas': 'Agendadas OUT', // This is simplified, should sum multiple meta types
      'reunioesAcontecidas': 'Acontecidas OUT', // This is simplified, should sum multiple meta types
      'taxaLeadsConexoes': 'Tx Ativadas > Conexões',
      'taxaConexoesAgendadas': 'Tx Conexões > Agendadas',
      'taxaAgendasAcontecidas': 'Tx Agendadas > Acontecidas'
    };
    
    const metaType = metaTypeMapping[kpiType];
    
    if (metaType) {
      const filteredMetaData = sdrMetaData.filter((row: any) => {
        if (!row.Mês) return false;
        
        const rowDate = parseDate(row.Mês);
        if (!rowDate) return false;
        
        const rowMonth = rowDate.getMonth() + 1;
        const rowYear = rowDate.getFullYear();
        
        const matchesDate = rowMonth === fromMonth && rowYear === fromYear;
        const matchesType = row.Tipo === metaType;
        const matchesSdr = !selectedSdr || selectedSdr === 'all' || row.SDR === selectedSdr;
        
        return matchesDate && matchesType && matchesSdr;
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
    console.error(`Error fetching ${kpiType} KPI data:`, error);
    return {
      valorRealizado: 0,
      meta: 0,
      percentComplete: 0
    };
  }
};

// Fetch SDR performance data for bar chart
export const fetchSdrPerformanceData = async (
  dateRange?: DateRange, 
  selectedSdr?: string
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch data from Supabase with filters
    const sdrPerformanceData = await fetchFilteredData(
      'sdr_performance', 
      normalizedDateRange,
      selectedSdr && selectedSdr !== 'all' ? { SDR: selectedSdr } : undefined
    );
    
    // Get unique SDRs
    const sdrs = Array.from(new Set(sdrPerformanceData.map((row: any) => row.SDR))).filter(Boolean);
    
    // If a specific SDR is selected and it's not in the filtered data, add it
    if (selectedSdr && selectedSdr !== 'all' && !sdrs.includes(selectedSdr)) {
      sdrs.push(selectedSdr);
    }
    
    // Calculate metrics for each SDR
    const sdrPerformance = sdrs.map((sdr: string) => {
      const sdrData = sdrPerformanceData.filter((row: any) => row.SDR === sdr);
      
      const leadsAtivados = sdrData.reduce((sum: number, row: any) => 
        sum + (Number(row['Empresas Ativadas']) || 0), 0);
        
      const conexoes = sdrData.reduce((sum: number, row: any) => 
        sum + (Number(row['Novas Conexões Stakeholder']) || 0), 0);
        
      const reunioesAgendadas = sdrData.reduce((sum: number, row: any) => 
        sum + 
        (Number(row['Marcadas Out']) || 0) + 
        (Number(row['Marcadas Recom']) || 0) + 
        (Number(row['Marcadas Inbound']) || 0), 0);
        
      const reunioesAcontecidas = sdrData.reduce((sum: number, row: any) => 
        sum + 
        (Number(row['Show Out']) || 0) + 
        (Number(row['Show Recom']) || 0) + 
        (Number(row['Show Inbound']) || 0), 0);
        
      const taxaLeadsConexoes = leadsAtivados > 0 
        ? (conexoes / leadsAtivados) * 100 
        : 0;
        
      const taxaConexoesAgendadas = conexoes > 0 
        ? (reunioesAgendadas / conexoes) * 100 
        : 0;
        
      const taxaAgendasAcontecidas = reunioesAgendadas > 0 
        ? (reunioesAcontecidas / reunioesAgendadas) * 100 
        : 0;
      
      return {
        sdrName: sdr,
        leadsAtivados,
        conexoes,
        reunioesAgendadas,
        reunioesAcontecidas,
        taxaLeadsConexoes,
        taxaConexoesAgendadas,
        taxaAgendasAcontecidas
      };
    });
    
    // Add total for all SDRs
    const totalLeadsAtivados = sdrPerformance.reduce((sum, sdr) => sum + sdr.leadsAtivados, 0);
    const totalConexoes = sdrPerformance.reduce((sum, sdr) => sum + sdr.conexoes, 0);
    const totalReunioesAgendadas = sdrPerformance.reduce((sum, sdr) => sum + sdr.reunioesAgendadas, 0);
    const totalReunioesAcontecidas = sdrPerformance.reduce((sum, sdr) => sum + sdr.reunioesAcontecidas, 0);
    
    const totalTaxaLeadsConexoes = totalLeadsAtivados > 0 
      ? (totalConexoes / totalLeadsAtivados) * 100 
      : 0;
      
    const totalTaxaConexoesAgendadas = totalConexoes > 0 
      ? (totalReunioesAgendadas / totalConexoes) * 100 
      : 0;
      
    const totalTaxaAgendasAcontecidas = totalReunioesAgendadas > 0 
      ? (totalReunioesAcontecidas / totalReunioesAgendadas) * 100 
      : 0;
    
    sdrPerformance.push({
      sdrName: 'Total Equipe',
      leadsAtivados: totalLeadsAtivados,
      conexoes: totalConexoes,
      reunioesAgendadas: totalReunioesAgendadas,
      reunioesAcontecidas: totalReunioesAcontecidas,
      taxaLeadsConexoes: totalTaxaLeadsConexoes,
      taxaConexoesAgendadas: totalTaxaConexoesAgendadas,
      taxaAgendasAcontecidas: totalTaxaAgendasAcontecidas
    });
    
    return sdrPerformance;
  } catch (error) {
    console.error('Error fetching SDR performance data:', error);
    return [];
  }
};

// Fetch trend data for line chart
export const fetchSdrTrendData = async (
  dateRange?: DateRange, 
  selectedSdr?: string
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch data from Supabase with filters
    const sdrPerformanceData = await fetchFilteredData(
      'sdr_performance', 
      normalizedDateRange,
      selectedSdr && selectedSdr !== 'all' ? { SDR: selectedSdr } : undefined
    );
    
    // Determine granularity based on date range duration
    const durationInDays = Math.ceil(
      (normalizedDateRange.to.getTime() - normalizedDateRange.from.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    let granularity: 'day' | 'week' | 'month' = 'day';
    if (durationInDays > 90) {
      granularity = 'month';
    } else if (durationInDays > 31) {
      granularity = 'week';
    }
    
    // Group data by selected granularity
    const periodMap = new Map();
    
    sdrPerformanceData.forEach((row: any) => {
      const rowDate = parseDate(row.Data);
      if (!rowDate) return;
      
      let periodKey;
      
      if (granularity === 'day') {
        periodKey = rowDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (granularity === 'week') {
        // Get the Monday of the week
        const day = rowDate.getDay();
        const diff = rowDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        const monday = new Date(rowDate);
        monday.setDate(diff);
        periodKey = monday.toISOString().split('T')[0]; // YYYY-MM-DD of Monday
      } else {
        // Month
        periodKey = `${rowDate.getFullYear()}-${String(rowDate.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, {
          periodo: periodKey,
          leadsAtivados: 0,
          reunioesAgendadas: 0,
          reunioesAcontecidas: 0
        });
      }
      
      const periodData = periodMap.get(periodKey);
      
      periodData.leadsAtivados += (Number(row['Empresas Ativadas']) || 0);
      periodData.reunioesAgendadas += 
        (Number(row['Marcadas Out']) || 0) + 
        (Number(row['Marcadas Recom']) || 0) + 
        (Number(row['Marcadas Inbound']) || 0);
      periodData.reunioesAcontecidas += 
        (Number(row['Show Out']) || 0) + 
        (Number(row['Show Recom']) || 0) + 
        (Number(row['Show Inbound']) || 0);
    });
    
    // Convert map to array and sort by period
    const trendData = Array.from(periodMap.values()).sort((a, b) => 
      a.periodo.localeCompare(b.periodo)
    );
    
    // Format period labels based on granularity
    if (granularity === 'day') {
      // Keep YYYY-MM-DD format or change to DD/MM
    } else if (granularity === 'week') {
      trendData.forEach(item => {
        const startDate = new Date(item.periodo);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        // Format as "DD/MM - DD/MM"
        item.periodo = `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
      });
    } else {
      // Month format
      trendData.forEach(item => {
        const [year, month] = item.periodo.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        item.periodo = `${monthNames[parseInt(month) - 1]} ${year}`;
      });
    }
    
    return trendData;
  } catch (error) {
    console.error('Error fetching SDR trend data:', error);
    return [];
  }
};

// Fetch sales funnel data
export const fetchSalesFunnelData = async (
  dateRange?: DateRange, 
  selectedSdr?: string
) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch data from Supabase with filters
    const sdrPerformanceData = await fetchFilteredData(
      'sdr_performance', 
      normalizedDateRange,
      selectedSdr && selectedSdr !== 'all' ? { SDR: selectedSdr } : undefined
    );
    
    // Calculate funnel metrics
    const leadsAtivados = sdrPerformanceData.reduce((sum: number, row: any) => 
      sum + (Number(row['Empresas Ativadas']) || 0), 0);
      
    const conexoes = sdrPerformanceData.reduce((sum: number, row: any) => 
      sum + (Number(row['Novas Conexões Stakeholder']) || 0), 0);
      
    const reunioesAgendadas = sdrPerformanceData.reduce((sum: number, row: any) => 
      sum + 
      (Number(row['Marcadas Out']) || 0) + 
      (Number(row['Marcadas Recom']) || 0) + 
      (Number(row['Marcadas Inbound']) || 0), 0);
      
    const reunioesAcontecidas = sdrPerformanceData.reduce((sum: number, row: any) => 
      sum + 
      (Number(row['Show Out']) || 0) + 
      (Number(row['Show Recom']) || 0) + 
      (Number(row['Show Inbound']) || 0), 0);
    
    // Create funnel data array
    const funnelData = [
      { etapa: 'Leads Ativados', valor: leadsAtivados },
      { etapa: 'Conexões', valor: conexoes },
      { etapa: 'Reuniões Agendadas', valor: reunioesAgendadas },
      { etapa: 'Reuniões Acontecidas', valor: reunioesAcontecidas }
    ];
    
    return funnelData;
  } catch (error) {
    console.error('Error fetching sales funnel data:', error);
    return [];
  }
};

// Add closer-related functions

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
export const fetchCloserPerformanceDataForCharts = async (
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

// Fetch channels data
export const fetchChannelsData = async (dateRange?: DateRange) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch negotiations data from Supabase
    const negociacoesData = await fetchFilteredData('negociacoes', normalizedDateRange);
    
    // Get channels data from the empresa_meta table
    const empresaMetaData = await fetchEmpresaMetaData();
    
    // Calculate performance by channel
    const channels = ['Leadbroker', 'Outbound', 'Recomendação'];
    
    const channelsPerformance = channels.map(channel => {
      // Filter negotiations by channel
      const channelNegotiations = negociacoesData.filter((row: any) => 
        row.Canal === channel
      );
      
      const totalNegotiations = channelNegotiations.length;
      
      const totalValue = channelNegotiations.reduce((sum: number, row: any) => 
        sum + (Number(row.Valor) || 0), 0);
      
      const avgTicket = totalNegotiations > 0 
        ? totalValue / totalNegotiations 
        : 0;
      
      // Get meta for the channel
      const fromMonth = normalizedDateRange.from.getMonth() + 1;
      const fromYear = normalizedDateRange.from.getFullYear();
      
      const channelMeta = empresaMetaData.filter((row: any) => {
        if (!row.Mês) return false;
        
        const rowDate = parseDate(row.Mês);
        if (!rowDate) return false;
        
        const rowMonth = rowDate.getMonth() + 1;
        const rowYear = rowDate.getFullYear();
        
        return rowMonth === fromMonth && 
               rowYear === fromYear && 
               row.Canal === channel;
      });
      
      const mrrMeta = channelMeta.find((row: any) => row.Tipo === 'MRR')?.Valor || 0;
      const oneTimeMeta = channelMeta.find((row: any) => row.Tipo === 'One Time')?.Valor || 0;
      const totalMeta = Number(mrrMeta) + Number(oneTimeMeta);
      
      const percentComplete = totalMeta > 0 ? (totalValue / totalMeta) * 100 : 0;
      
      return {
        channel,
        totalNegotiations,
        totalValue,
        avgTicket,
        meta: totalMeta,
        percentComplete
      };
    });
    
    return channelsPerformance;
  } catch (error) {
    console.error('Error fetching channels data:', error);
    return [];
  }
};

// Fetch lead broker data
export const fetchLeadBrokerPerformanceData = async (dateRange?: DateRange) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch lead broker data from Supabase
    const leadBrokerData = await fetchFilteredData('lead_broker', normalizedDateRange);
    
    // Calculate performance metrics
    const totalLeadsCost = leadBrokerData.reduce((sum: number, row: any) => 
      sum + (Number(row['Custo Lead']) || 0), 0);
    
    const totalLeadsCount = leadBrokerData.length;
    
    const avgCostPerLead = totalLeadsCount > 0 
      ? totalLeadsCost / totalLeadsCount 
      : 0;
    
    // Get converted leads
    const convertedLeads = leadBrokerData.filter((row: any) => 
      row.Status === 'Convertido'
    ).length;
    
    const conversionRate = totalLeadsCount > 0 
      ? (convertedLeads / totalLeadsCount) * 100 
      : 0;
    
    // Calculate ROI
    const totalRevenue = leadBrokerData.reduce((sum: number, row: any) => {
      if (row.Status === 'Convertido') {
        return sum + (Number(row['Valor Contrato']) || 0);
      }
      return sum;
    }, 0);
    
    const roi = totalLeadsCost > 0 
      ? ((totalRevenue - totalLeadsCost) / totalLeadsCost) * 100 
      : 0;
    
    return {
      totalLeadsCost,
      totalLeadsCount,
      avgCostPerLead,
      convertedLeads,
      conversionRate,
      totalRevenue,
      roi
    };
  } catch (error) {
    console.error('Error fetching lead broker performance data:', error);
    return {
      totalLeadsCost: 0,
      totalLeadsCount: 0,
      avgCostPerLead: 0,
      convertedLeads: 0,
      conversionRate: 0,
      totalRevenue: 0,
      roi: 0
    };
  }
};
