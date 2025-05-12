
import { DateRange } from "react-day-picker";
import { fetchFilteredData } from "./queryService";
import { normalizeDateRange } from "./utils/dateUtils";

// Internal name for the LeadBroker table
const LEAD_BROKER_TABLE = 'leadbroker';

// Define types for Lead Broker data
export interface LeadBrokerData {
  ID?: number;
  CANAL?: string;
  CNPJ?: string;
  DATA_DA_COMPRA?: string | Date;
  EMPRESAS?: string;
  FATURAMENTO?: string;
  MOTIVO_DE_PERDA?: string;
  NOME?: string;
  PRODUTO?: string;
  SDR?: string;
  STATUS?: string;
  TELEFONE?: string;
  VALOR?: number;
}

export interface ChannelPerformance {
  canalInterno: string;
  leadsComprados: number;
  investimento: number;
  cpl: number;
  vendas: number;
  valorVendido: number;
  txConversao: number;
  cac: number;
  roas: number;
}

export interface ProductPerformance {
  produto: string;
  leadsComprados: number;
  investimento: number;
  cpl: number;
  vendas: number;
  valorVendido: number;
  txConversao: number;
  cac: number;
  roas: number;
}

export interface QualityConversionData {
  faixaFaturamento: string;
  leadsComprados: number;
  vendas: number;
  txConversao: number;
}

/**
 * Fetches Lead Broker data from Supabase
 */
export const fetchLeadBrokerData = async (
  dateRange?: DateRange,
  channel?: string,
  product?: string
): Promise<LeadBrokerData[]> => {
  try {
    const normalizedDateRange = normalizeDateRange(dateRange);
    
    // Prepare additional filters if channel or product is specified
    let additionalFilters: Record<string, any> = {};
    
    if (channel && channel !== 'all') {
      additionalFilters.CANAL = channel;
    }
    
    if (product && product !== 'all') {
      additionalFilters.PRODUTO = product;
    }
    
    console.log('Fetching Lead Broker data with filters:', additionalFilters);
    
    // Fetch data from Supabase
    const data = await fetchFilteredData(
      LEAD_BROKER_TABLE,
      normalizedDateRange,
      additionalFilters
    );
    
    // Return the data with the expected structure
    return data.map(item => ({
      ID: item.ID,
      CANAL: item.CANAL,
      CNPJ: item.CNPJ,
      DATA_DA_COMPRA: item['DATA DA COMPRA'],
      EMPRESAS: item.EMPRESAS,
      FATURAMENTO: item.FATURAMENTO,
      MOTIVO_DE_PERDA: item['MOTIVO DE PERDA'],
      NOME: item.NOME,
      PRODUTO: item.PRODUTO,
      SDR: item.SDR,
      STATUS: item.STATUS,
      TELEFONE: item.TELEFONE,
      VALOR: item.VALOR
    }));
  } catch (error) {
    console.error('Error fetching Lead Broker data:', error);
    return [];
  }
};

/**
 * Calculate performance metrics by channel
 */
export const getChannelPerformanceData = async (
  dateRange?: DateRange,
  selectedChannel?: string,
  selectedProduct?: string
): Promise<ChannelPerformance[]> => {
  try {
    // Fetch raw data
    const rawData = await fetchLeadBrokerData(dateRange, 
      selectedChannel !== 'all' ? selectedChannel : undefined, 
      selectedProduct !== 'all' ? selectedProduct : undefined
    );
    
    if (!rawData.length) {
      console.log('No lead broker data found, returning empty channel performance');
      return [];
    }
    
    // Group by channel
    const channelGroups = rawData.reduce((acc: Record<string, LeadBrokerData[]>, item) => {
      const channel = item.CANAL || 'Undefined';
      if (!acc[channel]) {
        acc[channel] = [];
      }
      acc[channel].push(item);
      return acc;
    }, {});
    
    // Calculate metrics for each channel
    return Object.entries(channelGroups).map(([channel, leads]) => {
      const leadsComprados = leads.length;
      
      // Calculate investment (assume 1000 per lead as default)
      const cpl = 1000; // Default CPL, could be calculated from actual data
      const investimento = leadsComprados * cpl;
      
      // Count sales
      const sales = leads.filter(lead => lead.STATUS === 'Vendido' || lead.STATUS === 'Venda').length;
      
      // Calculate total sales amount
      const salesAmount = leads
        .filter(lead => lead.STATUS === 'Vendido' || lead.STATUS === 'Venda')
        .reduce((sum, lead) => sum + (lead.VALOR || 0), 0);
      
      // Calculate conversion rate
      const conversionRate = leadsComprados > 0 ? (sales / leadsComprados) * 100 : 0;
      
      // Calculate CAC
      const cac = sales > 0 ? investimento / sales : 0;
      
      // Calculate ROAS
      const roas = investimento > 0 ? salesAmount / investimento : 0;
      
      return {
        canalInterno: channel,
        leadsComprados,
        investimento,
        cpl,
        vendas: sales,
        valorVendido: salesAmount,
        txConversao: parseFloat(conversionRate.toFixed(1)),
        cac: cac > 0 ? parseFloat(cac.toFixed(0)) : 0,
        roas: parseFloat(roas.toFixed(1))
      };
    });
  } catch (error) {
    console.error('Error generating channel performance data:', error);
    return [];
  }
};

