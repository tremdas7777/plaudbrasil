import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import CartSidebar from "@/components/CartSidebar";
import Index from "./pages/Index.tsx";
import SafePage from "./pages/SafePage.tsx";
const PlaudNote = lazy(() => import("./pages/PlaudNote.tsx"));
const PlaudNotePin = lazy(() => import("./pages/PlaudNotePin.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AdminPanel = lazy(() => import("./pages/AdminPanel.tsx"));
import { useCloaker } from "./hooks/useCloaker";
import { injectPixels, loadPixelConfigFromDb } from "./lib/pixelManager";
import { captureCampaignParams } from "./lib/campaignParams";


const queryClient = new QueryClient();

const CloakedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isBot, loading } = useCloaker();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f4' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #ccc', borderTop: '4px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isBot) {
    return <SafePage />;
  }

  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    captureCampaignParams();
    loadPixelConfigFromDb().then(cfg => {
      injectPixels(cfg);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CartProvider>
            <CartSidebar />
            <Suspense fallback={<div className="min-h-screen" />}>
              <Routes>
                <Route path="/" element={<CloakedRoute><Index /></CloakedRoute>} />
                <Route path="/plaud-note" element={<CloakedRoute><PlaudNote /></CloakedRoute>} />
                <Route path="/plaud-notepin" element={<CloakedRoute><PlaudNotePin /></CloakedRoute>} />
                <Route path="/checkout" element={<CloakedRoute><Checkout /></CloakedRoute>} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/safe" element={<SafePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>

          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
