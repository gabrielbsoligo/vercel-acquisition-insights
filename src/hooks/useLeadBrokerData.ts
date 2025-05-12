
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import {
  fetchLeadBrokerData,
  getChannelPerformanceData,
  getProductPerformanceData,
  getQualityConversionData,
  LeadBrokerData
} from "@/services/leadBrokerService";
import { useToast } from "@/hooks/use-toast";

// Helper function to calculate trend data
const calculateTrendData = (rawData: LeadBrokerData[]) => {
  // Group by date and calculate metrics
  const dataByDate = rawData.reduce((acc: Record<string, any>, item) => {
    if (!item.DATA_DA_COMPRA) return acc;
    
    // Format date as DD/MM
    const date = new Date(item.DATA_DA_COMPRA);
    const dateKey = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        periodo: dateKey,
        leads: 0,
        investimento: 0,
        vendas: 0,
        valorVendido: 0,
      };
    }
    
    // Count leads and investment
    acc[dateKey].leads += 1;
    acc[dateKey].investimento += 1000; // Assuming 1000 per lead
    
    // Check if it's a sale
    if (item.STATUS === 'Vendido' || item.STATUS === 'Venda') {
      acc[dateKey].vendas += 1;
      acc[dateKey].valorVendido += (item.VALOR || 0);
    }
    
    return acc;
  }, {});
  
  // Convert to array and calculate metrics
  return Object.values(dataByDate).map((day: any) => {
    return {
      periodo: day.periodo,
      cpl: day.leads > 0 ? Math.round(day.investimento / day.leads) : 0,
      cac: day.vendas > 0 ? Math.round(day.investimento / day.vendas) : 0,
      roas: day.investimento > 0 ? parseFloat((day.valorVendido / day.investimento).toFixed(1)) : 0,
    };
  });
};

// Helper function to calculate funnel stages
const calculateFunnelData = (rawData: LeadBrokerData[]) => {
  // Count leads
  const leadsComprados = rawData.length;
  
  // Count connections/engagement (leads that were contacted)
  const conexaoEngajamento = rawData.filter(lead => 
    lead.STATUS && !['Lead Comprado', 'Novo Lead', 'Não Qualificado'].includes(lead.STATUS)
  ).length;
  
  // Count scheduled meetings
  const reuniaoMarcada = rawData.filter(lead => 
    lead.STATUS === 'Reunião Marcada'
  ).length;
  
  // Count meetings that happened
  const reuniaoAcontecida = rawData.filter(lead => 
    lead.STATUS === 'Reunião Acontecida'
  ).length;
  
  // Count sales
  const vendas = rawData.filter(lead => 
    lead.STATUS === 'Vendido' || lead.STATUS === 'Venda'
  ).length;
  
  return [
    { etapa: "Leads Comprados", valor: leadsComprados },
    { etapa: "Conexão/Engajamento", valor: conexaoEngajamento },
    { etapa: "Reunião Marcada", valor: reuniaoMarcada },
    { etapa: "Reunião Acontecida", valor: reuniaoAcontecida },
    { etapa: "Vendas", valor: vendas },
  ];
};

// Helper to calculate summary KPIs
const calculateSummaryKPIs = (channelData: any[]) => {
  // Calculate totals
  const totals = channelData.reduce((acc, channel) => {
    acc.leadsComprados += channel.leadsComprados;
    acc.investimento += channel.investimento;
    acc.vendas += channel.vendas;
    acc.valorVendido += channel.valorVendido;
    return acc;
  }, { leadsComprados: 0, investimento: 0, vendas: 0, valorVendido: 0 });

  // Calculate derived metrics
  const cpl = totals.leadsComprados > 0 ? Math.round(totals.investimento / totals.leadsComprados) : 0;
  const txConversao = totals.leadsComprados > 0 ? parseFloat(((totals.vendas / totals.leadsComprados) * 100).toFixed(1)) : 0;
  const cac = totals.vendas > 0 ? Math.round(totals.investimento / totals.vendas) : 0;
  const roas = totals.investimento > 0 ? parseFloat((totals.valorVendido / totals.investimento).toFixed(2)) : 0;
  const ticketMedio = totals.vendas > 0 ? Math.round(totals.valorVendido / totals.vendas) : 0;

  return {
    investimento: totals.investimento,
    leadsComprados: totals.leadsComprados,
    cpl,
    vendas: totals.vendas,
    valorVendido: totals.valorVendido,
    txConversao,
    cac,
    roas,
    ticketMedio
  };
};

