
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Network, DollarSign } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const dashboards = [
    {
      title: "Pré-vendas (SDR)",
      description: "Visualize a performance individual e da equipe de SDRs, incluindo volume de atividades, resultados e taxas de conversão.",
      icon: <Users className="h-8 w-8 text-brandRed" />,
      path: "/acquisition/sdr"
    },
    {
      title: "Vendas (Closer)",
      description: "Analise a performance da equipe de Closers, incluindo volume de negócios, valores, taxas de conversão e ciclo de vendas.",
      icon: <Target className="h-8 w-8 text-brandRed" />,
      path: "/acquisition/closer"
    },
    {
      title: "Canais de Vendas",
      description: "Compare a performance de vendas por canais de origem, incluindo volume, valor, ticket médio e conversão.",
      icon: <Network className="h-8 w-8 text-brandRed" />,
      path: "/acquisition/channels"
    },
    {
      title: "Lead Broker",
      description: "Analise em profundidade a performance dos leads adquiridos via Lead Broker, incluindo custos, conversões e ROI.",
      icon: <DollarSign className="h-8 w-8 text-brandRed" />,
      path: "/acquisition/leadbroker"
    },
    {
      title: "Controle Pré Venda",
      description: "Gerencie e acompanhe as atividades diárias da equipe de pré-vendas com formulários e métricas detalhadas.",
      icon: <Users className="h-8 w-8 text-green-500" />,
      path: "/acquisition/sdrcontrol"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Dashboard de Aquisição</h1>
          <p className="text-xl text-muted-foreground">
            Visualize e analise dados de performance de vendas e pré-vendas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard, index) => (
            <Card key={index} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{dashboard.title}</CardTitle>
                  {dashboard.icon}
                </div>
                <CardDescription className="mt-2">
                  {dashboard.description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  className="w-full bg-brandRed hover:bg-brandRed/90"
                  onClick={() => navigate(dashboard.path)}
                >
                  Acessar Dashboard
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
