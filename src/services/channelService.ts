
import { DateRange } from "react-day-picker";
import { 
  fetchNegociacoesData,
  fetchEmpresaMetaData,
  fetchFilteredData, 
  parseDate
} from "./dataSourceService";
import { normalizeDateRange } from "./utils/dateUtils";
import { Database } from "@/integrations/supabase/types";

// Type definitions for Meta Empresa data
type MetaEmpresa = Database['public']['Tables']['Meta Empresa']['Row'];

// Fetch channels data with dynamically populated channels
export const fetchChannelsData = async (dateRange?: DateRange) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch negotiations data from Supabase
    const negociacoesData = await fetchFilteredData('negociacoes', normalizedDateRange);
    
    // Get empresa_meta data for meta values
    const empresaMetaData = await fetchEmpresaMetaData();
    
    // Dynamically get unique channels from the ORIGEM column
    const channels = Array.from(new Set(negociacoesData
      .map((row: any) => row.ORIGEM)
      .filter(Boolean))); // Filter out undefined/null values
    
    // If no channels found, use default list
    if (channels.length === 0) {
      channels.push('Leadbroker', 'Outbound', 'Recomendação');
    }
    
    const channelsPerformance = channels.map(channel => {
      // Filter negotiations by channel
      const channelNegotiations = negociacoesData.filter((row: any) => 
        row.ORIGEM === channel
      );
      
      const totalNegotiations = channelNegotiations.length;
      
      const totalValue = channelNegotiations.reduce((sum: number, row: any) => 
        sum + (row.VALOR || 0), 0);
      
      const avgTicket = totalNegotiations > 0 
        ? totalValue / totalNegotiations 
        : 0;
      
      // Get meta for the channel
      const fromMonth = normalizedDateRange.from.getMonth() + 1;
      const fromYear = normalizedDateRange.from.getFullYear();
      
      const channelMeta = empresaMetaData.filter((row) => {
        if (!row.Mês) return false;
        
        const rowDate = parseDate(row.Mês);
        const rowMonth = rowDate.getMonth() + 1;
        const rowYear = rowDate.getFullYear();
        
        return rowMonth === fromMonth && 
               rowYear === fromYear && 
               row.Canal === channel;
      }) as MetaEmpresa[];
      
      // Access values with proper type handling for Meta Empresa rows
      let mrrMeta = 0;
      let oneTimeMeta = 0;
      
      const mrrMetaRow = channelMeta.find((row) => row.Tipo === 'MRR');
      if (mrrMetaRow && mrrMetaRow.Valor !== null) {
        mrrMeta = mrrMetaRow.Valor;
      }
      
      const oneTimeMetaRow = channelMeta.find((row) => row.Tipo === 'One Time');
      if (oneTimeMetaRow && oneTimeMetaRow.Valor !== null) {
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

// Fetch lead broker data with correct calculation logic
export const fetchLeadBrokerPerformanceData = async (dateRange?: DateRange) => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch lead broker data from Supabase
    const leadBrokerData = await fetchFilteredData('leadbroker', normalizedDateRange);
    
    // Get related negotiations data for sales/conversions
    const negociacoesData = await fetchFilteredData('negociacoes', normalizedDateRange);
    
    // Calculate lead acquisition costs
    const totalLeadsCost = leadBrokerData.reduce((sum: number, row: any) => 
      sum + (row.VALOR || 0), 0);
    
    const totalLeadsCount = leadBrokerData.length;
    
    const avgCostPerLead = totalLeadsCount > 0 
      ? totalLeadsCost / totalLeadsCount 
      : 0;
    
    // Get converted leads - leads with matching CNPJs in the negotiations table
    const leadBrokerCNPJs = leadBrokerData
      .map((row: any) => row.CNPJ)
      .filter(Boolean);
    
    // Find negotiations that came from leads (matching CNPJs)
    const leadNegotiations = negociacoesData.filter((row: any) => 
      row.CNPJ && leadBrokerCNPJs.includes(row.CNPJ)
    );
    
    const convertedLeads = leadNegotiations.length;
    
    const conversionRate = totalLeadsCount > 0 
      ? (convertedLeads / totalLeadsCount) * 100 
      : 0;
    
    // Calculate revenue from converted leads using the Negociacoes table
    const totalRevenue = leadNegotiations.reduce((sum: number, row: any) => 
      sum + (row.VALOR || 0), 0);
    
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
