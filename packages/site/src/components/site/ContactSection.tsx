import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { useTenantTheme } from '../../theme/TenantProvider';
import { GlassCard } from '../luxury/GlassCard';
import { AnimatedSection } from '../luxury/AnimatedSection';
import { SectionDivider } from '../luxury/SectionDivider';

export function ContactSection() {
  const { brand } = useTenantTheme();

  const whatsappNumber = brand.contacto?.whatsapp || brand.contacto?.telefone?.replace(/\s/g, '') || '';

  return (
    <section
      id="contacto"
      className="py-24"
      style={{ backgroundColor: 'var(--brand-surface)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="section-label">Contacto</span>
            <h2
              className="section-title"
              style={{ color: 'var(--brand-on-surface)' }}
            >
              Fale connosco
            </h2>
          </div>
        </AnimatedSection>

        <SectionDivider className="mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Info */}
          <AnimatedSection direction="left">
            <div className="space-y-8">
              {brand.contacto?.morada && (
                <div className="flex items-start gap-4">
                  <MapPin
                    className="w-6 h-6 shrink-0 mt-1"
                    style={{ color: 'var(--brand-secondary)' }}
                  />
                  <div>
                    <h4
                      className="text-lg font-light mb-1"
                      style={{
                        color: 'var(--brand-on-surface)',
                        fontFamily: 'var(--tenant-font-display)',
                      }}
                    >
                      Morada
                    </h4>
                    <p
                      className="text-sm"
                      style={{ color: 'color-mix(in srgb, var(--brand-on-surface) 60%, transparent)' }}
                    >
                      {brand.contacto.morada}
                    </p>
                  </div>
                </div>
              )}

              {brand.contacto?.telefone && (
                <div className="flex items-start gap-4">
                  <Phone
                    className="w-6 h-6 shrink-0 mt-1"
                    style={{ color: 'var(--brand-secondary)' }}
                  />
                  <div>
                    <h4
                      className="text-lg font-light mb-1"
                      style={{
                        color: 'var(--brand-on-surface)',
                        fontFamily: 'var(--tenant-font-display)',
                      }}
                    >
                      Telefone
                    </h4>
                    <a
                      href={`tel:${brand.contacto.telefone}`}
                      className="text-sm transition-colors"
                      style={{ color: 'color-mix(in srgb, var(--brand-on-surface) 60%, transparent)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'color-mix(in srgb, var(--brand-on-surface) 60%, transparent)')}
                    >
                      {brand.contacto.telefone}
                    </a>
                  </div>
                </div>
              )}

              {brand.contacto?.email && (
                <div className="flex items-start gap-4">
                  <Mail
                    className="w-6 h-6 shrink-0 mt-1"
                    style={{ color: 'var(--brand-secondary)' }}
                  />
                  <div>
                    <h4
                      className="text-lg font-light mb-1"
                      style={{
                        color: 'var(--brand-on-surface)',
                        fontFamily: 'var(--tenant-font-display)',
                      }}
                    >
                      Email
                    </h4>
                    <a
                      href={`mailto:${brand.contacto.email}`}
                      className="text-sm transition-colors"
                      style={{ color: 'color-mix(in srgb, var(--brand-on-surface) 60%, transparent)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'color-mix(in srgb, var(--brand-on-surface) 60%, transparent)')}
                    >
                      {brand.contacto.email}
                    </a>
                  </div>
                </div>
              )}

              {whatsappNumber && (
                <div className="flex items-start gap-4">
                  <MessageCircle
                    className="w-6 h-6 shrink-0 mt-1"
                    style={{ color: 'var(--brand-secondary)' }}
                  />
                  <div>
                    <h4
                      className="text-lg font-light mb-1"
                      style={{
                        color: 'var(--brand-on-surface)',
                        fontFamily: 'var(--tenant-font-display)',
                      }}
                    >
                      WhatsApp
                    </h4>
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm transition-colors"
                      style={{ color: 'color-mix(in srgb, var(--brand-on-surface) 60%, transparent)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'color-mix(in srgb, var(--brand-on-surface) 60%, transparent)')}
                    >
                      Enviar mensagem
                    </a>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Map */}
          <AnimatedSection direction="right">
            <GlassCard
              className="overflow-hidden h-[300px] md:h-full min-h-[300px]"
              style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)' }}
            >
              <iframe
                title="Localização"
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
