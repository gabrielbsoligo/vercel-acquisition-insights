
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SdrPage from "./pages/acquisition/SdrPage";
import CloserPage from "./pages/acquisition/CloserPage";
import ChannelsPage from "./pages/acquisition/ChannelsPage";
import LeadBrokerPage from "./pages/acquisition/LeadBrokerPage";
import SdrControlForm from "./pages/acquisition/SdrControlForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/acquisition/sdr" element={<SdrPage />} />
          <Route path="/acquisition/closer" element={<CloserPage />} />
          <Route path="/acquisition/channels" element={<ChannelsPage />} />
          <Route path="/acquisition/leadbroker" element={<LeadBrokerPage />} />
          <Route path="/acquisition/sdrcontrol" element={<SdrControlForm />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
