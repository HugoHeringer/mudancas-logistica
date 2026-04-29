import Navbar from '@/components/navbar';
import Hero from '@/components/sections/hero';
import Features from '@/components/sections/features';
import ComoFunciona from '@/components/sections/como-funciona';
import Precos from '@/components/sections/precos';
import Testemunhos from '@/components/sections/testemunhos';
import Faq from '@/components/sections/faq';
import TrialForm from '@/components/sections/trial-form';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ComoFunciona />
        <Testemunhos />
        <Precos />
        <Faq />
        <TrialForm />
      </main>
      <Footer />
    </>
  );
}
