
import React from "react";
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
  Loader2,
} from "lucide-react";
import { useChannelsData } from "@/hooks/useChannelsData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ChannelsPage: React.FC = () => {
  const {
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
    isLoading,
  } = useChannelsData();

  // Mock colors for charts
  const COLORS = ['#e50915', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Get lead broker channel data for KPI cards
  const leadBrokerData = channelsData?.find(c => c.channel === 'Leadbroker') || {
    channel: 'Leadbroker',
    totalNegotiations: 0,
    totalValue: 0,
    avgTicket: 0,
    meta: 0,
    percentComplete: 0
  };

  // Helper to format currency values
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Performance por Canais de Vendas">
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
          <p className="mt-4 text-lg text-gray-500">Carregando dados dos canais...</p>
        </div>
      </DashboardLayout>
    );
  }

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
              {channelsData?.map((channel) => (
                <SelectItem key={channel.channel} value={channel.channel}>
                  {channel.channel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <KpiCard 
          title="Vendas por Canal (LeadBroker)" 
          value={leadBrokerData.totalNegotiations.toString()} 
          icon={Activity}
          goal="20"
          percentComplete={Math.min(leadBrokerData.totalNegotiations / 20 * 100, 100)}
        />
        <KpiCard 
          title="Valor Vendido (LeadBroker)" 
          value={formatCurrency(leadBrokerData.totalValue)} 
          icon={TrendingUp}
          goal={formatCurrency(leadBrokerData.meta)}
          percentComplete={Math.min(leadBrokerData.percentComplete, 100)}
        />
        <KpiCard 
          title="Ticket Médio (LeadBroker)" 
          value={formatCurrency(leadBrokerData.avgTicket)} 
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
                data={channelComparisonData}
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
              data={goalVsAchievedData}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Canal</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd. Vendida</TableHead>
                    <TableHead className="text-right">Valor Vendido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productAnalysis && productAnalysis.length > 0 ? (
                    productAnalysis.slice(0, 10).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.channel}</TableCell>
                        <TableCell>{item.product}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                        Nenhum dado disponível
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Principais Motivos de Perda por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Canal</TableHead>
                    <TableHead>Motivo de Perda</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">% do Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lossReasons && lossReasons.length > 0 ? (
                    lossReasons.slice(0, 10).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.channel}</TableCell>
                        <TableCell>{item.reason}</TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                        <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                        Nenhum dado disponível
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
              <Select 
                value={selectedChannel !== 'all' ? selectedChannel : 'Leadbroker'}
                onValueChange={setSelectedChannel}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                  {channelsData?.map((channel) => (
                    <SelectItem key={channel.channel} value={channel.channel}>
                      {channel.channel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">Selecionar Mês</div>
              <Select 
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {new Date(2023, month - 1, 1).toLocaleString('pt-BR', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={270}>
            <LineChart
              data={monthlyProgress || []}
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
