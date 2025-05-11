import { DateRange } from "react-day-picker";
import { CSV_PATHS, loadCsvFile, parseDate, isDateInRange } from "./csvService";

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
    const sdrPerformanceData = await loadCsvFile(CSV_PATHS.SDR_PERFORMANCE);
    const sdrMetaData = await loadCsvFile(CSV_PATHS.SDR_META);

    // Filter data by date range and SDR if specified
    const filteredPerformanceData = sdrPerformanceData.filter((row: any) => {
      if (!row.Data) return false;
      
      const rowDate = parseDate(row.Data);
      const matchesDateRange = isDateInRange(rowDate, normalizedDateRange);
      const matchesSdr = !selectedSdr || selectedSdr === 'all' || row.SDR === selectedSdr;
      
      return matchesDateRange && matchesSdr;
    });

    // Calculate based on KPI type
    let valorRealizado = 0;
    
    switch (kpiType) {
      case 'leadsAtivados':
        valorRealizado = filteredPerformanceData.reduce((sum: number, row: any) => 
          sum + (Number(row['Empresas Ativadas']) || 0), 0);
        break;
        
      case 'ligacoesFeitas':
        valorRealizado = filteredPerformanceData.reduce((sum: number, row: any) => 
          sum + (Number(row['Ligações Realizadas']) || 0), 0);
        break;
        
      case 'ligacoesAtendidas':
        valorRealizado = filteredPerformanceData.reduce((sum: number, row: any) => 
          sum + (Number(row['Ligações Atendidas']) || 0), 0);
        break;
        
      case 'tempoLinha':
        // Assuming time is in format HH:MM:SS or similar
        valorRealizado = filteredPerformanceData.reduce((sum: number, row: any) => {
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
        valorRealizado = filteredPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (Number(row['Marcadas Out']) || 0) + 
          (Number(row['Marcadas Recom']) || 0) + 
          (Number(row['Marcadas Inbound']) || 0), 0);
        break;
        
      case 'reunioesAcontecidas':
        valorRealizado = filteredPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (Number(row['Show Out']) || 0) + 
          (Number(row['Show Recom']) || 0) + 
          (Number(row['Show Inbound']) || 0), 0);
        break;
        
      case 'taxaLeadsConexoes': {
        const totalLeads = filteredPerformanceData.reduce((sum: number, row: any) => 
          sum + (Number(row['Empresas Ativadas']) || 0), 0);
          
        const totalConexoes = filteredPerformanceData.reduce((sum: number, row: any) => 
          sum + (Number(row['Novas Conexões Stakeholder']) || 0), 0);
          
        valorRealizado = totalLeads > 0 ? (totalConexoes / totalLeads) * 100 : 0;
        break;
      }
      
      case 'taxaConexoesAgendadas': {
        const totalConexoes = filteredPerformanceData.reduce((sum: number, row: any) => 
          sum + (Number(row['Novas Conexões Stakeholder']) || 0), 0);
          
        const totalAgendadas = filteredPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (Number(row['Marcadas Out']) || 0) + 
          (Number(row['Marcadas Recom']) || 0) + 
          (Number(row['Marcadas Inbound']) || 0), 0);
          
        valorRealizado = totalConexoes > 0 ? (totalAgendadas / totalConexoes) * 100 : 0;
        break;
      }
      
      case 'taxaAgendasAcontecidas': {
        const totalAgendadas = filteredPerformanceData.reduce((sum: number, row: any) => 
          sum + 
          (Number(row['Marcadas Out']) || 0) + 
          (Number(row['Marcadas Recom']) || 0) + 
          (Number(row['Marcadas Inbound']) || 0), 0);
          
        const totalAcontecidas = filteredPerformanceData.reduce((sum: number, row: any) => 
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
    const sdrPerformanceData = await loadCsvFile(CSV_PATHS.SDR_PERFORMANCE);
    
    // Filter data by date range
    const filteredData = sdrPerformanceData.filter((row: any) => {
      if (!row.Data) return false;
      
      const rowDate = parseDate(row.Data);
      const matchesDateRange = isDateInRange(rowDate, normalizedDateRange);
      const matchesSdr = !selectedSdr || selectedSdr === 'all' || row.SDR === selectedSdr;
      
      return matchesDateRange && matchesSdr;
    });
    
    // Get unique SDRs
    const sdrs = Array.from(new Set(filteredData.map((row: any) => row.SDR))).filter(Boolean);
    
    // If a specific SDR is selected and it's not in the filtered data, add it
    if (selectedSdr && selectedSdr !== 'all' && !sdrs.includes(selectedSdr)) {
      sdrs.push(selectedSdr);
    }
    
    // Calculate metrics for each SDR
    const sdrPerformance = sdrs.map((sdr: string) => {
      const sdrData = filteredData.filter((row: any) => row.SDR === sdr);
      
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
    const sdrPerformanceData = await loadCsvFile(CSV_PATHS.SDR_PERFORMANCE);
    
    // Filter data by date range and SDR
    const filteredData = sdrPerformanceData.filter((row: any) => {
      if (!row.Data) return false;
      
      const rowDate = parseDate(row.Data);
      const matchesDateRange = isDateInRange(rowDate, normalizedDateRange);
      const matchesSdr = !selectedSdr || selectedSdr === 'all' || row.SDR === selectedSdr;
      
      return matchesDateRange && matchesSdr;
    });
    
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
    
    filteredData.forEach((row: any) => {
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
    const sdrPerformanceData = await loadCsvFile(CSV_PATHS.SDR_PERFORMANCE);
    
    // Filter data by date range and SDR
    const filteredData = sdrPerformanceData.filter((row: any) => {
      if (!row.Data) return false;
      
      const rowDate = parseDate(row.Data);
      const matchesDateRange = isDateInRange(rowDate, normalizedDateRange);
      const matchesSdr = !selectedSdr || selectedSdr === 'all' || row.SDR === selectedSdr;
      
      return matchesDateRange && matchesSdr;
    });
    
    // Calculate funnel metrics
    const leadsAtivados = filteredData.reduce((sum: number, row: any) => 
      sum + (Number(row['Empresas Ativadas']) || 0), 0);
      
    const conexoes = filteredData.reduce((sum: number, row: any) => 
      sum + (Number(row['Novas Conexões Stakeholder']) || 0), 0);
      
    const reunioesAgendadas = filteredData.reduce((sum: number, row: any) => 
      sum + 
      (Number(row['Marcadas Out']) || 0) + 
      (Number(row['Marcadas Recom']) || 0) + 
      (Number(row['Marcadas Inbound']) || 0), 0);
      
    const reunioesAcontecidas = filteredData.reduce((sum: number, row: any) => 
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
