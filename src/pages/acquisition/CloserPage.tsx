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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  XCircle,
  ChevronDown,
  Filter,
} from "lucide-react";
import {
  fetchCloserKpiData,
  fetchCloserPerformanceData,
  fetchCloserSalesFunnelData,
  fetchCloserLossReasonsData,
  fetchCloserSalesCycleData,
  fetchNegotiations
} from "@/services/closerService";
import { LoadingState } from "@/components/lead-broker/LoadingState";
import { NoDataState } from "@/components/lead-broker/NoDataState";
import { NegotiationsList } from "@/components/closer/NegotiationsList";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency, formatPercent } from "@/services/utils/formatters";

// Define types for data structures
interface KpiData {
  valorRealizado: number;
  meta: number;
  percentComplete: number;
}

interface CloserPerformance {
  closerName: string;
  reunioesRealizadas: number;
  vendas: number;
  negociosPerdidos: number;
  taxaConversao: number;
  indicacoesColetadas: number;
  valorVendido: number;
  ticketMedio: number;
  cicloMedio: number;
}

interface FunnelData {
  etapa: string;
  valor: number;
}

interface LossReasonData {
  motivoPerda: string;
  quantidade: number;
  percentualAcumulado: number;
}

interface CycleSalesData {
  faixaCiclo: string;
  quantidade: number;
}

// Get default date range (Jul 2024 - May 2025)
const getDefaultDateRange = (): DateRange => {
  return {
    from: new Date(2024, 6, 1), // July 1, 2024
    to: new Date(2025, 4, 31),  // May 31, 2025
  };
};

