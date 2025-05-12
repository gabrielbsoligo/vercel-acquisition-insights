
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
    
    // Calculate funnel metrics with safe type checking
    const leadsAtivados = sdrPerformanceData.reduce((sum: number, row: any) => {
      const value = row['Empresas Ativadas'];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
      
    const conexoes = sdrPerformanceData.reduce((sum: number, row: any) => {
      const value = row['Novas Conexões Stakeholder'];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
      
    const reunioesAgendadas = sdrPerformanceData.reduce((sum: number, row: any) => {
      const marcadasOut = row['Marcadas Out'];
      const marcadasRecom = row['Marcadas Recom'];
      const marcadasInbound = row['Marcadas Inbound'];
      
      return sum + 
        (typeof marcadasOut === 'number' ? marcadasOut : 0) + 
        (typeof marcadasRecom === 'number' ? marcadasRecom : 0) + 
        (typeof marcadasInbound === 'number' ? marcadasInbound : 0);
    }, 0);
      
    const reunioesAcontecidas = sdrPerformanceData.reduce((sum: number, row: any) => {
      const showOut = row['Show Out'];
      const showRecom = row['Show Recom'];
      const showInbound = row['Show Inbound'];
      
      return sum + 
        (typeof showOut === 'number' ? showOut : 0) + 
        (typeof showRecom === 'number' ? showRecom : 0) + 
        (typeof showInbound === 'number' ? showInbound : 0);
    }, 0);
    
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
