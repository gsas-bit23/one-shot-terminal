import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './pages/LandingPage';
import './index.css';

const App = lazy(() => import('./App'));
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

const Loading = () => (
  <div className="h-screen flex items-center justify-center bg-[#0A0B0D] text-[#8A91A6] text-sm">
    Loading terminal…
  </div>
);

const terminal = (
  <Suspense fallback={<Loading />}>
    <App />
  </Suspense>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/token/:addr" element={terminal} />
          <Route path="/:tab" element={terminal} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
