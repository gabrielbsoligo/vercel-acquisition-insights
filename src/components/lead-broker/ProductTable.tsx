
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductPerformance } from "@/services/leadBrokerService";

interface ProductTableProps {
  productData: ProductPerformance[];
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

export const ProductTable: React.FC<ProductTableProps> = ({ 
  productData, 
  summaryKPIs 
}) => {
  if (!productData || productData.length === 0) return null;

  return (
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
              {productData.map((product, index) => (
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
  );
};
