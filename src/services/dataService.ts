// This service processes data from the CSV files and provides it to the dashboard components
import { DateRange } from "react-day-picker";
import { loadCsvFile, CSV_PATHS, parseDate, isDateInRange } from "./csvService";

// Define common interfaces for the data types
export interface KpiData {
  valorRealizado: number;
  meta?: number;
  percentComplete?: number;
}

export interface KpiPercentData {
  valorPercentual: number;
  metaPercentual?: number;
}

export interface SdrPerformanceData {
  sdrName: string;
  leadsAtivados: number;
  reunioesAgendadas: number;
  reunioesAcontecidas: number;
  conexoes: number;
  taxaLeadsConexoes: number;
  taxaConexoesAgendadas: number;
  taxaAgendasAcontecidas: number;
  metaLeadsAtivados?: number;
  metaReunioesAgendadas?: number;
  metaReunioesAcontecidas?: number;
}

export interface CloserPerformanceData {
  closerName: string;
  valorVendido: number;
  numVendas: number;
  ticketMedio: number;
}

export interface SalesFunnelData {
  etapa: string;
  valor: number;
}

// Process the SDR Performance data
export const fetchSdrKpiData = async (
  metric: string,
  dateRange?: DateRange,
  sdr?: string
): Promise<KpiData> => {
  try {
    // Load CSV files
    const performanceData = await loadCsvFile(CSV_PATHS.SDR_PERFORMANCE);
    const metaData = await loadCsvFile(CSV_PATHS.SDR_META);
    
    // Filter performance data by date range and SDR
    const filteredPerformance = performanceData.filter((row: any) => {
      const rowDate = parseDate(row.Data);
      const sdrMatch = !sdr || sdr === 'all' || row.SDR === sdr;
      return isDateInRange(rowDate, dateRange) && sdrMatch;
    });
    
    // Calculate the realized value based on the metric
    let valorRealizado = 0;
    
    switch (metric) {
      case "leadsAtivados":
        valorRealizado = filteredPerformance.reduce((sum: number, row: any) => 
          sum + (Number(row["Empresas Ativadas"]) || 0), 0);
        break;
      case "ligacoesFeitas":
        valorRealizado = filteredPerformance.reduce((sum: number, row: any) => 
          sum + (Number(row["Ligações Realizadas"]) || 0), 0);
        break;
      case "ligacoesAtendidas":
        valorRealizado = filteredPerformance.reduce((sum: number, row: any) => 
          sum + (Number(row["Ligações Atendidas"]) || 0), 0);
        break;
      case "tempoLinha":
        valorRealizado = filteredPerformance.reduce((sum: number, row: any) => {
          if (!row["Tempo"]) return sum;
          // Assuming time is in format hh:mm:ss
          const timeParts = row["Tempo"].split(':');
          if (timeParts.length !== 3) return sum;
          const seconds = Number(timeParts[0]) * 3600 + Number(timeParts[1]) * 60 + Number(timeParts[2]);
          return sum + seconds;
        }, 0);
        // Return time in seconds, will be formatted in the component
        break;
      case "reunioesAgendadas":
        valorRealizado = filteredPerformance.reduce((sum: number, row: any) => 
          sum + (Number(row["Marcadas Out"]) || 0) + 
                (Number(row["Marcadas Recom"]) || 0) + 
                (Number(row["Marcadas Inbound"]) || 0), 0);
        break;
      case "reunioesAcontecidas":
        valorRealizado = filteredPerformance.reduce((sum: number, row: any) => 
          sum + (Number(row["Show Out"]) || 0) + 
                (Number(row["Show Recom"]) || 0) + 
                (Number(row["Show Inbound"]) || 0), 0);
        break;
      case "conexoes":
        valorRealizado = filteredPerformance.reduce((sum: number, row: any) => 
          sum + (Number(row["Novas Conexões Stakeholder"]) || 0), 0);
        break;
      case "taxaLeadsConexoes":
        const leads = filteredPerformance.reduce((sum: number, row: any) => 
          sum + (Number(row["Empresas Ativadas"]) || 0), 0);
        const conexoes = filteredPerformance.reduce((sum: number, row: any) => 
          sum + (Number(row["Novas Conexões Stakeholder"]) || 0), 0);
        valorRealizado = leads > 0 ? (conexoes / leads) * 100 : 0;
        break;
      case "taxaConexoesAgendadas":
        const conexoesAgendadas = filteredPerformance.reduce((sum: number, row: any) => 
          sum + (Number(row["Novas Conexões Stakeholder"]) || 0), 0);
        const agendadas = filteredPerformance.reduce((sum: number, row: any) => 
          sum + (Number(row["Marcadas Out"]) || 0) + 
                (Number(row["Marcadas Recom"]) || 0) + 
                (Number(row["Marcadas Inbound"]) || 0), 0);
        valorRealizado = conexoesAgendadas > 0 ? (agendadas / conexoesAgendadas) * 100 : 0;
        break;
      case "taxaAgendadasAcontecidas":
        const totalAgendadas = filteredPerformance.reduce((sum: number, row: any) => 
          sum + (Number(row["Marcadas Out"]) || 0) + 
                (Number(row["Marcadas Recom"]) || 0) + 
                (Number(row["Marcadas Inbound"]) || 0), 0);
        const acontecidas = filteredPerformance.reduce((sum: number, row: any) => 
          sum + (Number(row["Show Out"]) || 0) + 
                (Number(row["Show Recom"]) || 0) + 
                (Number(row["Show Inbound"]) || 0), 0);
        valorRealizado = totalAgendadas > 0 ? (acontecidas / totalAgendadas) * 100 : 0;
        break;
      default:
        valorRealizado = 0;
    }
    
    // Get the corresponding meta
    let meta: number | undefined;
    let percentComplete: number | undefined;
    
    // Extract months from the date range
    const months: { month: number, year: number }[] = [];
    if (dateRange?.from) {
      const startMonth = dateRange.from.getMonth() + 1; // 1-indexed
      const startYear = dateRange.from.getFullYear();
      const endMonth = dateRange.to ? dateRange.to.getMonth() + 1 : startMonth;
      const endYear = dateRange.to ? dateRange.to.getFullYear() : startYear;
      
      let currentYear = startYear;
      let currentMonth = startMonth;
      
      while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        months.push({ month: currentMonth, year: currentYear });
        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
      }
    }
    
    // Filter meta data by months and SDR
    let metaType = '';
    switch (metric) {
      case "leadsAtivados":
        metaType = "Ativadas";
        break;
      case "ligacoesFeitas":
        metaType = "Ligações Realizadas";
        break;
      case "ligacoesAtendidas":
        metaType = "Ligações Atendidas";
        break;
      case "tempoLinha":
        metaType = "Tempo total em linha";
        break;
      case "reunioesAgendadas":
        // Sum of multiple meta types
        break;
      case "reunioesAcontecidas":
        // Sum of multiple meta types
        break;
      case "taxaLeadsConexoes":
        metaType = "Tx Ativadas > Conexões";
        break;
      case "taxaConexoesAgendadas":
        metaType = "Tx Conexões > Agendadas";
        break;
      case "taxaAgendadasAcontecidas":
        metaType = "Tx Agendadas > Acontecidas";
        break;
    }
    
    if (metaType) {
      const filteredMeta = metaData.filter((row: any) => {
        if (row.Tipo !== metaType) return false;
        
        const sdrMatch = !sdr || sdr === 'all' || row.SDR === sdr;
        if (!sdrMatch) return false;
        
        const rowMonth = row.Mês ? parseDate(row.Mês) : null;
        if (!rowMonth) return false;
        
        const rowMonthValue = rowMonth.getMonth() + 1;
        const rowYearValue = rowMonth.getFullYear();
        
        return months.some(m => m.month === rowMonthValue && m.year === rowYearValue);
      });
      
      meta = filteredMeta.reduce((sum: number, row: any) => sum + (Number(row.Valor) || 0), 0);
      
      if (meta > 0) {
        percentComplete = Math.round((valorRealizado / meta) * 100);
      }
    } else if (metric === "reunioesAgendadas") {
      // Sum the metas for "Agendadas OUT", "Agendadas INB", "Agendadas RECOM"
      const metaTypes = ["Agendadas OUT", "Agendadas INB", "Agendadas RECOM"];
      meta = metaData
        .filter((row: any) => {
          const sdrMatch = !sdr || sdr === 'all' || row.SDR === sdr;
          const typeMatch = metaTypes.includes(row.Tipo);
          
          const rowMonth = row.Mês ? parseDate(row.Mês) : null;
          if (!rowMonth) return false;
          
          const rowMonthValue = rowMonth.getMonth() + 1;
          const rowYearValue = rowMonth.getFullYear();
          
          return sdrMatch && typeMatch && months.some(m => m.month === rowMonthValue && m.year === rowYearValue);
        })
        .reduce((sum: number, row: any) => sum + (Number(row.Valor) || 0), 0);
      
      if (meta > 0) {
        percentComplete = Math.round((valorRealizado / meta) * 100);
      }
    } else if (metric === "reunioesAcontecidas") {
      // Sum the metas for "Acontecidas OUT", "Acontecidas INB", "Acontecidas RECOM"
      const metaTypes = ["Acontecidas OUT", "Acontecidas INB", "Acontecidas RECOM"];
      meta = metaData
        .filter((row: any) => {
          const sdrMatch = !sdr || sdr === 'all' || row.SDR === sdr;
          const typeMatch = metaTypes.includes(row.Tipo);
          
          const rowMonth = row.Mês ? parseDate(row.Mês) : null;
          if (!rowMonth) return false;
          
          const rowMonthValue = rowMonth.getMonth() + 1;
          const rowYearValue = rowMonth.getFullYear();
          
          return sdrMatch && typeMatch && months.some(m => m.month === rowMonthValue && m.year === rowYearValue);
        })
        .reduce((sum: number, row: any) => sum + (Number(row.Valor) || 0), 0);
      
      if (meta > 0) {
        percentComplete = Math.round((valorRealizado / meta) * 100);
      }
    }
    
    // Format time if needed
    if (metric === "tempoLinha") {
      const hours = Math.floor(valorRealizado / 3600);
      const minutes = Math.floor((valorRealizado % 3600) / 60);
      const seconds = valorRealizado % 60;
      return {
        valorRealizado: valorRealizado, // return seconds for consistent calculations
        meta,
        percentComplete,
      };
    }
    
    return {
      valorRealizado,
      meta,
      percentComplete,
    };
  } catch (error) {
    console.error(`Error fetching SDR KPI data for ${metric}:`, error);
    return {
      valorRealizado: 0,
      meta: undefined,
      percentComplete: undefined,
    };
  }
};

