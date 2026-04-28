import { Helmet } from 'react-helmet-async';
import { useTenantTheme } from '../../theme/TenantProvider';

export function TenantSeo() {
  const { brand, tenantId } = useTenantTheme();

  const title = brand.nome ? `${brand.nome} — Mudanças e Transporte` : 'Mudanças & Logística';
  const description = brand.nome
    ? `Empresa de mudanças ${brand.nome}. Serviços locais, nacionais e internacionais. Peça orçamento grátis.`
    : 'Serviços de mudanças e logística. Peça orçamento grátis.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MovingCompany',
    name: brand.nome || 'Mudanças',
    url: window.location.origin,
    ...(brand.contacto?.telefone && { telephone: brand.contacto.telefone }),
    ...(brand.contacto?.email && { email: brand.contacto.email }),
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PT',
    },
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={brand.nome || 'Mudanças'} />
      <meta property="og:description" content={description} />
      {brand.logoUrl && <meta property="og:image" content={brand.logoUrl} />}
      <meta property="og:type" content="website" />
      <meta name="robots" content="index, follow" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
