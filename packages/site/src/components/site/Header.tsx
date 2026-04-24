import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTenantTheme } from '../../theme/TenantProvider';
import { cn } from '../../lib/utils';

export function Header() {
  const { brand } = useTenantTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Serviços', href: '#servicos' },
    { label: 'Como Funciona', href: '#como-funciona' },
    { label: 'Galeria', href: '#galeria' },
    { label: 'Testemunhos', href: '#testemunhos' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
      style={{
        backgroundColor: scrolled
          ? 'color-mix(in srgb, var(--brand-surface) 90%, transparent)'
          : 'transparent',
        borderBottom: scrolled
          ? '1px solid color-mix(in srgb, var(--brand-accent) 10%, transparent)'
          : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.nome}
              className="h-10 w-auto"
              style={{
                filter: scrolled ? 'none' : 'brightness(0) invert(1)',
                transition: 'filter 0.5s ease',
              }}
            />
          ) : (
            <span
              className="font-display text-2xl font-light tracking-tight"
              style={{
                color: scrolled ? 'var(--brand-primary)' : 'var(--brand-on-surface-dark)',
                fontFamily: 'var(--tenant-font-display)',
                transition: 'color 0.5s ease',
              }}
            >
              {brand.nome}
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide uppercase transition-colors duration-300"
              style={{
                color: scrolled
                  ? 'color-mix(in srgb, var(--brand-on-surface) 70%, transparent)'
                  : 'color-mix(in srgb, var(--brand-on-surface-dark) 70%, transparent)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = scrolled ? 'var(--brand-primary)' : 'var(--brand-on-surface-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = scrolled
                  ? 'color-mix(in srgb, var(--brand-on-surface) 70%, transparent)'
                  : 'color-mix(in srgb, var(--brand-on-surface-dark) 70%, transparent)';
              }}
            >
              {link.label}
            </a>
          ))}
          <Link to="/agendar">
            <button className="btn-brand-primary px-6 py-2.5 text-xs font-medium tracking-widest uppercase rounded-sm">
              Pedir Orçamento
            </button>
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            color: scrolled ? 'var(--brand-on-surface)' : 'var(--brand-on-surface-dark)',
          }}
          className="md:hidden"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div
          className="md:hidden backdrop-blur-md"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 95%, transparent)',
            borderTop: '1px solid color-mix(in srgb, var(--brand-accent) 10%, transparent)',
          }}
        >
          <nav className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium tracking-wide uppercase"
                style={{ color: 'color-mix(in srgb, var(--brand-on-surface) 70%, transparent)' }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link to="/agendar" onClick={() => setMenuOpen(false)}>
              <button className="btn-brand-primary w-full px-6 py-2.5 text-xs font-medium tracking-widest uppercase rounded-sm">
                Pedir Orçamento
              </button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
