import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mudanças & Logística - Serviços de Mudanças Profissionais',
  description: 'Empresa líder em mudanças locais, nacionais e internacionais. Peça o seu orçamento online.',
  keywords: 'mudanças, transporte, logística, mudanças lisboa, mudanças porto',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
