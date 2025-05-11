
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
  Briefcase,
  Award,
  ThumbsDown,
  DollarSign,
  BadgeDollarSign,
  Percent,
  CalendarClock,
} from "lucide-react";
import {
  fetchCloserKpiData,
  fetchCloserPerformanceData,
  fetchSalesFunnelData,
} from "@/services/dataService";

const CloserPage: React.FC = () => {
  const [dateRangeStart, setDateRangeStart] = useState<DateRange | undefined>({
    from: new Date(2025, 4, 1), // May 1, 2025
    to: new Date(2025, 4, 31), // May 31, 2025
  });
  
  const [dateRangeEnd, setDateRangeEnd] = useState<DateRange | undefined>({
    from: new Date(2025, 4, 1), // May 1, 2025
    to: new Date(2025, 4, 31), // May 31, 2025
  });
  
  const [selectedCloser, setSelectedCloser] = useState<string>("all");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("all");
  
  // State for chart data
  const [closerPerformanceData, setCloserPerformanceData] = useState<any[]>([]);
  const [salesFunnelData, setSalesFunnelData] = useState<any[]>([]);
  const [cycleSalesData, setCycleSalesData] = useState<any[]>([]);
  const [lossReasonsData, setLossReasonsData] = useState<any[]>([]);

  // Mock colors for charts
  const COLORS = ['#e50915', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would fetch from the CSV files based on the filters
    const loadData = async () => {
      const closerPerformance = await fetchCloserPerformanceData(dateRangeStart, dateRangeEnd, selectedCloser, selectedOrigin);
      setCloserPerformanceData(closerPerformance);

      const salesFunnel = await fetchSalesFunnelData(dateRangeStart, dateRangeEnd, selectedCloser);
      setSalesFunnelData([
        { etapa: "Oportunidades Iniciadas", valor: 100 },
        { etapa: "Negociação", valor: 60 },
        { etapa: "Ganhos", valor: 32 },
        { etapa: "Perdidos", valor: 28 },
      ]);

      setCycleSalesData([
        { faixaCiclo: "0-7 dias", quantidade: 5 },
        { faixaCiclo: "8-14 dias", quantidade: 12 },
        { faixaCiclo: "15-30 dias", quantidade: 8 },
        { faixaCiclo: "31-60 dias", quantidade: 4 },
        { faixaCiclo: "61-90 dias", quantidade: 2 },
        { faixaCiclo: ">90 dias", quantidade: 1 },
      ]);

      setLossReasonsData([
        { motivoPerda: "Sem Budget", quantidade: 10, percentualAcumulado: 35 },
        { motivoPerda: "Comprado do concorrente", quantidade: 8, percentualAcumulado: 65 },
        { motivoPerda: "Não viu valor", quantidade: 5, percentualAcumulado: 85 },
        { motivoPerda: "Timing errado", quantidade: 3, percentualAcumulado: 95 },
        { motivoPerda: "Outros", quantidade: 2, percentualAcumulado: 100 },
      ]);
    };

    loadData();
  }, [dateRangeStart, dateRangeEnd, selectedCloser, selectedOrigin]);

  return (
    <DashboardLayout title="Performance de Vendas (Closer)">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DateRangePicker
          dateRange={dateRangeStart}
          onDateRangeChange={setDateRangeStart}
          label="Período Início Call"
        />
        <DateRangePicker
          dateRange={dateRangeEnd}
          onDateRangeChange={setDateRangeEnd}
          label="Período Fechamento"
        />
        <div className="grid gap-2">
          <div className="text-sm font-medium">Closer</div>
          <Select 
            value={selectedCloser} 
            onValueChange={setSelectedCloser}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar Closer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Closers</SelectItem>
              <SelectItem value="gabriel">Gabriel</SelectItem>
              <SelectItem value="celio">Célio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <div className="text-sm font-medium">Origem</div>
          <Select 
            value={selectedOrigin} 
            onValueChange={setSelectedOrigin}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Origens</SelectItem>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard 
          title="Negócios Iniciados" 
          value="100" 
          icon={Briefcase}
          goal="125"
          percentComplete={80}
        />
        <KpiCard 
          title="Negócios Ganhos" 
          value="32" 
          icon={Award}
          goal="40"
          percentComplete={80}
        />
        <KpiCard 
          title="Negócios Perdidos" 
          value="28" 
          icon={ThumbsDown}
        />
        <KpiCard 
          title="Valor Vendido" 
          value="R$ 180.000" 
          icon={DollarSign}
          goal="R$ 200.000"
          percentComplete={90}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard 
          title="Ticket Médio" 
          value="R$ 5.625" 
          icon={BadgeDollarSign}
          goal="R$ 5.500"
          percentComplete={102}
        />
        <KpiCard 
          title="Tx. Conversão" 
          value="53.3%" 
          icon={Percent}
          goal="60%"
          percentComplete={89}
        />
        <KpiCard 
          title="Ciclo de Vendas (dias)" 
          value="18" 
          icon={CalendarClock}
          goal="15"
          percentComplete={80}
        />
      </div>

      {/* Funil and Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-md dashboard-chart">
          <CardHeader className="pb-2">
            <CardTitle>Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                layout="vertical" 
                data={salesFunnelData}
                margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="etapa" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="valor" fill="#e50915" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md dashboard-chart">
          <CardHeader className="pb-2">
            <CardTitle>Ranking de Closers</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={closerPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="closerName" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="valorVendido" name="Valor Vendido" fill="#e50915" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Meta vs Realizado and Sales Cycle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-md dashboard-chart">
          <CardHeader className="pb-2">
            <CardTitle>Metas vs. Realizado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { mes: "Maio", closerName: "Gabriel", realizadoValor: 85000, metaValor: 75000, realizadoQtd: 15, metaQtd: 13 },
                  { mes: "Maio", closerName: "Célio", realizadoValor: 95000, metaValor: 75000, realizadoQtd: 17, metaQtd: 13 },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="closerName" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Legend />
                <Bar dataKey="realizadoValor" name="Valor Realizado" fill="#e50915" />
                <Bar dataKey="metaValor" name="Meta Valor" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md dashboard-chart">
          <CardHeader className="pb-2">
            <CardTitle>Distribuição do Ciclo de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={cycleSalesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="faixaCiclo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" name="Quantidade de Negócios" fill="#e50915" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sales Progress and Loss Reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-md dashboard-chart">
          <CardHeader className="pb-2">
            <CardTitle>Progresso Mensal de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
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
            <ResponsiveContainer width="100%" height={270}>
              <LineChart
                data={[
                  { dia: 1, atingimentoAcumulado: 5000, idealAcumulado: 6452 },
                  { dia: 5, atingimentoAcumulado: 25000, idealAcumulado: 32258 },
                  { dia: 10, atingimentoAcumulado: 60000, idealAcumulado: 64516 },
                  { dia: 15, atingimentoAcumulado: 95000, idealAcumulado: 96774 },
                  { dia: 20, atingimentoAcumulado: 130000, idealAcumulado: 129032 },
                  { dia: 25, atingimentoAcumulado: 160000, idealAcumulado: 161290 },
                  { dia: 30, atingimentoAcumulado: 180000, idealAcumulado: 200000 },
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

        <Card className="shadow-md dashboard-chart">
          <CardHeader className="pb-2">
            <CardTitle>Principais Motivos de Perda</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={lossReasonsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="motivoPerda" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="quantidade" name="Quantidade" fill="#e50915" />
                <Line yAxisId="right" type="monotone" dataKey="percentualAcumulado" name="% Acumulado" stroke="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Detalhes por Closer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium p-2">Closer</th>
                  <th className="text-right font-medium p-2">Negócios Iniciados</th>
                  <th className="text-right font-medium p-2">Negócios Ganhos</th>
                  <th className="text-right font-medium p-2">Negócios Perdidos</th>
                  <th className="text-right font-medium p-2">Valor Vendido</th>
                  <th className="text-right font-medium p-2">Ticket Médio</th>
                  <th className="text-right font-medium p-2">Tx. Conversão</th>
                  <th className="text-right font-medium p-2">Ciclo Médio (dias)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Gabriel</td>
                  <td className="p-2 text-right">45</td>
                  <td className="p-2 text-right">15</td>
                  <td className="p-2 text-right">12</td>
                  <td className="p-2 text-right">R$ 85.000</td>
                  <td className="p-2 text-right">R$ 5.667</td>
                  <td className="p-2 text-right">55.6%</td>
                  <td className="p-2 text-right">16</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Célio</td>
                  <td className="p-2 text-right">55</td>
                  <td className="p-2 text-right">17</td>
                  <td className="p-2 text-right">16</td>
                  <td className="p-2 text-right">R$ 95.000</td>
                  <td className="p-2 text-right">R$ 5.588</td>
                  <td className="p-2 text-right">51.5%</td>
                  <td className="p-2 text-right">19</td>
                </tr>
                <tr className="bg-muted/20">
                  <td className="p-2 font-medium">Total Equipe</td>
                  <td className="p-2 text-right font-medium">100</td>
                  <td className="p-2 text-right font-medium">32</td>
                  <td className="p-2 text-right font-medium">28</td>
                  <td className="p-2 text-right font-medium">R$ 180.000</td>
                  <td className="p-2 text-right font-medium">R$ 5.625</td>
                  <td className="p-2 text-right font-medium">53.3%</td>
                  <td className="p-2 text-right font-medium">18</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CloserPage;
