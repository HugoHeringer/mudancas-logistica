import { HeroSection } from '../components/site/HeroSection';
import { ServicesSection } from '../components/site/ServicesSection';
import { TrustSection } from '../components/site/TrustSection';
import { GallerySection } from '../components/site/GallerySection';
import { TestimonialsSection } from '../components/site/TestimonialsSection';
import { ContactSection } from '../components/site/ContactSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <TrustSection />
      <GallerySection />
      <TestimonialsSection />
      <ContactSection />
    </>
  );
}
