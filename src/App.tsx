import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import InvestorsPage from "./pages/Investors";
import InvestorDetail from "./pages/InvestorDetail";
import StartupsPage from "./pages/Startups";
import StartupDetail from "./pages/StartupDetail";
import AgentsPage from "./pages/Agents";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/investors" element={<InvestorsPage />} />
          <Route path="/investors/:id" element={<InvestorDetail />} />
          <Route path="/startups" element={<StartupsPage />} />
          <Route path="/startups/:id" element={<StartupDetail />} />
          <Route path="/agents" element={<AgentsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
