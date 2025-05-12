
import React from "react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  DollarSign,
  Users,
  BadgeDollarSign,
  Award,
  TrendingUp,
  GitFork,
  Activity,
} from "lucide-react";

interface KpiSummaryProps {
  summaryKPIs: {
    investimento: number;
    leadsComprados: number;
    cpl: number;
    vendas: number;
    valorVendido: number;
    txConversao: number;
    cac: number;
    roas: number;
    ticketMedio: number;
  };
}

export const KpiSummary: React.FC<KpiSummaryProps> = ({ summaryKPIs }) => {
  return (
    <>
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
    </>
  );
};
