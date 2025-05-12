
import React from "react";
import {
  Card
} from "@/components/ui/card";

export const LoadingState: React.FC = () => {
  return (
    <Card className="shadow-md mb-6 p-8">
      <div className="flex justify-center items-center">
        <div className="text-lg text-muted-foreground">Carregando dados...</div>
      </div>
    </Card>
  );
};
