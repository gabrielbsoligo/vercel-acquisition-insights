
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  TrendingUp,
  BadgeCent,
  GitFork,
  History,
} from "lucide-react";

const ChannelsPage: React.FC = () => {
  const [dateRangeStart, setDateRangeStart] = useState<DateRange | undefined>({
    from: new Date(2025, 4, 1), // May 1, 2025
    to: new Date(2025, 4, 31), // May 31, 2025
  });
  
  const [dateRangeEnd, setDateRangeEnd] = useState<DateRange | undefined>({
    from: new Date(2025, 4, 1), // May 1, 2025
    to: new Date(2025, 4, 31), // May 31, 2025
  });
  
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  
  // State for chart data
  const [channelData, setChannelData] = useState<any[]>([]);
  const [pieChartData, setPieChartData] = useState<any[]>([]);

  // Mock colors for charts
  const COLORS = ['#e50915', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would fetch from the CSV files based on the filters
    const loadData = async () => {
      // Mock channel data
      setChannelData([
        {
          canal: "LeadBroker",
          valorVendido: 80000,
          numVendas: 15,
        },
        {
          canal: "Outbound",
          valorVendido: 60000,
          numVendas: 10,
        },
        {
          canal: "Recomendação",
          valorVendido: 30000,
          numVendas: 5,
        },
        {
          canal: "Networking",
          valorVendido: 10000,
          numVendas: 2,
        },
      ]);

      // Mock pie chart data
      setPieChartData([
        { name: "LeadBroker", value: 44.4 },
        { name: "Outbound", value: 33.3 },
        { name: "Recomendação", value: 16.7 },
        { name: "Networking", value: 5.6 },
      ]);
    };

    loadData();
  }, [dateRangeStart, dateRangeEnd, selectedChannel]);

  return (
    <DashboardLayout title="Performance por Canais de Vendas">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <DateRangePicker
          dateRange={dateRangeStart}
          onDateRangeChange={setDateRangeStart}
          label="Período Início Call (Canal)"
        />
        <DateRangePicker
          dateRange={dateRangeEnd}
          onDateRangeChange={setDateRangeEnd}
          label="Período Fechamento (Canal)"
        />
        <div className="grid gap-2">
          <div className="text-sm font-medium">Canal de Origem</div>
          <Select 
            value={selectedChannel} 
            onValueChange={setSelectedChannel}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Canais</SelectItem>
              <SelectItem value="leadbroker">Leadbroker</SelectItem>
              <SelectItem value="outbound">Outbound</SelectItem>
              <SelectItem value="recomendacao">Recomendação</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="indicacao">Indicação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <KpiCard 
          title="Vendas por Canal (LeadBroker)" 
          value="15" 
          icon={Activity}
          goal="20"
          percentComplete={75}
        />
        <KpiCard 
          title="Valor Vendido (LeadBroker)" 
          value="R$ 80.000" 
          icon={TrendingUp}
          goal="R$ 110.000"
          percentComplete={73}
        />
        <KpiCard 
          title="Ticket Médio (LeadBroker)" 
          value="R$ 5.333" 
          icon={BadgeCent}
        />
        <KpiCard 
          title="Tx. Conversão (LeadBroker)" 
          value="55.6%" 
          icon={GitFork}
          goal="60%"
          percentComplete={93}
        />
        <KpiCard 
          title="Ciclo de Vendas (LeadBroker)" 
          value="16 dias" 
          icon={History}
          goal="15 dias"
          percentComplete={94}
        />
      </div>

      {/* Comparison Chart and Participation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-md dashboard-chart">
          <CardHeader className="pb-2">
            <CardTitle>Comparativo de Performance dos Canais</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={channelData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="canal" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="valorVendido" name="Valor Vendido" fill="#e50915" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md dashboard-chart">
          <CardHeader className="pb-2">
            <CardTitle>Participação dos Canais</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Goals vs Achieved by Channel */}
      <Card className="shadow-md dashboard-chart mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Metas vs. Realizado por Canal (Valor)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { mes: "Maio", canal: "LeadBroker", realizadoValor: 80000, metaValorTotal: 110000, realizadoMRR: 62000, metaMRR: 80000, realizadoOneTime: 18000, metaOneTime: 30000 },
                { mes: "Maio", canal: "Outbound", realizadoValor: 60000, metaValorTotal: 50000, realizadoMRR: 40000, metaMRR: 30000, realizadoOneTime: 20000, metaOneTime: 20000 },
                { mes: "Maio", canal: "Recomendação", realizadoValor: 30000, metaValorTotal: 30000, realizadoMRR: 25000, metaMRR: 25000, realizadoOneTime: 5000, metaOneTime: 5000 },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="canal" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Legend />
              <Bar dataKey="realizadoValor" name="Realizado Total" fill="#e50915" />
              <Bar dataKey="metaValorTotal" name="Meta Total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Product Analysis and Loss Reasons by Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Top Produtos por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2">Canal</th>
                    <th className="text-left font-medium p-2">Produto</th>
                    <th className="text-right font-medium p-2">Qtd. Vendida</th>
                    <th className="text-right font-medium p-2">Valor Vendido</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">LeadBroker</td>
                    <td className="p-2">Assessoria</td>
                    <td className="p-2 text-right">10</td>
                    <td className="p-2 text-right">R$ 40.000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">LeadBroker</td>
                    <td className="p-2">Estruturação Estratégica</td>
                    <td className="p-2 text-right">5</td>
                    <td className="p-2 text-right">R$ 40.000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Outbound</td>
                    <td className="p-2">Assessoria</td>
                    <td className="p-2 text-right">8</td>
                    <td className="p-2 text-right">R$ 32.000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Outbound</td>
                    <td className="p-2">Estruturação Estratégica</td>
                    <td className="p-2 text-right">2</td>
                    <td className="p-2 text-right">R$ 28.000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Recomendação</td>
                    <td className="p-2">Assessoria</td>
                    <td className="p-2 text-right">3</td>
                    <td className="p-2 text-right">R$ 12.000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Recomendação</td>
                    <td className="p-2">Estruturação Estratégica</td>
                    <td className="p-2 text-right">2</td>
                    <td className="p-2 text-right">R$ 18.000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Principais Motivos de Perda por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2">Canal</th>
                    <th className="text-left font-medium p-2">Motivo de Perda</th>
                    <th className="text-right font-medium p-2">Quantidade</th>
                    <th className="text-right font-medium p-2">% do Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">LeadBroker</td>
                    <td className="p-2">Sem Budget</td>
                    <td className="p-2 text-right">5</td>
                    <td className="p-2 text-right">42%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">LeadBroker</td>
                    <td className="p-2">Comprado do concorrente</td>
                    <td className="p-2 text-right">4</td>
                    <td className="p-2 text-right">33%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">LeadBroker</td>
                    <td className="p-2">Não viu valor</td>
                    <td className="p-2 text-right">3</td>
                    <td className="p-2 text-right">25%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Outbound</td>
                    <td className="p-2">Sem Budget</td>
                    <td className="p-2 text-right">3</td>
                    <td className="p-2 text-right">30%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Outbound</td>
                    <td className="p-2">Timing errado</td>
                    <td className="p-2 text-right">3</td>
                    <td className="p-2 text-right">30%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Outbound</td>
                    <td className="p-2">Não viu valor</td>
                    <td className="p-2 text-right">2</td>
                    <td className="p-2 text-right">20%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Outbound</td>
                    <td className="p-2">Outros</td>
                    <td className="p-2 text-right">2</td>
                    <td className="p-2 text-right">20%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Progress */}
      <Card className="shadow-md dashboard-chart mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Progresso Mensal por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="text-sm">Selecionar Canal</div>
              <Select defaultValue="leadbroker">
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leadbroker">LeadBroker</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="recomendacao">Recomendação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">Selecionar Mês</div>
              <Select defaultValue="may">
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="may">Maio 2025</SelectItem>
                  <SelectItem value="apr">Abril 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={270}>
            <LineChart
              data={[
                { dia: 1, atingimentoAcumulado: 2000, idealAcumulado: 3670 },
                { dia: 5, atingimentoAcumulado: 10000, idealAcumulado: 18350 },
                { dia: 10, atingimentoAcumulado: 30000, idealAcumulado: 36700 },
                { dia: 15, atingimentoAcumulado: 45000, idealAcumulado: 55050 },
                { dia: 20, atingimentoAcumulado: 60000, idealAcumulado: 73400 },
                { dia: 25, atingimentoAcumulado: 72000, idealAcumulado: 91750 },
                { dia: 30, atingimentoAcumulado: 80000, idealAcumulado: 110000 },
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Legend />
              <Line type="monotone" dataKey="atingimentoAcumulado" name="Atingimento" stroke="#e50915" />
              <Line type="monotone" dataKey="idealAcumulado" name="Meta Ideal" stroke="#8884d8" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ChannelsPage;
