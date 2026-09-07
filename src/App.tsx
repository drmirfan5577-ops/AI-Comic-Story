import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layout/Header';
import { Generator } from '@/pages/Generator';
import { Creations } from '@/pages/Creations';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen">
          <Header />
          <Routes>
            <Route path="/" element={<Generator />} />
            <Route path="/creations" element={<Creations />} />
          </Routes>
        </div>
        <Toaster position="top-center" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
