import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
