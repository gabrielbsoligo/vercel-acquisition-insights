
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  goal?: number | string;
  percentComplete?: number;
  className?: string;
  iconColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  goal,
  percentComplete,
  className,
  iconColor,
}) => {
  const valueWithSign = change !== undefined && !isNaN(change) 
    ? `${change >= 0 ? '+' : ''}${change}%` 
    : undefined;
    
  const valueColor = change !== undefined && !isNaN(change)
    ? change > 0
      ? 'text-emerald-500'
      : change < 0
      ? 'text-rose-500'
      : ''
    : '';

  return (
    <Card className={cn("shadow-md overflow-hidden kpi-card", className)}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-col">
            <CardTitle className="text-sm text-muted-foreground font-medium">
              {title}
            </CardTitle>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold mt-1">{value}</div>
              {valueWithSign && (
                <div className={cn("text-sm font-medium", valueColor)}>
                  {valueWithSign}
                </div>
              )}
            </div>
          </div>
          <div 
            className={cn("p-2 rounded-md", iconColor || "bg-brandRed/10")}
          >
            <Icon className={cn("h-5 w-5", iconColor ? "text-white" : "text-brandRed")} />
          </div>
        </div>

        {goal && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Progresso</span>
              <span>{percentComplete}% de {goal}</span>
            </div>
            <Progress value={percentComplete} className="h-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
