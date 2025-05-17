
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchChannelsData, 
  fetchChannelProductAnalysis, 
  fetchChannelLossReasons,
  fetchChannelMonthlyProgress,
  ChannelPerformance,
  ChannelProductAnalysis,
  ChannelLossReason
} from '@/services/channelService';
import { useToast } from "@/hooks/use-toast";

export function useChannelsData() {
  const { toast } = useToast();
  
  // Date ranges for start and end of sales process
  const [dateRangeStart, setDateRangeStart] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
    to: new Date(),
  });
  
  const [dateRangeEnd, setDateRangeEnd] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
    to: new Date(),
  });
  
  // Selected channel for filtering
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  
  // Month selection for monthly progress
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Fetch channels data
  const { 
    data: channelsData, 
    isLoading: loadingChannelsData,
    error: channelsError 
  } = useQuery({
    queryKey: ['channelsData', dateRangeStart],
    queryFn: () => fetchChannelsData(dateRangeStart),
  });
  
  // Fetch product analysis data
  const { 
    data: productAnalysis, 
    isLoading: loadingProductAnalysis 
  } = useQuery({
    queryKey: ['channelProductAnalysis', dateRangeStart, selectedChannel],
    queryFn: () => fetchChannelProductAnalysis(dateRangeStart, selectedChannel),
  });
  
  // Fetch loss reason data
  const { 
    data: lossReasons, 
    isLoading: loadingLossReasons 
  } = useQuery({
    queryKey: ['channelLossReasons', dateRangeStart, selectedChannel],
    queryFn: () => fetchChannelLossReasons(dateRangeStart, selectedChannel),
  });
  
  // Fetch monthly progress data
  const { 
    data: monthlyProgress, 
    isLoading: loadingMonthlyProgress 
  } = useQuery({
    queryKey: ['channelMonthlyProgress', selectedChannel, selectedMonth, selectedYear],
    queryFn: () => fetchChannelMonthlyProgress(selectedChannel !== 'all' ? selectedChannel : 'Leadbroker', selectedMonth, selectedYear),
  });
  
  // Derived data for charts and tables
  const [channelComparisonData, setChannelComparisonData] = useState<any[]>([]);
  const [pieChartData, setPieChartData] = useState<any[]>([]);
  const [goalVsAchievedData, setGoalVsAchievedData] = useState<any[]>([]);
  
  // Process channel data for visualizations
  useEffect(() => {
    if (channelsData && channelsData.length > 0) {
      // Set data for charts
      setChannelComparisonData(channelsData.map(channel => ({
        canal: channel.channel,
        valorVendido: channel.totalValue,
        numVendas: channel.totalNegotiations
      })));
      
      // Calculate total value for percentage
      const totalValue = channelsData.reduce((sum, channel) => sum + channel.totalValue, 0);
      
      // Create pie chart data
      setPieChartData(channelsData.map(channel => ({
        name: channel.channel,
        value: totalValue > 0 ? Math.round((channel.totalValue / totalValue) * 100 * 10) / 10 : 0
      })));
      
      // Create goals vs achieved data
      setGoalVsAchievedData(channelsData.map(channel => ({
        mes: new Date().toLocaleString('pt-BR', { month: 'long' }),
        canal: channel.channel,
        realizadoValor: channel.totalValue,
        metaValorTotal: channel.meta,
        realizadoMRR: channel.totalValue * 0.7, // Estimate for demo
        metaMRR: channel.meta * 0.7, // Estimate for demo
        realizadoOneTime: channel.totalValue * 0.3, // Estimate for demo
        metaOneTime: channel.meta * 0.3 // Estimate for demo
      })));
    }
  }, [channelsData]);
  
  // Show error toast if data fetching fails
  useEffect(() => {
    if (channelsError) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados dos canais. Tente novamente mais tarde.",
        variant: "destructive",
      });
      console.error("Channel data fetch error:", channelsError);
    }
  }, [channelsError, toast]);
  
  return {
    // Date ranges
    dateRangeStart,
    setDateRangeStart,
    dateRangeEnd,
    setDateRangeEnd,
    
    // Filters
    selectedChannel,
    setSelectedChannel,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    
    // Raw data
    channelsData,
    productAnalysis,
    lossReasons,
    monthlyProgress,
    
    // Processed data for charts
    channelComparisonData,
    pieChartData,
    goalVsAchievedData,
    
    // Loading states
    isLoading: loadingChannelsData || loadingProductAnalysis || loadingLossReasons || loadingMonthlyProgress,
    hasError: !!channelsError
  };
}
