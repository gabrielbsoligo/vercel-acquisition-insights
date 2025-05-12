
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { QualityConversionData } from "@/services/leadBrokerService";

interface QualityConversionChartProps {
  qualityData: QualityConversionData[];
}

export const QualityConversionChart: React.FC<QualityConversionChartProps> = ({ 
  qualityData 
}) => {
  if (!qualityData || qualityData.length === 0) return null;

  return (
    <Card className="shadow-md dashboard-chart">
      <CardHeader className="pb-2">
        <CardTitle>Qualidade do Lead (Faturamento) vs. Conversão</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={qualityData}
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
  );
};
