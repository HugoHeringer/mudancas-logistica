import { Truck, Globe, Warehouse, Package } from 'lucide-react';
import { GlassCard } from '../luxury/GlassCard';
import { AnimatedSection } from '../luxury/AnimatedSection';
import { SectionDivider } from '../luxury/SectionDivider';

const services = [
  {
    icon: Truck,
    title: 'Mudancas Locais',
    description: 'Mudancas dentro da mesma cidade com eficiencia e cuidado. Equipa profissional e veiculos adequados.',
  },
  {
    icon: Globe,
    title: 'Mudancas Nacionais',
    description: 'Cobertura em todo o territorio nacional. Logistica planeada para garantir a seguranca dos seus bens.',
  },
  {
    icon: Package,
    title: 'Mudancas Internacionais',
    description: 'Transporte internacional com todo o suporte aduaneiro e documental necessario.',
  },
  {
    icon: Warehouse,
    title: 'Armazenagem',
    description: 'Espacos de armazenamento seguros e climatizados para guardar os seus bens pelo tempo que precisar.',
  },
];

export function ServicesSection() {
  return (
    <section id="servicos" className="py-24 bg-sand">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="section-label">Os nossos servicos</span>
            <h2 className="section-title">Solucoes completas para a sua mudanca</h2>
          </div>
        </AnimatedSection>

        <SectionDivider className="mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <AnimatedSection key={service.title} delay={i * 120}>
              <GlassCard hover className="p-8 h-full">
                <service.icon className="w-10 h-10 text-terracotta mb-6" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-light mb-3">{service.title}</h3>
                <p className="text-brown/60 text-sm leading-relaxed">{service.description}</p>
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