export function useLeadBrokerData() {
  const { toast } = useToast();
  
  // Update default date range to be more inclusive (3 months)
  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  const [dateRangeLead, setDateRangeLead] = useState<DateRange | undefined>({
    from: threeMonthsAgo,
    to: today,
  });
  
  const [dateRangeSale, setDateRangeSale] = useState<DateRange | undefined>({
    from: threeMonthsAgo,
    to: today,
  });
  
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  
  // State for chart data
  const [trendData, setTrendData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [summaryKPIs, setSummaryKPIs] = useState<any>({
    investimento: 0,
    leadsComprados: 0,
    cpl: 0,
    vendas: 0,
    valorVendido: 0,
    txConversao: 0,
    cac: 0,
    roas: 0,
    ticketMedio: 0
  });
  
  // Fetch lead broker data
  const { data: leadBrokerData, isLoading: loadingLeadBroker, error: leadBrokerError } = useQuery({
    queryKey: ['leadBrokerData', dateRangeLead, selectedChannel, selectedProduct],
    queryFn: () => fetchLeadBrokerData(dateRangeLead, selectedChannel, selectedProduct),
  });
  
  // Fetch channel performance data
  const { data: channelPerformanceData, isLoading: loadingChannelData } = useQuery({
    queryKey: ['channelPerformance', dateRangeLead, selectedChannel, selectedProduct],
    queryFn: () => getChannelPerformanceData(dateRangeLead, selectedChannel, selectedProduct),
  });
  
  // Fetch product performance data
  const { data: productPerformanceData, isLoading: loadingProductData } = useQuery({
    queryKey: ['productPerformance', dateRangeLead, selectedChannel, selectedProduct],
    queryFn: () => getProductPerformanceData(dateRangeLead, selectedChannel, selectedProduct),
  });
  
  // Fetch quality conversion data
  const { data: qualityConversionData, isLoading: loadingQualityData } = useQuery({
    queryKey: ['qualityConversion', dateRangeLead, selectedChannel, selectedProduct],
    queryFn: () => getQualityConversionData(dateRangeLead, selectedChannel, selectedProduct),
  });
  
  // Calculate metrics from raw data
  useEffect(() => {
    if (leadBrokerData && leadBrokerData.length > 0) {
      // Calculate trend data
      setTrendData(calculateTrendData(leadBrokerData));
      
      // Calculate funnel data
      setFunnelData(calculateFunnelData(leadBrokerData));
    } else if (leadBrokerData && leadBrokerData.length === 0) {
      // Empty data set
      setTrendData([]);
      setFunnelData([]);
    }
  }, [leadBrokerData]);
  
  // Calculate summary KPIs
  useEffect(() => {
    if (channelPerformanceData && channelPerformanceData.length > 0) {
      setSummaryKPIs(calculateSummaryKPIs(channelPerformanceData));
    }
  }, [channelPerformanceData]);
  
  // Show error toast if data fetching fails
  useEffect(() => {
    if (leadBrokerError) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do Lead Broker. Tente novamente mais tarde.",
        variant: "destructive",
      });
      console.error("Lead Broker data fetch error:", leadBrokerError);
    }
  }, [leadBrokerError, toast]);

  return {
    // Filters
    dateRangeLead,
    setDateRangeLead,
    dateRangeSale,
    setDateRangeSale,
    selectedChannel,
    setSelectedChannel,
    selectedProduct,
    setSelectedProduct,
    
    // Data
    leadBrokerData,
    channelPerformanceData,
    productPerformanceData,
    qualityConversionData,
    trendData,
    funnelData,
    summaryKPIs,
    
    // States
    isLoading: loadingLeadBroker || loadingChannelData || loadingProductData || loadingQualityData,
    hasError: !!leadBrokerError
  };
}