const CloserPage: React.FC = () => {
  // Set default date range to cover all data (Jul 2024 - May 2025)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultDateRange());
  
  const [selectedCloser, setSelectedCloser] = useState<string>("all");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("may");
  
  // Advanced filter states
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTemperature, setSelectedTemperature] = useState<string>("all");
  const [closingDateRange, setClosingDateRange] = useState<DateRange | undefined>(undefined);
  
  // State for loading and no data situations
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasData, setHasData] = useState<boolean>(true);
  
  // State for KPI data
  const [reunioesKpi, setReunioesKpi] = useState<KpiData>({ valorRealizado: 0, meta: 0, percentComplete: 0 });
  const [vendasKpi, setVendasKpi] = useState<KpiData>({ valorRealizado: 0, meta: 0, percentComplete: 0 });
  const [perdasKpi, setPerdasKpi] = useState<KpiData>({ valorRealizado: 0, meta: 0, percentComplete: 0 });
  const [valorVendidoKpi, setValorVendidoKpi] = useState<KpiData>({ valorRealizado: 0, meta: 0, percentComplete: 0 });
  const [ticketMedioKpi, setTicketMedioKpi] = useState<KpiData>({ valorRealizado: 0, meta: 0, percentComplete: 0 });
  const [taxaConversaoKpi, setTaxaConversaoKpi] = useState<KpiData>({ valorRealizado: 0, meta: 0, percentComplete: 0 });
  const [cicloVendasKpi, setCicloVendasKpi] = useState<KpiData>({ valorRealizado: 0, meta: 0, percentComplete: 0 });
  
  // State for chart data
  const [closerPerformanceData, setCloserPerformanceData] = useState<CloserPerformance[]>([]);
  const [salesFunnelData, setSalesFunnelData] = useState<FunnelData[]>([]);
  const [cycleSalesData, setCycleSalesData] = useState<CycleSalesData[]>([]);
  const [lossReasonsData, setLossReasonsData] = useState<LossReasonData[]>([]);
  const [salesProgressData, setSalesProgressData] = useState<any[]>([]);
  
  // Chart colors
  const COLORS = ['#e50915', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // State for negotiations
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [loadingNegotiations, setLoadingNegotiations] = useState<boolean>(true);
  
  // Function to reset filters
  const resetFilters = () => {
    setDateRange(getDefaultDateRange());
    setSelectedCloser("all");
    setSelectedOrigin("all");
    setSelectedStatus("all");
    setSelectedTemperature("all");
    setClosingDateRange(undefined);
    toast.success("Filtros redefinidos para valores padrão");
  };

  // Toggle advanced filters
  const toggleAdvancedFilters = () => {
    setAdvancedFiltersOpen(!advancedFiltersOpen);
  };

  // Load all data when filters change
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadingNegotiations(true);
        
        // Ensure we have valid date range for fetching
        const validDateRange = dateRange || getDefaultDateRange();
        
        console.log("Fetching with date range:", {
          range: JSON.stringify(validDateRange)
        });
        
        // Normalize selected filters to ensure 'all' values are handled correctly
        const normalizedCloser = selectedCloser === 'all' ? undefined : selectedCloser;
        const normalizedOrigin = selectedOrigin === 'all' ? undefined : selectedOrigin;
        const normalizedStatus = selectedStatus === 'all' ? undefined : selectedStatus;
        const normalizedTemperature = selectedTemperature === 'all' ? undefined : selectedTemperature;
        
        console.log("Applying filters:", {
          closer: normalizedCloser || 'all',
          origin: normalizedOrigin || 'all',
          status: normalizedStatus || 'all',
          temperature: normalizedTemperature || 'all'
        });
        
        // Load KPI data - now passing closingDateRange to all KPI fetches
        const reunioes = await fetchCloserKpiData('reunioesRealizadas', validDateRange, normalizedCloser, closingDateRange);
        const vendas = await fetchCloserKpiData('vendas', validDateRange, normalizedCloser, closingDateRange);
        const valorVendido = await fetchCloserKpiData('valorVendido', validDateRange, normalizedCloser, closingDateRange);
        const ticketMedio = await fetchCloserKpiData('ticketMedio', validDateRange, normalizedCloser, closingDateRange);
        const taxaConversao = await fetchCloserKpiData('taxaConversao', validDateRange, normalizedCloser, closingDateRange);
        const cicloVendas = await fetchCloserKpiData('cicloVendas', validDateRange, normalizedCloser, closingDateRange);
        
        // Load performance data - now passing closingDateRange and normalizedOrigin
        const performance = await fetchCloserPerformanceData(
          validDateRange, 
          normalizedCloser, 
          normalizedOrigin,
          closingDateRange
        );
        
        // Load sales funnel data - now passing closingDateRange and normalizedOrigin
        const funnel = await fetchCloserSalesFunnelData(
          validDateRange, 
          normalizedCloser, 
          normalizedOrigin,
          closingDateRange
        );
        
        // Load sales cycle data - now passing closingDateRange and normalizedOrigin
        const cycleData = await fetchCloserSalesCycleData(
          validDateRange, 
          normalizedCloser, 
          normalizedOrigin,
          closingDateRange
        );
        
        // Load loss reasons data - now passing closingDateRange and normalizedOrigin
        const lossReasons = await fetchCloserLossReasonsData(
          validDateRange, 
          normalizedCloser, 
          normalizedOrigin,
          closingDateRange
        );
        
        // Load negotiations data with advanced filters
        const negotiationsData = await fetchNegotiations(
          validDateRange,
          normalizedCloser,
          normalizedOrigin,
          normalizedStatus,
          normalizedTemperature,
          closingDateRange
        );
        
        // Find perdas value from performance data (total team)
        const perdas = performance.find(item => item.closerName === 'Total Equipe')?.negociosPerdidos || 0;
        
        // Set state with fetched data
        setReunioesKpi(reunioes);
        setVendasKpi(vendas);
        setPerdasKpi({ valorRealizado: perdas, meta: 0, percentComplete: 0 });
        setValorVendidoKpi(valorVendido);
        setTicketMedioKpi(ticketMedio);
        setTaxaConversaoKpi(taxaConversao);
        setCicloVendasKpi(cicloVendas);
        
        setCloserPerformanceData(performance);
        setSalesFunnelData(funnel);
        setCycleSalesData(cycleData);
        setLossReasonsData(lossReasons);
        setNegotiations(negotiationsData);
        
        // Create sales progress data for selected month
        generateSalesProgressData();
        
        // Check if we have any data to display
        const hasAnyData = 
          (performance && performance.length > 1) || 
          (funnel && funnel.length > 0) ||
          (cycleData && cycleData.length > 0) ||
          (lossReasons && lossReasons.length > 0);
        
        setHasData(hasAnyData);
        setIsLoading(false);
        setLoadingNegotiations(false);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erro ao carregar dados. Verifique os filtros ou tente novamente.");
        setIsLoading(false);
        setLoadingNegotiations(false);
        setHasData(false);
      }
    };

    loadData();
  }, [dateRange, selectedCloser, selectedOrigin, selectedStatus, selectedTemperature, closingDateRange, selectedMonth]);
  
  // Generate sales progress data based on selected month
  const generateSalesProgressData = () => {
    // This would ideally be based on real data
    // For now, we generate synthetic data based on the selected month
    
    // Get month and year from selected month
    let monthIndex = 4; // default to May
    let year = 2025;
    
    if (selectedMonth === "apr") {
      monthIndex = 3; // April
    }
    
    // Calculate days in month
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    // Get meta value for the month from valorVendidoKpi
    const monthlyMeta = valorVendidoKpi.meta;
    
    // Generate daily progression data
    const progressData = [];
    let cumulativeTarget = 0;
    let cumulativeActual = 0;
    
    // Add data points for every 5 days
    for (let day = 1; day <= daysInMonth; day += 5) {
      cumulativeTarget = (monthlyMeta * day) / daysInMonth;
      
      // Let's make actual sales follow a curve - slower at start, faster in middle, slower at end
      let factor;
      if (day < daysInMonth / 3) {
        factor = 0.8;  // Slower than ideal at start
      } else if (day < 2 * daysInMonth / 3) {
        factor = 1.1;  // Faster in middle
      } else {
        factor = 0.9;  // Slower at end
      }
      
      cumulativeActual = cumulativeTarget * factor;
      
      progressData.push({
        dia: day,
        atingimentoAcumulado: Math.round(cumulativeActual),
        idealAcumulado: Math.round(cumulativeTarget)
      });
    }
    
    // Add final day
    progressData.push({
      dia: daysInMonth,
      atingimentoAcumulado: Math.round(valorVendidoKpi.valorRealizado),
      idealAcumulado: Math.round(monthlyMeta)
    });
    
    setSalesProgressData(progressData);
  };
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };
  
  // Format percentage values
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <DashboardLayout title="Performance de Vendas (Closer)">
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          label="Período de Início"
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
              <SelectItem value="Gabriel">Gabriel</SelectItem>
              <SelectItem value="Célio">Célio</SelectItem>
              <SelectItem value="Nicolas">Nicolas</SelectItem>
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
              <SelectItem value="LEADBROKER">Leadbroker</SelectItem>
              <SelectItem value="OUTBOUND">Outbound</SelectItem>
              <SelectItem value="RECOMENDAÇÃO">Recomendação</SelectItem>
              <SelectItem value="NETWORKING">Networking</SelectItem>
              <SelectItem value="INDICAÇÃO">Indicação</SelectItem>
              <SelectItem value="MVP USA">MVP USA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Advanced Filters Button */}
      <div className="flex justify-between mb-4 items-center">
        <Button 
          onClick={toggleAdvancedFilters} 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          Filtros Avançados
          <ChevronDown className={`h-4 w-4 transform transition-transform ${advancedFiltersOpen ? 'rotate-180' : ''}`} />
        </Button>
        
        <Button 
          onClick={resetFilters} 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
        >
          <XCircle className="h-4 w-4" />
          Limpar Filtros
        </Button>
      </div>
      
      {/* Advanced Filters Panel */}
      {advancedFiltersOpen && (
        <div className="bg-background rounded-md border p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <DateRangePicker
            dateRange={closingDateRange}
            onDateRangeChange={setClosingDateRange}
            label="Período de Fechamento (DATA DO FEC.)"
          />
          
          <div className="grid gap-2">
            <div className="text-sm font-medium">Status</div>
            <Select 
              value={selectedStatus} 
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Ganho">Ganho</SelectItem>
                <SelectItem value="Perdido">Perdido</SelectItem>
                <SelectItem value="Negociação">Negociação</SelectItem>
                <SelectItem value="Follow Longo">Follow Longo</SelectItem>
                <SelectItem value="Contrato Assinado">Contrato Assinado</SelectItem>
                <SelectItem value="Contrato na Rua">Contrato na Rua</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <div className="text-sm font-medium">Temperatura</div>
            <Select 
              value={selectedTemperature} 
              onValueChange={setSelectedTemperature}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar Temperatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Temperaturas</SelectItem>
                <SelectItem value="Quente">Quente</SelectItem>
                <SelectItem value="Morno">Morno</SelectItem>
                <SelectItem value="Frio">Frio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : !hasData ? (
        <NoDataState />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard 
              title="Negócios Iniciados" 
              value={reunioesKpi.valorRealizado.toString()} 
              icon={Briefcase}
              goal={reunioesKpi.meta.toString()}
              percentComplete={Math.round(reunioesKpi.percentComplete)}
            />
            <KpiCard 
              title="Negócios Ganhos" 
              value={vendasKpi.valorRealizado.toString()} 
              icon={Award}
              goal={vendasKpi.meta.toString()}
              percentComplete={Math.round(vendasKpi.percentComplete)}
            />
            <KpiCard 
              title="Negócios Perdidos" 
              value={perdasKpi.valorRealizado.toString()} 
              icon={ThumbsDown}
            />
            <KpiCard 
              title="Valor Vendido" 
              value={formatCurrency(valorVendidoKpi.valorRealizado)} 
              icon={DollarSign}
              goal={formatCurrency(valorVendidoKpi.meta)}
              percentComplete={Math.round(valorVendidoKpi.percentComplete)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard 
              title="Ticket Médio" 
              value={formatCurrency(ticketMedioKpi.valorRealizado)} 
              icon={BadgeDollarSign}
              goal={formatCurrency(ticketMedioKpi.meta)}
              percentComplete={Math.round(ticketMedioKpi.percentComplete)}
            />
            <KpiCard 
              title="Tx. Conversão" 
              value={formatPercent(taxaConversaoKpi.valorRealizado)} 
              icon={Percent}
              goal={formatPercent(taxaConversaoKpi.meta)}
              percentComplete={Math.round(taxaConversaoKpi.percentComplete)}
            />
            <KpiCard 
              title="Ciclo de Vendas (dias)" 
              value={Math.round(cicloVendasKpi.valorRealizado).toString()} 
              icon={CalendarClock}
              goal={Math.round(cicloVendasKpi.meta).toString()}
              percentComplete={Math.round(cicloVendasKpi.percentComplete)}
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
                  <BarChart 
                    data={closerPerformanceData.filter(item => item.closerName !== 'Total Equipe')}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="closerName" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
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
                    data={closerPerformanceData.filter(item => item.closerName !== 'Total Equipe').map(closer => ({
                      closerName: closer.closerName,
                      realizadoValor: closer.valorVendido,
                      metaValor: valorVendidoKpi.meta / (closerPerformanceData.length - 1), // Distribute equally
                      realizadoQtd: closer.vendas,
                      metaQtd: vendasKpi.meta / (closerPerformanceData.length - 1) // Distribute equally
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="closerName" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
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
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
                    data={salesProgressData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
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
                    {closerPerformanceData.map((row, index) => (
                      <tr 
                        key={row.closerName} 
                        className={row.closerName === 'Total Equipe' ? "bg-muted/20" : "border-b"}
                      >
                        <td className={row.closerName === 'Total Equipe' ? "p-2 font-medium" : "p-2"}>
                          {row.closerName}
                        </td>
                        <td className={`p-2 text-right ${row.closerName === 'Total Equipe' ? "font-medium" : ""}`}>
                          {row.reunioesRealizadas}
                        </td>
                        <td className={`p-2 text-right ${row.closerName === 'Total Equipe' ? "font-medium" : ""}`}>
                          {row.vendas}
                        </td>
                        <td className={`p-2 text-right ${row.closerName === 'Total Equipe' ? "font-medium" : ""}`}>
                          {row.negociosPerdidos}
                        </td>
                        <td className={`p-2 text-right ${row.closerName === 'Total Equipe' ? "font-medium" : ""}`}>
                          {formatCurrency(row.valorVendido)}
                        </td>
                        <td className={`p-2 text-right ${row.closerName === 'Total Equipe' ? "font-medium" : ""}`}>
                          {formatCurrency(row.ticketMedio)}
                        </td>
                        <td className={`p-2 text-right ${row.closerName === 'Total Equipe' ? "font-medium" : ""}`}>
                          {formatPercent(row.taxaConversao)}
                        </td>
                        <td className={`p-2 text-right ${row.closerName === 'Total Equipe' ? "font-medium" : ""}`}>
                          {Math.round(row.cicloMedio)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Negotiations List */}
          <Card className="shadow-md mt-6">
            <CardHeader className="pb-2">
              <CardTitle>Listagem de Negociações</CardTitle>
            </CardHeader>
            <CardContent>
              <NegotiationsList 
                negotiations={negotiations}
                isLoading={loadingNegotiations}
              />
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
};

export default CloserPage;
