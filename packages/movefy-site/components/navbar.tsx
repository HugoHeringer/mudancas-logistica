'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'lucide-react';

const navLinks = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Preços', href: '#precos' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleScrollTo = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="container-lg flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 no-underline"
            aria-label="Movefy - Página inicial"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
              <Zap className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-outfit)', color: 'var(--color-primary)' }}
            >
              MOVEFY
            </span>
          </a>

          {/* Nav Desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleScrollTo(link.href)}
                className="btn-ghost text-sm"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTAs Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://console.movefy.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-sm px-4 py-2"
              id="navbar-entrar-btn"
            >
              Entrar
            </a>
            <button
              onClick={() => handleScrollTo('#trial')}
              className="btn-primary text-sm px-4 py-2"
              id="navbar-trial-btn"
            >
              Começar grátis
            </button>
          </div>

          {/* Hamburger Mobile */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isOpen}
            id="navbar-hamburger-btn"
          >
            {isOpen
              ? <X className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              : <Menu className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            }
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <nav
            className="absolute top-0 right-0 h-full w-72 shadow-xl flex flex-col pt-20 pb-8 px-6"
            style={{ background: 'var(--color-card)' }}
            aria-label="Menu mobile"
          >
            <div className="flex flex-col gap-2 flex-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleScrollTo(link.href)}
                  className="text-left py-3 px-4 rounded-xl font-medium transition-colors hover:bg-gray-50"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-inter)' }}
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-border">
              <a
                href="https://console.movefy.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-center"
                id="mobile-entrar-btn"
              >
                Entrar
              </a>
              <button
                onClick={() => handleScrollTo('#trial')}
                className="btn-primary"
                id="mobile-trial-btn"
              >
                Começar grátis
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
