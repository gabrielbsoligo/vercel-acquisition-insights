
import React, { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  DollarSign,
  Users,
  BadgeDollarSign,
  Award,
  TrendingUp,
  GitFork,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchLeadBrokerData,
  getChannelPerformanceData,
  getProductPerformanceData,
  getQualityConversionData,
} from "@/services/leadBrokerService";

// Helper function to calculate trend data
const calculateTrendData = (rawData: any[]) => {
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
const calculateFunnelData = (rawData: any[]) => {
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

const LeadBrokerPage: React.FC = () => {
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

  return (
    <DashboardLayout title="Análise de Performance: Lead Broker">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DateRangePicker
          dateRange={dateRangeLead}
          onDateRangeChange={setDateRangeLead}
          label="Período Compra Lead (Broker)"
        />
        <DateRangePicker
          dateRange={dateRangeSale}
          onDateRangeChange={setDateRangeSale}
          label="Período Fechamento Venda (Broker)"
        />
        <div className="grid gap-2">
          <div className="text-sm font-medium">Canal (Broker)</div>
          <Select 
            value={selectedChannel} 
            onValueChange={setSelectedChannel}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Canais (Broker)</SelectItem>
              <SelectItem value="FACEBOOK">FACEBOOK</SelectItem>
              <SelectItem value="GOOGLE">GOOGLE</SelectItem>
              <SelectItem value="INSTITUCIONAL">INSTITUCIONAL</SelectItem>
              <SelectItem value="BING">BING</SelectItem>
              <SelectItem value="LINKEDIN">LINKEDIN</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <div className="text-sm font-medium">Produto (Broker)</div>
          <Select 
            value={selectedProduct} 
            onValueChange={setSelectedProduct}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar Produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Produtos (Broker)</SelectItem>
              <SelectItem value="ESTRUTURAÇÃO ESTRATÉGICA">ESTRUTURAÇÃO ESTRATÉGICA</SelectItem>
              <SelectItem value="ASSESSORIA">ASSESSORIA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard 
          title="Investimento Broker" 
          value={`R$ ${summaryKPIs.investimento.toLocaleString('pt-BR')}`}
          icon={DollarSign}
          iconColor="bg-brandRed"
        />
        <KpiCard 
          title="Leads Comprados (Broker)" 
          value={summaryKPIs.leadsComprados.toString()}
          icon={Users}
          iconColor="bg-amber-600"
        />
        <KpiCard 
          title="CPL Médio (Broker)" 
          value={`R$ ${summaryKPIs.cpl.toLocaleString('pt-BR')}`}
          icon={BadgeDollarSign}
          iconColor="bg-sky-600"
        />
        <KpiCard 
          title="Vendas (de Leads Broker)" 
          value={summaryKPIs.vendas.toString()}
          icon={Award}
          iconColor="bg-emerald-600"
        />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard 
          title="Valor Vendido (de Leads Broker)" 
          value={`R$ ${summaryKPIs.valorVendido.toLocaleString('pt-BR')}`}
          icon={TrendingUp}
          iconColor="bg-indigo-600"
        />
        <KpiCard 
          title="Tx. Conv. Lead Broker -> Venda" 
          value={`${summaryKPIs.txConversao}%`}
          icon={GitFork}
          iconColor="bg-violet-600"
        />
        <KpiCard 
          title="CAC (Lead Broker)" 
          value={`R$ ${summaryKPIs.cac.toLocaleString('pt-BR')}`}
          icon={Activity}
          iconColor="bg-orange-600"
        />
        <KpiCard 
          title="ROAS (Lead Broker)" 
          value={`${summaryKPIs.roas}x`}
          icon={TrendingUp}
          iconColor="bg-teal-600"
        />
        <KpiCard 
          title="Ticket Médio (Vendas Broker)" 
          value={`R$ ${summaryKPIs.ticketMedio.toLocaleString('pt-BR')}`}
          icon={BadgeDollarSign}
          iconColor="bg-pink-600"
        />
      </div>

      {/* Loading state */}
      {(loadingLeadBroker || loadingChannelData || loadingProductData || loadingQualityData) && (
        <Card className="shadow-md mb-6 p-8">
          <div className="flex justify-center items-center">
            <div className="text-lg text-muted-foreground">Carregando dados...</div>
          </div>
        </Card>
      )}

      {/* No data state */}
      {!loadingLeadBroker && leadBrokerData && leadBrokerData.length === 0 && (
        <Card className="shadow-md mb-6 p-8">
          <div className="flex justify-center items-center flex-col gap-4">
            <div className="text-lg font-medium">Nenhum dado encontrado para o período selecionado</div>
            <div className="text-muted-foreground text-center max-w-md">
              Tente expandir o período de datas ou remover alguns filtros para ver mais dados.
            </div>
          </div>
        </Card>
      )}

      {/* Funnel */}
      {funnelData.length > 0 && (
        <Card className="shadow-md dashboard-chart mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Funil de Conversão Lead Broker</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                layout="vertical" 
                data={funnelData}
                margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="etapa" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="valor" fill="#e50915" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Trend Chart */}
      {trendData.length > 0 && (
        <Card className="shadow-md dashboard-chart mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Tendências de Custo e Retorno (Lead Broker)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                <span>CPL (R$)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                <span>CAC (R$)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                <span>ROAS (multiplicador)</span>
              </label>
            </div>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip formatter={(value, name) => name === "roas" ? `${value}x` : `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Line type="monotone" dataKey="cpl" name="CPL" stroke="#e50915" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Channel Performance */}
      {channelPerformanceData && channelPerformanceData.length > 0 && (
        <Card className="shadow-md mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Performance por Canal (Broker)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2">Canal</th>
                    <th className="text-right font-medium p-2">Leads</th>
                    <th className="text-right font-medium p-2">Investimento</th>
                    <th className="text-right font-medium p-2">CPL</th>
                    <th className="text-right font-medium p-2">Vendas</th>
                    <th className="text-right font-medium p-2">Valor Vendido</th>
                    <th className="text-right font-medium p-2">Tx. Conversão</th>
                    <th className="text-right font-medium p-2">CAC</th>
                    <th className="text-right font-medium p-2">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {channelPerformanceData.map((channel, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{channel.canalInterno}</td>
                      <td className="p-2 text-right">{channel.leadsComprados}</td>
                      <td className="p-2 text-right">R$ {channel.investimento.toLocaleString('pt-BR')}</td>
                      <td className="p-2 text-right">R$ {channel.cpl}</td>
                      <td className="p-2 text-right">{channel.vendas}</td>
                      <td className="p-2 text-right">R$ {channel.valorVendido.toLocaleString('pt-BR')}</td>
                      <td className="p-2 text-right">{channel.txConversao}%</td>
                      <td className="p-2 text-right">R$ {channel.cac || "-"}</td>
                      <td className="p-2 text-right">{channel.roas ? `${channel.roas.toFixed(1)}x` : "-"}</td>
                    </tr>
                  ))}
                  {summaryKPIs.leadsComprados > 0 && (
                    <tr className="bg-muted/20">
                      <td className="p-2 font-medium">Total</td>
                      <td className="p-2 text-right font-medium">{summaryKPIs.leadsComprados}</td>
                      <td className="p-2 text-right font-medium">R$ {summaryKPIs.investimento.toLocaleString('pt-BR')}</td>
                      <td className="p-2 text-right font-medium">R$ {summaryKPIs.cpl}</td>
                      <td className="p-2 text-right font-medium">{summaryKPIs.vendas}</td>
                      <td className="p-2 text-right font-medium">R$ {summaryKPIs.valorVendido.toLocaleString('pt-BR')}</td>
                      <td className="p-2 text-right font-medium">{summaryKPIs.txConversao}%</td>
                      <td className="p-2 text-right font-medium">R$ {summaryKPIs.cac}</td>
                      <td className="p-2 text-right font-medium">{summaryKPIs.roas.toFixed(2)}x</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Performance */}
      {productPerformanceData && productPerformanceData.length > 0 && (
        <Card className="shadow-md mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Performance por Produto (Broker)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2">Produto</th>
                    <th className="text-right font-medium p-2">Leads</th>
                    <th className="text-right font-medium p-2">Investimento</th>
                    <th className="text-right font-medium p-2">CPL</th>
                    <th className="text-right font-medium p-2">Vendas</th>
                    <th className="text-right font-medium p-2">Valor Vendido</th>
                    <th className="text-right font-medium p-2">Tx. Conversão</th>
                    <th className="text-right font-medium p-2">CAC</th>
                    <th className="text-right font-medium p-2">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {productPerformanceData.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{product.produto}</td>
                      <td className="p-2 text-right">{product.leadsComprados}</td>
                      <td className="p-2 text-right">R$ {product.investimento.toLocaleString('pt-BR')}</td>
                      <td className="p-2 text-right">R$ {product.cpl}</td>
                      <td className="p-2 text-right">{product.vendas}</td>
                      <td className="p-2 text-right">R$ {product.valorVendido.toLocaleString('pt-BR')}</td>
                      <td className="p-2 text-right">{product.txConversao}%</td>
                      <td className="p-2 text-right">R$ {product.cac || "-"}</td>
                      <td className="p-2 text-right">{product.roas ? `${product.roas.toFixed(1)}x` : "-"}</td>
                    </tr>
                  ))}
                  {summaryKPIs.leadsComprados > 0 && (
                    <tr className="bg-muted/20">
                      <td className="p-2 font-medium">Total</td>
                      <td className="p-2 text-right font-medium">{summaryKPIs.leadsComprados}</td>
                      <td className="p-2 text-right font-medium">R$ {summaryKPIs.investimento.toLocaleString('pt-BR')}</td>
                      <td className="p-2 text-right font-medium">R$ {summaryKPIs.cpl}</td>
                      <td className="p-2 text-right font-medium">{summaryKPIs.vendas}</td>
                      <td className="p-2 text-right font-medium">R$ {summaryKPIs.valorVendido.toLocaleString('pt-BR')}</td>
                      <td className="p-2 text-right font-medium">{summaryKPIs.txConversao}%</td>
                      <td className="p-2 text-right font-medium">R$ {summaryKPIs.cac}</td>
                      <td className="p-2 text-right font-medium">{summaryKPIs.roas.toFixed(2)}x</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lead Quality Analysis */}
      {qualityConversionData && qualityConversionData.length > 0 && (
        <Card className="shadow-md dashboard-chart">
          <CardHeader className="pb-2">
            <CardTitle>Qualidade do Lead (Faturamento) vs. Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={qualityConversionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="faixaFaturamento" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="leadsComprados" name="Leads Comprados" fill="#0088FE" />
                <Bar yAxisId="left" dataKey="vendas" name="Vendas" fill="#e50915" />
                <Line yAxisId="right" type="monotone" dataKey="txConversao" name="Tx. Conversão (%)" stroke="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default LeadBrokerPage;