export const fetchSdrPerformanceData = async (
  dateRange?: DateRange,
  sdr?: string
): Promise<SdrPerformanceData[]> => {
  try {
    // Load CSV files
    const performanceData = await loadCsvFile(CSV_PATHS.SDR_PERFORMANCE);
    const metaData = await loadCsvFile(CSV_PATHS.SDR_META);
    
    // Get unique SDRs
    const sdrFilter = sdr && sdr !== 'all' ? sdr : undefined;
    const sdrs = [...new Set(
      performanceData
        .filter((row: any) => !sdrFilter || row.SDR === sdrFilter)
        .map((row: any) => row.SDR)
    )];
    
    // Calculate metrics for each SDR
    const result: SdrPerformanceData[] = [];
    
    for (const sdrName of sdrs) {
      // Filter performance data by date range and SDR
      const filteredPerformance = performanceData.filter((row: any) => {
        const rowDate = parseDate(row.Data);
        return isDateInRange(rowDate, dateRange) && row.SDR === sdrName;
      });
      
      // Calculate metrics
      const leadsAtivados = filteredPerformance.reduce((sum: number, row: any) => 
        sum + (Number(row["Empresas Ativadas"]) || 0), 0);
      
      const conexoes = filteredPerformance.reduce((sum: number, row: any) => 
        sum + (Number(row["Novas Conexões Stakeholder"]) || 0), 0);
      
      const reunioesAgendadas = filteredPerformance.reduce((sum: number, row: any) => 
        sum + (Number(row["Marcadas Out"]) || 0) + 
              (Number(row["Marcadas Recom"]) || 0) + 
              (Number(row["Marcadas Inbound"]) || 0), 0);
      
      const reunioesAcontecidas = filteredPerformance.reduce((sum: number, row: any) => 
        sum + (Number(row["Show Out"]) || 0) + 
              (Number(row["Show Recom"]) || 0) + 
              (Number(row["Show Inbound"]) || 0), 0);
      
      const taxaLeadsConexoes = leadsAtivados > 0 ? (conexoes / leadsAtivados) * 100 : 0;
      const taxaConexoesAgendadas = conexoes > 0 ? (reunioesAgendadas / conexoes) * 100 : 0;
      const taxaAgendasAcontecidas = reunioesAgendadas > 0 ? (reunioesAcontecidas / reunioesAgendadas) * 100 : 0;
      
      // Add calculated metrics to result
      result.push({
        sdrName,
        leadsAtivados,
        reunioesAgendadas,
        reunioesAcontecidas,
        conexoes,
        taxaLeadsConexoes,
        taxaConexoesAgendadas,
        taxaAgendasAcontecidas,
      });
    }
    
    // Add a "Total Equipe" entry if multiple SDRs
    if (result.length > 1) {
      const totalLeadsAtivados = result.reduce((sum, sdr) => sum + sdr.leadsAtivados, 0);
      const totalConexoes = result.reduce((sum, sdr) => sum + sdr.conexoes, 0);
      const totalReunioesAgendadas = result.reduce((sum, sdr) => sum + sdr.reunioesAgendadas, 0);
      const totalReunioesAcontecidas = result.reduce((sum, sdr) => sum + sdr.reunioesAcontecidas, 0);
      
      const totalTaxaLeadsConexoes = totalLeadsAtivados > 0 ? (totalConexoes / totalLeadsAtivados) * 100 : 0;
      const totalTaxaConexoesAgendadas = totalConexoes > 0 ? (totalReunioesAgendadas / totalConexoes) * 100 : 0;
      const totalTaxaAgendasAcontecidas = totalReunioesAgendadas > 0 ? (totalReunioesAcontecidas / totalReunioesAgendadas) * 100 : 0;
      
      result.push({
        sdrName: 'Total Equipe',
        leadsAtivados: totalLeadsAtivados,
        reunioesAgendadas: totalReunioesAgendadas,
        reunioesAcontecidas: totalReunioesAcontecidas,
        conexoes: totalConexoes,
        taxaLeadsConexoes: totalTaxaLeadsConexoes,
        taxaConexoesAgendadas: totalTaxaConexoesAgendadas,
        taxaAgendasAcontecidas: totalTaxaAgendasAcontecidas,
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching SDR performance data:", error);
    return [];
  }
};

export const fetchSalesFunnelData = async (
  dateRange?: DateRange,
  sdr?: string
): Promise<SalesFunnelData[]> => {
  try {
    // Load CSV files
    const performanceData = await loadCsvFile(CSV_PATHS.SDR_PERFORMANCE);
    
    // Filter performance data by date range and SDR
    const filteredPerformance = performanceData.filter((row: any) => {
      const rowDate = parseDate(row.Data);
      const sdrMatch = !sdr || sdr === 'all' || row.SDR === sdr;
      return isDateInRange(rowDate, dateRange) && sdrMatch;
    });
    
    // Calculate funnel metrics
    const leadsAtivados = filteredPerformance.reduce((sum: number, row: any) => 
      sum + (Number(row["Empresas Ativadas"]) || 0), 0);
    
    const conexoes = filteredPerformance.reduce((sum: number, row: any) => 
      sum + (Number(row["Novas Conexões Stakeholder"]) || 0), 0);
    
    const reunioesAgendadas = filteredPerformance.reduce((sum: number, row: any) => 
      sum + (Number(row["Marcadas Out"]) || 0) + 
            (Number(row["Marcadas Recom"]) || 0) + 
            (Number(row["Marcadas Inbound"]) || 0), 0);
    
    const reunioesAcontecidas = filteredPerformance.reduce((sum: number, row: any) => 
      sum + (Number(row["Show Out"]) || 0) + 
            (Number(row["Show Recom"]) || 0) + 
            (Number(row["Show Inbound"]) || 0), 0);
    
    // Return funnel data in the expected format
    return [
      { etapa: "Leads Ativados", valor: leadsAtivados },
      { etapa: "Conexões", valor: conexoes },
      { etapa: "Reuniões Agendadas", valor: reunioesAgendadas },
      { etapa: "Reuniões Acontecidas", valor: reunioesAcontecidas },
    ];
  } catch (error) {
    console.error("Error fetching sales funnel data:", error);
    return [];
  }
};

// Function to fetch trend data over time
export const fetchSdrTrendData = async (
  dateRange?: DateRange,
  sdr?: string
): Promise<any[]> => {
  try {
    // Load CSV files
    const performanceData = await loadCsvFile(CSV_PATHS.SDR_PERFORMANCE);
    
    // Filter performance data by SDR
    const sdrFilter = sdr && sdr !== 'all' ? sdr : undefined;
    const filteredBySdr = performanceData.filter((row: any) => 
      !sdrFilter || row.SDR === sdrFilter
    );
    
    // Filter by date range if provided
    const filteredData = filteredBySdr.filter((row: any) => {
      const rowDate = parseDate(row.Data);
      return isDateInRange(rowDate, dateRange);
    });
    
    // Determine time granularity based on date range duration
    let granularity: 'day' | 'week' | 'month' = 'day';
    if (dateRange?.from && dateRange?.to) {
      const diffDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 90) {
        granularity = 'month';
      } else if (diffDays > 31) {
        granularity = 'week';
      }
    }
    
    // Group data by the determined granularity
    const groupedData = new Map();
    
    for (const row of filteredData) {
      const rowDate = parseDate(row.Data);
      if (!rowDate) continue;
      
      let periodKey: string;
      
      if (granularity === 'day') {
        periodKey = `${rowDate.getDate().toString().padStart(2, '0')}/${(rowDate.getMonth() + 1).toString().padStart(2, '0')}`;
      } else if (granularity === 'week') {
        // Get the ISO week number
        const weekNum = Math.ceil((rowDate.getDate() + (new Date(rowDate.getFullYear(), rowDate.getMonth(), 1).getDay())) / 7);
        periodKey = `Sem ${weekNum}/${(rowDate.getMonth() + 1).toString().padStart(2, '0')}`;
      } else {
        periodKey = `${(rowDate.getMonth() + 1).toString().padStart(2, '0')}/${rowDate.getFullYear()}`;
      }
      
      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, {
          periodo: periodKey,
          leadsAtivados: 0,
          reunioesAgendadas: 0,
          reunioesAcontecidas: 0,
        });
      }
      
      const periodData = groupedData.get(periodKey);
      
      periodData.leadsAtivados += Number(row["Empresas Ativadas"]) || 0;
      periodData.reunioesAgendadas += (Number(row["Marcadas Out"]) || 0) + 
                                     (Number(row["Marcadas Recom"]) || 0) + 
                                     (Number(row["Marcadas Inbound"]) || 0);
      periodData.reunioesAcontecidas += (Number(row["Show Out"]) || 0) + 
                                      (Number(row["Show Recom"]) || 0) + 
                                      (Number(row["Show Inbound"]) || 0);
    }
    
    // Convert the map to an array and sort by period
    const result = Array.from(groupedData.values());
    
    // Sort the result by period
    if (granularity === 'day') {
      result.sort((a, b) => {
        const [dayA, monthA] = a.periodo.split('/').map(Number);
        const [dayB, monthB] = b.periodo.split('/').map(Number);
        return monthA !== monthB ? monthA - monthB : dayA - dayB;
      });
    } else if (granularity === 'week') {
      result.sort((a, b) => {
        const [weekA, monthA] = a.periodo.substring(4).split('/').map(Number);
        const [weekB, monthB] = b.periodo.substring(4).split('/').map(Number);
        return monthA !== monthB ? monthA - monthB : weekA - weekB;
      });
    } else {
      result.sort((a, b) => {
        const [monthA, yearA] = a.periodo.split('/').map(Number);
        const [monthB, yearB] = b.periodo.split('/').map(Number);
        return yearA !== yearB ? yearA - yearB : monthA - monthB;
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching SDR trend data:", error);
    return [];
  }
};

export const fetchCloserKpiData = async (
  metric: string,
  dateRangeStart?: DateRange,
  dateRangeEnd?: DateRange,
  closer?: string,
  origin?: string
): Promise<KpiData> => {
  // Mock data - would be replaced with actual data processing
  return {
    valorRealizado: Math.floor(Math.random() * 10000),
    meta: Math.floor(Math.random() * 12000),
    percentComplete: Math.floor(Math.random() * 100),
  };
};

export const fetchCloserPerformanceData = async (
  dateRangeStart?: DateRange,
  dateRangeEnd?: DateRange,
  closer?: string,
  origin?: string
): Promise<CloserPerformanceData[]> => {
  // Mock data - would be replaced with actual data processing
  return [
    {
      closerName: "Gabriel",
      valorVendido: 85000,
      numVendas: 15,
      ticketMedio: 5667,
    },
    {
      closerName: "Célio",
      valorVendido: 95000,
      numVendas: 17,
      ticketMedio: 5588,
    },
  ];
};
