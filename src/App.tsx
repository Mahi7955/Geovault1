import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateSecret from "./pages/CreateSecret";
import ViewSecret from "./pages/ViewSecret";
import NotFound from "./pages/NotFound";
import DocsLayout from "./pages/docs/DocsLayout";
import Introduction from "./pages/docs/Introduction";
import QuickStart from "./pages/docs/QuickStart";
import Architecture from "./pages/docs/Architecture";
import Database from "./pages/docs/Database";
import Security from "./pages/docs/Security";
import API from "./pages/docs/API";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-secret" element={<CreateSecret />} />
          <Route path="/secret/:secretId" element={<ViewSecret />} />
          <Route path="/docs" element={<DocsLayout />}>
            <Route index element={<Introduction />} />
            <Route path="introduction" element={<Introduction />} />
            <Route path="quick-start" element={<QuickStart />} />
            <Route path="architecture" element={<Architecture />} />
            <Route path="database" element={<Database />} />
            <Route path="security" element={<Security />} />
            <Route path="api" element={<API />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
