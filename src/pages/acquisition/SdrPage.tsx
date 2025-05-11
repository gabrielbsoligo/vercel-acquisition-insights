
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
  CalendarUp,
  Presentation,
} from "lucide-react";
import {
  fetchSdrKpiData,
  fetchSdrPerformanceData,
  fetchSalesFunnelData,
} from "@/services/dataService";

const SdrPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 4, 1), // May 1, 2025
    to: new Date(2025, 4, 31), // May 31, 2025
  });
  const [selectedSdr, setSelectedSdr] = useState<string>("all");
  
  // State for chart data
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would fetch from the CSV files based on the filters
    const loadData = async () => {
      const sdrPerformance = await fetchSdrPerformanceData(dateRange, selectedSdr);
      setPerformanceData(sdrPerformance);

      // Mock trend data
      setTrendData([
        { periodo: "01/05", leadsAtivados: 20, reunioesAgendadas: 8, reunioesAcontecidas: 6 },
        { periodo: "02/05", leadsAtivados: 22, reunioesAgendadas: 9, reunioesAcontecidas: 7 },
        { periodo: "03/05", leadsAtivados: 25, reunioesAgendadas: 11, reunioesAcontecidas: 8 },
        { periodo: "04/05", leadsAtivados: 18, reunioesAgendadas: 7, reunioesAcontecidas: 5 },
        { periodo: "05/05", leadsAtivados: 24, reunioesAgendadas: 10, reunioesAcontecidas: 8 },
        { periodo: "06/05", leadsAtivados: 27, reunioesAgendadas: 12, reunioesAcontecidas: 9 },
        { periodo: "07/05", leadsAtivados: 25, reunioesAgendadas: 11, reunioesAcontecidas: 8 },
      ]);

      const funnel = await fetchSalesFunnelData(dateRange, selectedSdr);
      setFunnelData(funnel);
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
              <SelectItem value="gabi">Gabi</SelectItem>
              <SelectItem value="jenni">Jenni</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard 
          title="Leads Ativados" 
          value="137" 
          icon={Users}
          goal="200"
          percentComplete={68}
        />
        <KpiCard 
          title="Ligações Feitas" 
          value="945" 
          icon={PhoneCall} 
          goal="1000"
          percentComplete={95}
        />
        <KpiCard 
          title="Ligações Atendidas" 
          value="385" 
          icon={PhoneForwarded}
          goal="450"
          percentComplete={86}
        />
        <KpiCard 
          title="Tempo em Linha" 
          value="05:12:34" 
          icon={Clock}
          goal="06:00:00"
          percentComplete={87}
        />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard 
          title="Reuniões Agendadas" 
          value="52" 
          icon={CalendarPlus}
          goal="60"
          percentComplete={87}
        />
        <KpiCard 
          title="Reuniões Acontecidas" 
          value="38" 
          icon={CalendarCheck}
          goal="45"
          percentComplete={84}
        />
        <KpiCard 
          title="Tx. Ativados > Conexões" 
          value="72.5%" 
          icon={Link}
          goal="80%"
          percentComplete={90}
        />
        <KpiCard 
          title="Tx. Conexões > Agendadas" 
          value="25.4%" 
          icon={CalendarUp}
          goal="30%"
          percentComplete={85}
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
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
          </CardContent>
        </Card>

        {/* Funil de Pré-Vendas */}
        <Card className="shadow-md dashboard-chart">
          <CardHeader className="pb-2">
            <CardTitle>Funil de Pré-Vendas</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="shadow-md dashboard-chart mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Tendências (Leads, Agendadas, Acontecidas)</CardTitle>
        </CardHeader>
        <CardContent>
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
                <tr className="border-b">
                  <td className="p-2">Gabi</td>
                  <td className="p-2">120</td>
                  <td className="p-2">88</td>
                  <td className="p-2">45</td>
                  <td className="p-2">30</td>
                  <td className="p-2">73.3%</td>
                  <td className="p-2">51.1%</td>
                  <td className="p-2">66.7%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Jenni</td>
                  <td className="p-2">135</td>
                  <td className="p-2">97</td>
                  <td className="p-2">52</td>
                  <td className="p-2">38</td>
                  <td className="p-2">71.9%</td>
                  <td className="p-2">53.6%</td>
                  <td className="p-2">73.1%</td>
                </tr>
                <tr className="bg-muted/20">
                  <td className="p-2 font-medium">Total Equipe</td>
                  <td className="p-2 font-medium">255</td>
                  <td className="p-2 font-medium">185</td>
                  <td className="p-2 font-medium">97</td>
                  <td className="p-2 font-medium">68</td>
                  <td className="p-2 font-medium">72.5%</td>
                  <td className="p-2 font-medium">52.4%</td>
                  <td className="p-2 font-medium">70.1%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SdrPage;
