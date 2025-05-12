
import { DateRange } from "react-day-picker";
import { 
  fetchNegociacoesData,
  fetchEmpresaMetaData,
  fetchFilteredData, 
  parseDate
} from "./dataSourceService";
import { normalizeDateRange } from "./utils/dateUtils";

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
        row.ORIGEM === channel
      );
      
      const totalNegotiations = channelNegotiations.length;
      
      const totalValue = channelNegotiations.reduce((sum: number, row: any) => 
        sum + (Number(row.VALOR) || 0), 0);
      
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
      
      // Access values using safe type checking
      let mrrMeta = 0;
      let oneTimeMeta = 0;
      
      const mrrMetaRow = channelMeta.find((row: any) => row.Tipo === 'MRR');
      if (mrrMetaRow && typeof mrrMetaRow.Valor === 'number') {
        mrrMeta = mrrMetaRow.Valor;
      }
      
      const oneTimeMetaRow = channelMeta.find((row: any) => row.Tipo === 'One Time');
      if (oneTimeMetaRow && typeof oneTimeMetaRow.Valor === 'number') {
        oneTimeMeta = oneTimeMetaRow.Valor;
      }
      
      const totalMeta = mrrMeta + oneTimeMeta;
      
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
    const leadBrokerData = await fetchFilteredData('leadbroker', normalizedDateRange);
    
    // Calculate performance metrics
    const totalLeadsCost = leadBrokerData.reduce((sum: number, row: any) => 
      sum + (Number(row.VALOR) || 0), 0);
    
    const totalLeadsCount = leadBrokerData.length;
    
    const avgCostPerLead = totalLeadsCount > 0 
      ? totalLeadsCost / totalLeadsCount 
      : 0;
    
    // Get converted leads
    const convertedLeads = leadBrokerData.filter((row: any) => 
      row.STATUS === 'Convertido'
    ).length;
    
    const conversionRate = totalLeadsCount > 0 
      ? (convertedLeads / totalLeadsCount) * 100 
      : 0;
    
    // Calculate ROI
    const totalRevenue = leadBrokerData.reduce((sum: number, row: any) => {
      if (row.STATUS === 'Convertido') {
        return sum + (Number(row.VALOR) || 0);
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