/**
 * Calculate performance metrics by product
 */
export const getProductPerformanceData = async (
  dateRange?: DateRange,
  selectedChannel?: string,
  selectedProduct?: string
): Promise<ProductPerformance[]> => {
  try {
    // Fetch raw data
    const rawData = await fetchLeadBrokerData(dateRange, 
      selectedChannel !== 'all' ? selectedChannel : undefined, 
      selectedProduct !== 'all' ? selectedProduct : undefined
    );
    
    if (!rawData.length) {
      console.log('No lead broker data found, returning empty product performance');
      return [];
    }
    
    // Group by product
    const productGroups = rawData.reduce((acc: Record<string, LeadBrokerData[]>, item) => {
      const product = item.PRODUTO || 'Undefined';
      if (!acc[product]) {
        acc[product] = [];
      }
      acc[product].push(item);
      return acc;
    }, {});
    
    // Calculate metrics for each product
    return Object.entries(productGroups).map(([product, leads]) => {
      const leadsComprados = leads.length;
      
      // Calculate investment (assume 1000 per lead as default)
      const cpl = 1000; // Default CPL, could be calculated from actual data
      const investimento = leadsComprados * cpl;
      
      // Count sales
      const sales = leads.filter(lead => lead.STATUS === 'Vendido' || lead.STATUS === 'Venda').length;
      
      // Calculate total sales amount
      const salesAmount = leads
        .filter(lead => lead.STATUS === 'Vendido' || lead.STATUS === 'Venda')
        .reduce((sum, lead) => sum + (lead.VALOR || 0), 0);
      
      // Calculate conversion rate
      const conversionRate = leadsComprados > 0 ? (sales / leadsComprados) * 100 : 0;
      
      // Calculate CAC
      const cac = sales > 0 ? investimento / sales : 0;
      
      // Calculate ROAS
      const roas = investimento > 0 ? salesAmount / investimento : 0;
      
      return {
        produto: product,
        leadsComprados,
        investimento,
        cpl,
        vendas: sales,
        valorVendido: salesAmount,
        txConversao: parseFloat(conversionRate.toFixed(1)),
        cac: cac > 0 ? parseFloat(cac.toFixed(0)) : 0,
        roas: parseFloat(roas.toFixed(1))
      };
    });
  } catch (error) {
    console.error('Error generating product performance data:', error);
    return [];
  }
};

/**
 * Get data for quality vs conversion analysis
 */
export const getQualityConversionData = async (
  dateRange?: DateRange,
  selectedChannel?: string,
  selectedProduct?: string
): Promise<QualityConversionData[]> => {
  try {
    // Fetch raw data
    const rawData = await fetchLeadBrokerData(dateRange, 
      selectedChannel !== 'all' ? selectedChannel : undefined, 
      selectedProduct !== 'all' ? selectedProduct : undefined
    );
    
    if (!rawData.length) {
      console.log('No lead broker data found, returning empty quality conversion data');
      return [];
    }
    
    // Group by revenue range
    const faturamentoGroups = rawData.reduce((acc: Record<string, LeadBrokerData[]>, item) => {
      const faturamento = item.FATURAMENTO || 'Não informado';
      if (!acc[faturamento]) {
        acc[faturamento] = [];
      }
      acc[faturamento].push(item);
      return acc;
    }, {});
    
    // Calculate metrics for each revenue range
    return Object.entries(faturamentoGroups).map(([faturamento, leads]) => {
      const leadsComprados = leads.length;
      
      // Count sales
      const sales = leads.filter(lead => lead.STATUS === 'Vendido' || lead.STATUS === 'Venda').length;
      
      // Calculate conversion rate
      const conversionRate = leadsComprados > 0 ? (sales / leadsComprados) * 100 : 0;
      
      return {
        faixaFaturamento: faturamento,
        leadsComprados,
        vendas: sales,
        txConversao: parseFloat(conversionRate.toFixed(1))
      };
    });
  } catch (error) {
    console.error('Error generating quality conversion data:', error);
    return [];
  }
};
