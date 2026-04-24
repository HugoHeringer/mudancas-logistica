/**
 * Tenant Branding Types
 * Define a estrutura de configMarca para multi-tenant SaaS
 */

export interface TenantBrandCores {
  primaria: string;        // #1B4D3E (verde-escuro default)
  primariaLight: string;   // #2A7A64
  secundaria: string;      // #C4572A (terracota/accent)
  acento: string;          // #D4A853 (dourado)
  fundo: string;           // #F5EDE0 (off-white quente)
  fundoEscuro: string;     // #0A0F1E (night)
  texto: string;           // #2C1810 (brown)
  textoClaro: string;      // #F0E6D6 (cream)
}

export interface TenantBrandFontes {
  display: string;  // 'Cormorant Garamond'
  body: string;     // 'Inter'
}

export interface TenantDepoimento {
  nome: string;
  texto: string;
  estrelas: number;
}

export interface TenantAvaliacoes {
  googleRating?: number;
  googleReviews?: number;
  depoimentos?: TenantDepoimento[];
}

export interface TenantRedesSociais {
  facebook?: string;
  instagram?: string;
}

export interface TenantContacto {
  telefone?: string;
  email?: string;
  whatsapp?: string;
  morada?: string;
  redesSociais?: TenantRedesSociais;
}

export interface TenantBrand {
  nome: string;
  slogan?: string;
  logoUrl?: string;
  faviconUrl?: string;
  cores: TenantBrandCores;
  fontes: TenantBrandFontes;
  heroImageUrl?: string;
  bannerUrls?: string[];
  galeriaUrls?: string[];
  avaliacoes?: TenantAvaliacoes;
  contacto?: TenantContacto;
}
