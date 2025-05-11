
import React, { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
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

const LeadBrokerPage: React.FC = () => {
  const [dateRangeLead, setDateRangeLead] = useState<DateRange | undefined>({
    from: new Date(2025, 4, 1), // May 1, 2025
    to: new Date(2025, 4, 31), // May 31, 2025
  });
  
  const [dateRangeSale, setDateRangeSale] = useState<DateRange | undefined>({
    from: new Date(2025, 4, 1), // May 1, 2025
    to: new Date(2025, 4, 31), // May 31, 2025
  });
  
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  
  // State for chart data
  const [trendData, setTrendData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [channelPerformanceData, setChannelPerformanceData] = useState<any[]>([]);
  const [productPerformanceData, setProductPerformanceData] = useState<any[]>([]);
  const [qualityConversionData, setQualityConversionData] = useState<any[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would fetch from the CSV files based on the filters
    const loadData = async () => {
      // Mock trend data
      setTrendData([
        { periodo: "01/05", cpl: 900, cac: 5200, roas: 3.8 },
        { periodo: "02/05", cpl: 880, cac: 5100, roas: 3.9 },
        { periodo: "03/05", cpl: 950, cac: 5500, roas: 3.6 },
        { periodo: "04/05", cpl: 1000, cac: 5800, roas: 3.4 },
        { periodo: "05/05", cpl: 1050, cac: 6000, roas: 3.3 },
        { periodo: "06/05", cpl: 1020, cac: 5900, roas: 3.4 },
        { periodo: "07/05", cpl: 980, cac: 5700, roas: 3.5 },
      ]);

      // Mock funnel data
      setFunnelData([
        { etapa: "Leads Comprados", valor: 100 },
        { etapa: "Conexão/Engajamento", valor: 70 },
        { etapa: "Reunião Marcada", valor: 40 },
        { etapa: "Reunião Acontecida", valor: 25 },
        { etapa: "Vendas", valor: 15 },
      ]);

      // Mock channel performance data
      setChannelPerformanceData([
        { 
          canalInterno: "FACEBOOK", 
          leadsComprados: 50, 
          investimento: 52500, 
          cpl: 1050, 
          vendas: 8, 
          valorVendido: 40000, 
          txConversao: 16, 
          cac: 6563, 
          roas: 3.8 
        },
        { 
          canalInterno: "GOOGLE", 
          leadsComprados: 30, 
          investimento: 30000, 
          cpl: 1000, 
          vendas: 5, 
          valorVendido: 25000, 
          txConversao: 16.7, 
          cac: 6000, 
          roas: 3.3 
        },
        { 
          canalInterno: "INSTITUCIONAL", 
          leadsComprados: 15, 
          investimento: 13500, 
          cpl: 900, 
          vendas: 2, 
          valorVendido: 10000, 
          txConversao: 13.3, 
          cac: 6750, 
          roas: 2.9 
        },
        { 
          canalInterno: "BING", 
          leadsComprados: 5, 
          investimento: 4000, 
          cpl: 800, 
          vendas: 0, 
          valorVendido: 0, 
          txConversao: 0, 
          cac: 0, 
          roas: 0 
        },
      ]);

      // Mock product performance data
      setProductPerformanceData([
        { 
          produto: "ESTRUTURAÇÃO ESTRATÉGICA", 
          leadsComprados: 60, 
          investimento: 60000, 
          cpl: 1000, 
          vendas: 10, 
          valorVendido: 50000, 
          txConversao: 16.7, 
          cac: 6000, 
          roas: 4.2 
        },
        { 
          produto: "ASSESSORIA", 
          leadsComprados: 40, 
          investimento: 40000, 
          cpl: 1000, 
          vendas: 5, 
          valorVendido: 25000, 
          txConversao: 12.5, 
          cac: 8000, 
          roas: 3.1 
        },
      ]);

      // Mock quality conversion data
      setQualityConversionData([
        { faixaFaturamento: "De 101 mil à 200 mil", leadsComprados: 25, vendas: 2, txConversao: 8 },
        { faixaFaturamento: "De 201 mil à 400 mil", leadsComprados: 35, vendas: 4, txConversao: 11.4 },
        { faixaFaturamento: "De 401 mil à 1 milhão", leadsComprados: 30, vendas: 6, txConversao: 20 },
        { faixaFaturamento: "De 1 à 4 milhões", leadsComprados: 8, vendas: 2, txConversao: 25 },
        { faixaFaturamento: "De 4 à 16 milhões", leadsComprados: 2, vendas: 1, txConversao: 50 },
      ]);
    };

    loadData();
  }, [dateRangeLead, dateRangeSale, selectedChannel, selectedProduct]);

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
              <SelectItem value="facebook">FACEBOOK</SelectItem>
              <SelectItem value="google">GOOGLE</SelectItem>
              <SelectItem value="institucional">INSTITUCIONAL</SelectItem>
              <SelectItem value="bing">BING</SelectItem>
              <SelectItem value="linkedin">LINKEDIN</SelectItem>
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
              <SelectItem value="estruturacao">ESTRUTURAÇÃO ESTRATÉGICA</SelectItem>
              <SelectItem value="assessoria">ASSESSORIA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard 
          title="Investimento Broker" 
          value="R$ 100.000" 
          icon={DollarSign}
          iconColor="bg-brandRed"
        />
        <KpiCard 
          title="Leads Comprados (Broker)" 
          value="100" 
          icon={Users}
          iconColor="bg-amber-600"
        />
        <KpiCard 
          title="CPL Médio (Broker)" 
          value="R$ 1.000" 
          icon={BadgeDollarSign}
          iconColor="bg-sky-600"
        />
        <KpiCard 
          title="Vendas (de Leads Broker)" 
          value="15" 
          icon={Award}
          iconColor="bg-emerald-600"
        />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard 
          title="Valor Vendido (de Leads Broker)" 
          value="R$ 75.000" 
          icon={TrendingUp}
          iconColor="bg-indigo-600"
        />
        <KpiCard 
          title="Tx. Conv. Lead Broker -> Venda" 
          value="15%" 
          icon={GitFork}
          iconColor="bg-violet-600"
        />
        <KpiCard 
          title="CAC (Lead Broker)" 
          value="R$ 6.667" 
          icon={Activity}
          iconColor="bg-orange-600"
        />
        <KpiCard 
          title="ROAS (Lead Broker)" 
          value="3.75x" 
          icon={TrendingUp}
          iconColor="bg-teal-600"
        />
        <KpiCard 
          title="Ticket Médio (Vendas Broker)" 
          value="R$ 5.000" 
          icon={BadgeDollarSign}
          iconColor="bg-pink-600"
        />
      </div>

      {/* Funnel */}
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

      {/* Trend Chart */}
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

      {/* Channel Performance */}
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
                <tr className="bg-muted/20">
                  <td className="p-2 font-medium">Total</td>
                  <td className="p-2 text-right font-medium">100</td>
                  <td className="p-2 text-right font-medium">R$ 100.000</td>
                  <td className="p-2 text-right font-medium">R$ 1.000</td>
                  <td className="p-2 text-right font-medium">15</td>
                  <td className="p-2 text-right font-medium">R$ 75.000</td>
                  <td className="p-2 text-right font-medium">15%</td>
                  <td className="p-2 text-right font-medium">R$ 6.667</td>
                  <td className="p-2 text-right font-medium">3.75x</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Product Performance */}
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
                    <td className="p-2 text-right">R$ {product.cac}</td>
                    <td className="p-2 text-right">{product.roas.toFixed(1)}x</td>
                  </tr>
                ))}
                <tr className="bg-muted/20">
                  <td className="p-2 font-medium">Total</td>
                  <td className="p-2 text-right font-medium">100</td>
                  <td className="p-2 text-right font-medium">R$ 100.000</td>
                  <td className="p-2 text-right font-medium">R$ 1.000</td>
                  <td className="p-2 text-right font-medium">15</td>
                  <td className="p-2 text-right font-medium">R$ 75.000</td>
                  <td className="p-2 text-right font-medium">15%</td>
                  <td className="p-2 text-right font-medium">R$ 6.667</td>
                  <td className="p-2 text-right font-medium">3.75x</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Lead Quality Analysis */}
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
    </DashboardLayout>
  );
};

export default LeadBrokerPage;
