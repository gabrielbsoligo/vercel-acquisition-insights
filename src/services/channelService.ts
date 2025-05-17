
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

// Improved interface for channel data
export interface ChannelPerformance {
  channel: string;
  totalNegotiations: number;
  totalValue: number;
  avgTicket: number;
  meta: number;
  percentComplete: number;
}

// Extended interface with product data
export interface ChannelProductAnalysis {
  channel: string;
  product: string;
  quantity: number;
  value: number;
}

// Interface for loss reasons
export interface ChannelLossReason {
  channel: string;
  reason: string;
  count: number;
  percentage: number;
}

// Fetch channels data with dynamically populated channels
export const fetchChannelsData = async (dateRange?: DateRange): Promise<ChannelPerformance[]> => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch negotiations data from Supabase
    const negociacoesData = await fetchFilteredData('negociacoes', normalizedDateRange);
    
    // Get empresa_meta data for meta values
    const empresaMetaData = await fetchEmpresaMetaData() as MetaEmpresa[];
    
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
      
      // Type assertion to ensure empresaMetaData rows are correctly typed
      const channelMeta = empresaMetaData.filter((row: MetaEmpresa) => {
        if (!row.Mês) return false;
        
        const rowDate = parseDate(row.Mês);
        const rowMonth = rowDate.getMonth() + 1;
        const rowYear = rowDate.getFullYear();
        
        return rowMonth === fromMonth && 
               rowYear === fromYear && 
               row.Canal === channel;
      });
      
      // Access values with proper type handling for Meta Empresa rows
      let mrrMeta = 0;
      let oneTimeMeta = 0;
      
      const mrrMetaRow = channelMeta.find((row: MetaEmpresa) => row.Tipo === 'MRR');
      if (mrrMetaRow && mrrMetaRow.Valor !== null) {
        mrrMeta = mrrMetaRow.Valor;
      }
      
      const oneTimeMetaRow = channelMeta.find((row: MetaEmpresa) => row.Tipo === 'One Time');
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

// Get product analysis by channel
export const fetchChannelProductAnalysis = async (dateRange?: DateRange, selectedChannel: string = 'all'): Promise<ChannelProductAnalysis[]> => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch negotiations data from Supabase
    const negociacoesData = await fetchFilteredData('negociacoes', normalizedDateRange);
    
    // Group by channel and product
    const productAnalysis: ChannelProductAnalysis[] = [];
    
    // Process each negotiation
    negociacoesData.forEach((nego: any) => {
      const channel = nego.ORIGEM;
      const product = nego.PRODUTO;
      
      // Skip if channel or product is missing, or if filtering by channel and not matching
      if (!channel || !product || (selectedChannel !== 'all' && channel !== selectedChannel)) {
        return;
      }
      
      // Find existing entry or create new one
      let entry = productAnalysis.find(pa => pa.channel === channel && pa.product === product);
      if (!entry) {
        entry = {
          channel,
          product,
          quantity: 0,
          value: 0
        };
        productAnalysis.push(entry);
      }
      
      // Update counts
      entry.quantity += 1;
      entry.value += (nego.VALOR || 0);
    });
    
    // Sort by value descending
    return productAnalysis.sort((a, b) => b.value - a.value);
  } catch (error) {
    console.error('Error fetching channel product analysis:', error);
    return [];
  }
};

