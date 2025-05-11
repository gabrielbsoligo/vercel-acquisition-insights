
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
  Users,
  PhoneCall,
  PhoneForwarded,
  Clock,
  CalendarPlus,
  CalendarCheck,
  Link,
  CalendarClock,
} from "lucide-react";
import {
  fetchSdrKpiData,
  fetchSdrPerformanceData,
  fetchSdrTrendData,
  fetchSalesFunnelData,
} from "@/services/dataService";

const SdrPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 3, 1), // April 1, 2025
    to: new Date(2025, 4, 10), // May 10, 2025
  });
  const [selectedSdr, setSelectedSdr] = useState<string>("all");
  
  // State for KPI data
  const [leadsActivated, setLeadsActivated] = useState({ value: 0, goal: 0, percent: 0 });
  const [callsMade, setCallsMade] = useState({ value: 0, goal: 0, percent: 0 });
  const [callsAnswered, setCallsAnswered] = useState({ value: 0, goal: 0, percent: 0 });
  const [timeInLine, setTimeInLine] = useState({ value: "00:00:00", goal: 0, percent: 0 });
  const [meetingsScheduled, setMeetingsScheduled] = useState({ value: 0, goal: 0, percent: 0 });
  const [meetingsHeld, setMeetingsHeld] = useState({ value: 0, goal: 0, percent: 0 });
  const [leadsToConnectionsRate, setLeadsToConnectionsRate] = useState({ value: 0, goal: 0, percent: 0 });
  const [connectionsToScheduledRate, setConnectionsToScheduledRate] = useState({ value: 0, goal: 0, percent: 0 });
  
  // State for chart data
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load KPI data
        const leadsData = await fetchSdrKpiData("leadsAtivados", dateRange, selectedSdr);
        setLeadsActivated({ 
          value: leadsData.valorRealizado, 
          goal: leadsData.meta || 0, 
          percent: leadsData.percentComplete || 0 
        });
        
        const callsData = await fetchSdrKpiData("ligacoesFeitas", dateRange, selectedSdr);
        setCallsMade({ 
          value: callsData.valorRealizado, 
          goal: callsData.meta || 0, 
          percent: callsData.percentComplete || 0 
        });
        
        const answeredData = await fetchSdrKpiData("ligacoesAtendidas", dateRange, selectedSdr);
        setCallsAnswered({ 
          value: answeredData.valorRealizado, 
          goal: answeredData.meta || 0, 
          percent: answeredData.percentComplete || 0 
        });
        
        const timeData = await fetchSdrKpiData("tempoLinha", dateRange, selectedSdr);
        // Convert seconds to HH:MM:SS format
        const hours = Math.floor(timeData.valorRealizado / 3600);
        const minutes = Math.floor((timeData.valorRealizado % 3600) / 60);
        const seconds = timeData.valorRealizado % 60;
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        setTimeInLine({ 
          value: formattedTime, 
          goal: timeData.meta || 0, 
          percent: timeData.percentComplete || 0 
        });
        
        const meetingsScheduledData = await fetchSdrKpiData("reunioesAgendadas", dateRange, selectedSdr);
        setMeetingsScheduled({ 
          value: meetingsScheduledData.valorRealizado, 
          goal: meetingsScheduledData.meta || 0, 
          percent: meetingsScheduledData.percentComplete || 0 
        });
        
        const meetingsHeldData = await fetchSdrKpiData("reunioesAcontecidas", dateRange, selectedSdr);
        setMeetingsHeld({ 
          value: meetingsHeldData.valorRealizado, 
          goal: meetingsHeldData.meta || 0, 
          percent: meetingsHeldData.percentComplete || 0 
        });
        
        const leadsToConnectionsData = await fetchSdrKpiData("taxaLeadsConexoes", dateRange, selectedSdr);
        setLeadsToConnectionsRate({ 
          value: Number(leadsToConnectionsData.valorRealizado.toFixed(1)), 
          goal: leadsToConnectionsData.meta || 0, 
          percent: leadsToConnectionsData.percentComplete || 0 
        });
        
        const connectionsToScheduledData = await fetchSdrKpiData("taxaConexoesAgendadas", dateRange, selectedSdr);
        setConnectionsToScheduledRate({ 
          value: Number(connectionsToScheduledData.valorRealizado.toFixed(1)), 
          goal: connectionsToScheduledData.meta || 0, 
          percent: connectionsToScheduledData.percentComplete || 0 
        });
        
        // Load chart data
        const sdrPerformance = await fetchSdrPerformanceData(dateRange, selectedSdr);
        setPerformanceData(sdrPerformance);
        setTableData(sdrPerformance);
        
        // Load trend data
        const trends = await fetchSdrTrendData(dateRange, selectedSdr);
        setTrendData(trends);
        
        // Load funnel data
        const funnel = await fetchSalesFunnelData(dateRange, selectedSdr);
        setFunnelData(funnel);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange, selectedSdr]);

  return (
    <DashboardLayout title="Performance de Pré-vendas (SDR)">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          label="Período"
        />
        <div className="grid gap-2">
          <div className="text-sm font-medium">SDR</div>
          <Select 
            value={selectedSdr} 
            onValueChange={setSelectedSdr}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar SDR" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os SDRs</SelectItem>
              <SelectItem value="Gabi">Gabi</SelectItem>
              <SelectItem value="Jenni">Jenni</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard 
          title="Leads Ativados" 
          value={leadsActivated.value} 
          icon={Users}
          goal={leadsActivated.goal}
          percentComplete={leadsActivated.percent}
        />
        <KpiCard 
          title="Ligações Feitas" 
          value={callsMade.value} 
          icon={PhoneCall} 
          goal={callsMade.goal}
          percentComplete={callsMade.percent}
        />
        <KpiCard 
          title="Ligações Atendidas" 
          value={callsAnswered.value} 
          icon={PhoneForwarded}
          goal={callsAnswered.goal}
          percentComplete={callsAnswered.percent}
        />
        <KpiCard 
          title="Tempo em Linha" 
          value={timeInLine.value} 
          icon={Clock}
          goal={timeInLine.goal}
          percentComplete={timeInLine.percent}
        />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard 
          title="Reuniões Agendadas" 
          value={meetingsScheduled.value} 
          icon={CalendarPlus}
          goal={meetingsScheduled.goal}
          percentComplete={meetingsScheduled.percent}
        />
        <KpiCard 
          title="Reuniões Acontecidas" 
          value={meetingsHeld.value} 
          icon={CalendarCheck}
          goal={meetingsHeld.goal}
          percentComplete={meetingsHeld.percent}
        />
        <KpiCard 
          title="Tx. Ativados > Conexões" 
          value={`${leadsToConnectionsRate.value}%`} 
          icon={Link}
          goal={`${leadsToConnectionsRate.goal}%`}
          percentComplete={leadsToConnectionsRate.percent}
        />
        <KpiCard 
          title="Tx. Conexões > Agendadas" 
          value={`${connectionsToScheduledRate.value}%`} 
          icon={CalendarClock}
          goal={`${connectionsToScheduledRate.goal}%`}
          percentComplete={connectionsToScheduledRate.percent}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Performance por SDR */}
        <Card className="shadow-md dashboard-chart">
          <CardHeader className="pb-2">
            <CardTitle>Performance por SDR</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p>Carregando dados...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData.filter(item => item.sdrName !== 'Total Equipe')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sdrName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leadsAtivados" name="Leads Ativados" fill="#e50915" />
                  <Bar dataKey="reunioesAgendadas" name="Reuniões Agendadas" fill="#3b82f6" />
                  <Bar dataKey="reunioesAcontecidas" name="Reuniões Acontecidas" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Funil de Pré-Vendas */}
        <Card className="shadow-md dashboard-chart">
          <CardHeader className="pb-2">
            <CardTitle>Funil de Pré-Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <p>Carregando dados...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  layout="vertical" 
                  data={funnelData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="etapa" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="valor" fill="#e50915" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="shadow-md dashboard-chart mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Tendências (Leads, Agendadas, Acontecidas)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <p>Carregando dados...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leadsAtivados" name="Leads Ativados" stroke="#e50915" />
                <Line type="monotone" dataKey="reunioesAgendadas" name="Reuniões Agendadas" stroke="#3b82f6" />
                <Line type="monotone" dataKey="reunioesAcontecidas" name="Reuniões Acontecidas" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Detalhes por SDR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium p-2">Nome SDR</th>
                  <th className="text-left font-medium p-2">Leads Ativados</th>
                  <th className="text-left font-medium p-2">Conexões</th>
                  <th className="text-left font-medium p-2">Reuniões Agendadas</th>
                  <th className="text-left font-medium p-2">Reuniões Acontecidas</th>
                  <th className="text-left font-medium p-2">Tx. Leads→Conexões</th>
                  <th className="text-left font-medium p-2">Tx. Conexões→Agendadas</th>
                  <th className="text-left font-medium p-2">Tx. Agendadas→Acontecidas</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">Carregando dados...</td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr 
                      key={index} 
                      className={`border-b ${row.sdrName === 'Total Equipe' ? 'bg-muted/20' : ''}`}
                    >
                      <td className={`p-2 ${row.sdrName === 'Total Equipe' ? 'font-medium' : ''}`}>
                        {row.sdrName}
                      </td>
                      <td className={`p-2 ${row.sdrName === 'Total Equipe' ? 'font-medium' : ''}`}>
                        {row.leadsAtivados}
                      </td>
                      <td className={`p-2 ${row.sdrName === 'Total Equipe' ? 'font-medium' : ''}`}>
                        {row.conexoes}
                      </td>
                      <td className={`p-2 ${row.sdrName === 'Total Equipe' ? 'font-medium' : ''}`}>
                        {row.reunioesAgendadas}
                      </td>
                      <td className={`p-2 ${row.sdrName === 'Total Equipe' ? 'font-medium' : ''}`}>
                        {row.reunioesAcontecidas}
                      </td>
                      <td className={`p-2 ${row.sdrName === 'Total Equipe' ? 'font-medium' : ''}`}>
                        {row.taxaLeadsConexoes.toFixed(1)}%
                      </td>
                      <td className={`p-2 ${row.sdrName === 'Total Equipe' ? 'font-medium' : ''}`}>
                        {row.taxaConexoesAgendadas.toFixed(1)}%
                      </td>
                      <td className={`p-2 ${row.sdrName === 'Total Equipe' ? 'font-medium' : ''}`}>
                        {row.taxaAgendasAcontecidas.toFixed(1)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SdrPage;
