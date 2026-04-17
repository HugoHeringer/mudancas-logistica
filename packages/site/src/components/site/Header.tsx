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
    { label: 'Servicos', href: '#servicos' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Galeria', href: '#galeria' },
    { label: 'Testemunhos', href: '#testemunhos' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-sand/90 backdrop-blur-md shadow-sm border-b border-gold/10'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.nome} className="h-10 w-auto" />
          ) : (
            <span className="font-display text-2xl font-light tracking-tight" style={{ color: 'var(--tenant-primary)' }}>
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
              className="text-sm font-medium tracking-wide uppercase text-brown/70 hover:text-brown transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
          <Link to="/agendar">
            <button className="px-6 py-2.5 text-xs font-medium tracking-widest uppercase bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-all duration-300 hover:-translate-y-0.5">
              Pedir Orcamento
            </button>
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-brown"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-sand/95 backdrop-blur-md border-t border-gold/10">
          <nav className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium tracking-wide uppercase text-brown/70 hover:text-brown transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link to="/agendar" onClick={() => setMenuOpen(false)}>
              <button className="w-full px-6 py-2.5 text-xs font-medium tracking-widest uppercase bg-primary text-primary-foreground rounded-sm">
                Pedir Orcamento
              </button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
