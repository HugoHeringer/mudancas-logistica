import type { Metadata } from 'next';
import './globals.css';
import { inter, outfit } from '@/lib/fonts';

export const metadata: Metadata = {
  title: {
    default: 'Movefy — Software de Gestão para Empresas de Mudanças | Portugal',
    template: '%s | Movefy',
  },
  description:
    'Plataforma all-in-one para empresas de mudanças: gestão de clientes, agenda inteligente, PWA para motoristas e site público automático. Experimente 30 dias grátis.',
  keywords: [
    'software mudanças',
    'gestão empresa mudanças',
    'app motoristas mudanças',
    'agenda mudanças Portugal',
    'SaaS mudanças',
    'sistema mudanças online',
  ],
  openGraph: {
    title: 'Movefy — Software de Gestão para Empresas de Mudanças',
    description:
      'Tudo o que a sua empresa de mudanças precisa numa só plataforma. Admin, site, app PWA e financeiro integrado.',
    url: 'https://movefy.pt',
    siteName: 'Movefy',
    locale: 'pt_PT',
    type: 'website',
    images: [
      {
        url: 'https://movefy.pt/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Movefy — Plataforma para Empresas de Mudanças',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Movefy — Software de Gestão para Empresas de Mudanças',
    description: 'Plataforma all-in-one para empresas de mudanças em Portugal.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  metadataBase: new URL('https://movefy.pt'),
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Movefy',
  operatingSystem: 'Web',
  applicationCategory: 'BusinessApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    description: 'Trial gratuito de 30 dias',
  },
  url: 'https://movefy.pt',
  description:
    'Software de gestão all-in-one para empresas de mudanças em Portugal.',
  publisher: {
    '@type': 'Organization',
    name: 'Movefy',
    url: 'https://movefy.pt',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
