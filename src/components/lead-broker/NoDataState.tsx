
import React from "react";
import {
  Card
} from "@/components/ui/card";

export const NoDataState: React.FC = () => {
  return (
    <Card className="shadow-md mb-6 p-8">
      <div className="flex justify-center items-center flex-col gap-4">
        <div className="text-lg font-medium">Nenhum dado encontrado para o período selecionado</div>
        <div className="text-muted-foreground text-center max-w-md">
          Tente expandir o período de datas ou remover alguns filtros para ver mais dados.
        </div>
      </div>
    </Card>
  );
};
