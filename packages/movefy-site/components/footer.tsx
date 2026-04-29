'use client';

import { Zap, Linkedin, Instagram, Mail } from 'lucide-react';

const footerLinks = [
  {
    title: 'Produto',
    links: [
      { label: 'Funcionalidades', href: '#funcionalidades' },
      { label: 'Preços', href: '#precos' },
      { label: 'Como Funciona', href: '#como-funciona' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contacto', href: 'mailto:hello@movefy.pt' },
      { label: 'Console (Login)', href: 'https://console.movefy.pt' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termos de Uso', href: '/termos' },
      { label: 'Política de Privacidade', href: '/privacidade' },
      { label: 'RGPD', href: '/privacidade' },
    ],
  },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer style={{ background: 'var(--color-primary)' }}>
      <div className="container-lg px-4 py-16">
        {/* Top grid */}
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(232,184,75,0.2)' }}
              >
                <Zap className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              </div>
              <span
                className="text-xl font-bold text-white"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                MOVEFY
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              A plataforma de gestão para empresas de mudanças portuguesas. Admin, site, PWA e financeiro integrado.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              <a
                href="https://linkedin.com/company/movefy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)' }}
                aria-label="LinkedIn da Movefy"
                id="footer-linkedin-link"
              >
                <Linkedin className="w-4 h-4 text-white/60" />
              </a>
              <a
                href="https://instagram.com/movefy.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)' }}
                aria-label="Instagram da Movefy"
                id="footer-instagram-link"
              >
                <Instagram className="w-4 h-4 text-white/60" />
              </a>
              <a
                href="mailto:hello@movefy.pt"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)' }}
                aria-label="Email da Movefy"
                id="footer-email-link"
              >
                <Mail className="w-4 h-4 text-white/60" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-accent)' }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <button
                        onClick={() => scrollTo(link.href)}
                        className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px mb-8" style={{ background: 'rgba(255,255,255,0.1)' }} />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>© {new Date().getFullYear()} Movefy. Todos os direitos reservados.</p>
          <p>Feito com ❤️ em 🇵🇹 Portugal</p>
        </div>
      </div>
    </footer>
  );
}
