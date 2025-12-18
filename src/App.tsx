import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GameSelect from "./pages/GameSelect";
import ReflexTimer from "./pages/games/ReflexTimer";
import ColorChange from "./pages/games/ColorChange";
import KeywordGame from "./pages/games/KeywordGame";
import DontClick from "./pages/games/DontClick";
import SequenceFlash from "./pages/games/SequenceFlash";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/games" element={<GameSelect />} />
          <Route path="/game/reflex" element={<ReflexTimer />} />
          <Route path="/game/color" element={<ColorChange />} />
          <Route path="/game/keyword" element={<KeywordGame />} />
          <Route path="/game/dontclick" element={<DontClick />} />
          <Route path="/game/sequence" element={<SequenceFlash />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
