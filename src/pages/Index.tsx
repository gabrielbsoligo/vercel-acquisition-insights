
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Ruston & Co. - Dashboards</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link to="/acquisition/sdr" className="w-full">
          <Button variant="outline" className="w-full h-24 text-lg">
            Dashboard SDR
          </Button>
        </Link>
        
        <Link to="/acquisition/closer" className="w-full">
          <Button variant="outline" className="w-full h-24 text-lg">
            Dashboard Closer
          </Button>
        </Link>
        
        <Link to="/acquisition/channels" className="w-full">
          <Button variant="outline" className="w-full h-24 text-lg">
            Dashboard Canais
          </Button>
        </Link>
        
        <Link to="/acquisition/leadbroker" className="w-full">
          <Button variant="outline" className="w-full h-24 text-lg">
            Dashboard LeadBroker
          </Button>
        </Link>
        
        <Link to="/acquisition/sdrcontrol" className="w-full">
          <Button variant="outline" className="w-full h-24 text-lg bg-green-50 hover:bg-green-100 border-green-200">
            Controle Pré Venda
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