// Get loss reasons by channel
export const fetchChannelLossReasons = async (dateRange?: DateRange, selectedChannel: string = 'all'): Promise<ChannelLossReason[]> => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Fetch negotiations data from Supabase
    const negociacoesData = await fetchFilteredData('negociacoes', normalizedDateRange);
    
    // Get negotiations that were lost
    const lostNegotiations = negociacoesData.filter((nego: any) => 
      nego.STATUS === 'Perdido' || nego.STATUS === 'Perda'
    );
    
    // Group by channel and loss reason
    const channelLossMap: Record<string, Record<string, number>> = {};
    const channelTotalLosses: Record<string, number> = {};
    
    // Process each lost negotiation
    lostNegotiations.forEach((nego: any) => {
      const channel = nego.ORIGEM;
      const reason = nego.MOTIVOS_DE_PERDA || 'Não informado';
      
      // Skip if filtering by channel and not matching
      if (!channel || (selectedChannel !== 'all' && channel !== selectedChannel)) {
        return;
      }
      
      // Initialize channel map if needed
      if (!channelLossMap[channel]) {
        channelLossMap[channel] = {};
        channelTotalLosses[channel] = 0;
      }
      
      // Update loss reason count
      channelLossMap[channel][reason] = (channelLossMap[channel][reason] || 0) + 1;
      channelTotalLosses[channel] += 1;
    });
    
    // Convert to array format
    const lossReasons: ChannelLossReason[] = [];
    
    Object.entries(channelLossMap).forEach(([channel, reasons]) => {
      const totalForChannel = channelTotalLosses[channel];
      
      Object.entries(reasons).forEach(([reason, count]) => {
        lossReasons.push({
          channel,
          reason,
          count,
          percentage: (count / totalForChannel) * 100
        });
      });
    });
    
    // Sort by count descending within each channel
    return lossReasons.sort((a, b) => {
      if (a.channel === b.channel) {
        return b.count - a.count;
      }
      return a.channel.localeCompare(b.channel);
    });
  } catch (error) {
    console.error('Error fetching channel loss reasons:', error);
    return [];
  }
};

// Get monthly progress data for a specific channel and month
export const fetchChannelMonthlyProgress = async (
  channel: string,
  month: number,
  year: number
): Promise<any[]> => {
  try {
    // Create date range for the selected month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month
    
    const dateRange = { from: startDate, to: endDate };
    
    // Fetch negotiations data from Supabase
    const negociacoesData = await fetchFilteredData('negociacoes', dateRange);
    
    // Filter by channel
    const channelNegotiations = negociacoesData.filter((nego: any) => 
      nego.ORIGEM === channel
    );
    
    // Get meta for the channel for this month
    const empresaMetaData = await fetchEmpresaMetaData() as MetaEmpresa[];
    
    // Find relevant meta entries
    const channelMeta = empresaMetaData.filter((row: MetaEmpresa) => {
      if (!row.Mês) return false;
      
      const rowDate = parseDate(row.Mês);
      const rowMonth = rowDate.getMonth() + 1;
      const rowYear = rowDate.getFullYear();
      
      return rowMonth === month && rowYear === year && row.Canal === channel;
    });
    
    // Calculate total meta
    let totalMeta = 0;
    
    const mrrMetaRow = channelMeta.find((row: MetaEmpresa) => row.Tipo === 'MRR');
    if (mrrMetaRow && mrrMetaRow.Valor !== null) {
      totalMeta += mrrMetaRow.Valor;
    }
    
    const oneTimeMetaRow = channelMeta.find((row: MetaEmpresa) => row.Tipo === 'One Time');
    if (oneTimeMetaRow && oneTimeMetaRow.Valor !== null) {
      totalMeta += oneTimeMetaRow.Valor;
    }
    
    // Create daily data points (simplification - real data would need to be grouped by date)
    const daysInMonth = new Date(year, month, 0).getDate();
    const progressData = [];
    
    // Group negotiations by date
    const valueByDay: Record<number, number> = {};
    
    channelNegotiations.forEach((nego: any) => {
      if (nego.DATA_DO_FEC) {
        const fechDate = parseDate(nego.DATA_DO_FEC);
        const day = fechDate.getDate();
        
        valueByDay[day] = (valueByDay[day] || 0) + (nego.VALOR || 0);
      }
    });
    
    // Calculate ideal daily target (linear progression)
    const dailyTarget = totalMeta / daysInMonth;
    
    // Create progress data points
    let cumulativeActual = 0;
    let cumulativeIdeal = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      cumulativeActual += (valueByDay[day] || 0);
      cumulativeIdeal += dailyTarget;
      
      // Only include data points for days that have passed or have data
      const currentDay = new Date();
      if (new Date(year, month - 1, day) <= currentDay || valueByDay[day]) {
        progressData.push({
          dia: day,
          atingimentoAcumulado: cumulativeActual,
          idealAcumulado: cumulativeIdeal
        });
      }
    }
    
    return progressData;
  } catch (error) {
    console.error('Error fetching channel monthly progress:', error);
    return [];
  }
};
