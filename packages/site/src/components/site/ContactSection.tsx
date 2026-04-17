import { MapPin, Phone, Mail } from 'lucide-react';
import { useTenantTheme } from '../../theme/TenantProvider';
import { GlassCard } from '../luxury/GlassCard';
import { AnimatedSection } from '../luxury/AnimatedSection';
import { SectionDivider } from '../luxury/SectionDivider';

export function ContactSection() {
  const { brand } = useTenantTheme();

  return (
    <section id="contacto" className="py-24 bg-sand">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="section-label">Contacto</span>
            <h2 className="section-title">Fale connosco</h2>
          </div>
        </AnimatedSection>

        <SectionDivider className="mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Info */}
          <AnimatedSection direction="left">
            <div className="space-y-8">
              {brand.contacto?.morada && (
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-terracotta shrink-0 mt-1" />
                  <div>
                    <h4 className="font-display text-lg font-light mb-1">Morada</h4>
                    <p className="text-brown/60 text-sm">{brand.contacto.morada}</p>
                  </div>
                </div>
              )}

              {brand.contacto?.telefone && (
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-terracotta shrink-0 mt-1" />
                  <div>
                    <h4 className="font-display text-lg font-light mb-1">Telefone</h4>
                    <a href={`tel:${brand.contacto.telefone}`} className="text-brown/60 text-sm hover:text-terracotta transition-colors">
                      {brand.contacto.telefone}
                    </a>
                  </div>
                </div>
              )}

              {brand.contacto?.email && (
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-terracotta shrink-0 mt-1" />
                  <div>
                    <h4 className="font-display text-lg font-light mb-1">Email</h4>
                    <a href={`mailto:${brand.contacto.email}`} className="text-brown/60 text-sm hover:text-terracotta transition-colors">
                      {brand.contacto.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Map */}
          <AnimatedSection direction="right">
            <GlassCard className="overflow-hidden h-[300px] md:h-full min-h-[300px]">
              <iframe
                title="Localizacao"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12469.776493332698!2d-9.142685!3d38.736946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd193368b7c5c3e3%3A0x400ebbde49036d0!2sLisboa!5e0!3m2!1spt-PT!2spt!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '300px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </GlassCard>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
