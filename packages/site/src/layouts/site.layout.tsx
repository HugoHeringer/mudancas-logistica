import { Outlet } from 'react-router-dom';
import { Header } from '../components/site/Header';
import { Footer } from '../components/site/Footer';
import { WhatsAppFloat } from '../components/site/WhatsAppFloat';
import { TenantSeo } from '../components/site/TenantSeo';
import { NoiseOverlay } from '../components/luxury/NoiseOverlay';

export function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TenantSeo />
      <NoiseOverlay />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
