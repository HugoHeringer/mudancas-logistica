import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { TenantProvider } from './theme/TenantProvider';
import { SiteLayout } from './layouts/site.layout';
import { HomePage } from './pages/home.page';
import { AgendarPage } from './pages/agendar.page';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TenantProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/agendar" element={<AgendarPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TenantProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}
