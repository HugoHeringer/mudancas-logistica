import { useTenantTheme } from '../../theme/TenantProvider';
import { SectionDivider } from '../luxury/SectionDivider';

export function Footer() {
  const { brand } = useTenantTheme();
  const year = new Date().getFullYear();

  return (
    <footer
      className="py-16"
      style={{
        backgroundColor: 'var(--brand-surface-dark)',
        color: 'var(--brand-on-surface-dark)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <SectionDivider className="mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.nome}
                className="h-10 object-contain mb-4"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            ) : (
              <h3
                className="text-xl font-light mb-4"
                style={{
                  fontFamily: 'var(--tenant-font-display)',
                  color: 'var(--brand-on-surface-dark)',
                }}
              >
                {brand.nome}
              </h3>
            )}
            {brand.slogan && (
              <p
                className="text-sm"
                style={{
                  color: 'color-mix(in srgb, var(--brand-on-surface-dark) 60%, transparent)',
                }}
              >
                {brand.slogan}
              </p>
            )}
          </div>

          {/* Links */}
          <div>
            <h4
              className="text-xs font-medium tracking-widest uppercase mb-4"
              style={{ color: 'var(--brand-accent)' }}
            >
              Links
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Serviços', href: '#servicos' },
                { label: 'Como Funciona', href: '#como-funciona' },
                { label: 'Galeria', href: '#galeria' },
                { label: 'Testemunhos', href: '#testemunhos' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Contacto', href: '#contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors"
                    style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 60%, transparent)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'color-mix(in srgb, var(--brand-on-surface-dark) 60%, transparent)')}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-xs font-medium tracking-widest uppercase mb-4"
              style={{ color: 'var(--brand-accent)' }}
            >
              Contacto
            </h4>
            <ul className="space-y-2 text-sm">
              {brand.contacto?.telefone && (
                <li style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 60%, transparent)' }}>
                  Tel: {brand.contacto.telefone}
                </li>
              )}
              {brand.contacto?.email && (
                <li style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 60%, transparent)' }}>
                  Email: {brand.contacto.email}
                </li>
              )}
              {brand.contacto?.morada && (
                <li style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 60%, transparent)' }}>
                  {brand.contacto.morada}
                </li>
              )}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4
              className="text-xs font-medium tracking-widest uppercase mb-4"
              style={{ color: 'var(--brand-accent)' }}
            >
              Redes Sociais
            </h4>
            <div className="flex gap-4">
              {brand.contacto?.redesSociais?.facebook && (
                <a
                  href={brand.contacto.redesSociais.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 60%, transparent)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'color-mix(in srgb, var(--brand-on-surface-dark) 60%, transparent)')}
                >
                  Facebook
                </a>
              )}
              {brand.contacto?.redesSociais?.instagram && (
                <a
                  href={brand.contacto.redesSociais.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: 'color-mix(in srgb, var(--brand-on-surface-dark) 60%, transparent)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'color-mix(in srgb, var(--brand-on-surface-dark) 60%, transparent)')}
                >
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        <div
          className="mt-12 pt-6 text-center text-xs"
          style={{
            borderTop: '1px solid color-mix(in srgb, var(--brand-on-surface-dark) 10%, transparent)',
            color: 'color-mix(in srgb, var(--brand-on-surface-dark) 50%, transparent)',
          }}
        >
          &copy; {year} {brand.nome}. Todos os direitos reservados. Plataforma{' '}
          <a
            href="https://movefy.app"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors"
            style={{ color: 'var(--brand-accent)' }}
          >
            Movefy
          </a>
        </div>
      </div>
    </footer>
  );
}
