import { HeroSection } from '../components/site/HeroSection';
import { ServicesSection } from '../components/site/ServicesSection';
import { ComoFuncionaSection } from '../components/site/ComoFuncionaSection';
import { TrustSection } from '../components/site/TrustSection';
import { GallerySection } from '../components/site/GallerySection';
import { TestimonialsSection } from '../components/site/TestimonialsSection';
import { FaqSection } from '../components/site/FaqSection';
import { ContactSection } from '../components/site/ContactSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <ComoFuncionaSection />
      <TrustSection />
      <GallerySection />
      <TestimonialsSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
