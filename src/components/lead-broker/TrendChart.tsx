
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TrendData {
  periodo: string;
  cpl: number;
  cac?: number;
  roas?: number;
}

interface TrendChartProps {
  trendData: TrendData[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ trendData }) => {
  const [showCpl, setShowCpl] = useState(true);
  const [showCac, setShowCac] = useState(false);
  const [showRoas, setShowRoas] = useState(false);

  if (!trendData || trendData.length === 0) return null;

  return (
    <Card className="shadow-md dashboard-chart mb-6">
      <CardHeader className="pb-2">
        <CardTitle>Tendências de Custo e Retorno (Lead Broker)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              className="h-4 w-4 rounded border-gray-300" 
              checked={showCpl}
              onChange={() => setShowCpl(!showCpl)}
            />
            <span>CPL (R$)</span>
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              className="h-4 w-4 rounded border-gray-300" 
              checked={showCac}
              onChange={() => setShowCac(!showCac)}
            />
            <span>CAC (R$)</span>
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              className="h-4 w-4 rounded border-gray-300" 
              checked={showRoas}
              onChange={() => setShowRoas(!showRoas)}
            />
            <span>ROAS (multiplicador)</span>
          </label>
        </div>
        <ResponsiveContainer width="100%" height={270}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodo" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === "cpl" || name === "cac") return `R$ ${value.toLocaleString('pt-BR')}`;
                if (name === "roas") return `${value}x`;
                return value;
              }} 
            />
            <Legend />
            {showCpl && <Line type="monotone" dataKey="cpl" name="CPL" stroke="#e50915" />}
            {showCac && <Line type="monotone" dataKey="cac" name="CAC" stroke="#0088FE" />}
            {showRoas && <Line type="monotone" dataKey="roas" name="ROAS" stroke="#FF8042" />}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
