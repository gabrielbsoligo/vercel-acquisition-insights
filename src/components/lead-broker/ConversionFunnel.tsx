
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface FunnelData {
  etapa: string;
  valor: number;
}

interface ConversionFunnelProps {
  funnelData: FunnelData[];
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ funnelData }) => {
  if (!funnelData || funnelData.length === 0) return null;

  return (
    <Card className="shadow-md dashboard-chart mb-6">
      <CardHeader className="pb-2">
        <CardTitle>Funil de Conversão Lead Broker</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            layout="vertical" 
            data={funnelData}
            margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="etapa" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="valor" fill="#e50915" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
