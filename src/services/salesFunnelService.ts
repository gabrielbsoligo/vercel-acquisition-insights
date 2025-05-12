
import { DateRange } from "react-day-picker";
import { fetchFilteredData } from "./dataSourceService";
import { normalizeDateRange } from "./utils/dateUtils";

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
    
    // Calculate funnel metrics with improved type handling
    const leadsAtivados = sdrPerformanceData.reduce((sum: number, row: any) => 
      sum + (row['Empresas Ativadas'] || 0), 0);
      
    const conexoes = sdrPerformanceData.reduce((sum: number, row: any) => 
      sum + (row['Novas Conexões Stakeholder'] || 0), 0);
      
    const reunioesAgendadas = sdrPerformanceData.reduce((sum: number, row: any) => 
      sum + 
      (row['Marcadas Out'] || 0) + 
      (row['Marcadas Recom'] || 0) + 
      (row['Marcadas Inbound'] || 0), 0);
      
    const reunioesAcontecidas = sdrPerformanceData.reduce((sum: number, row: any) => 
      sum + 
      (row['Show Out'] || 0) + 
      (row['Show Recom'] || 0) + 
      (row['Show Inbound'] || 0), 0);
    
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
