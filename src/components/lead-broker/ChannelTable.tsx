
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChannelPerformance } from "@/services/leadBrokerService";

interface ChannelTableProps {
  channelData: ChannelPerformance[];
  summaryKPIs: {
    investimento: number;
    leadsComprados: number;
    cpl: number;
    vendas: number;
    valorVendido: number;
    txConversao: number;
    cac: number;
    roas: number;
  };
}

export const ChannelTable: React.FC<ChannelTableProps> = ({ 
  channelData, 
  summaryKPIs 
}) => {
  if (!channelData || channelData.length === 0) return null;

  return (
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
              {channelData.map((channel, index) => (
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
  );
};
