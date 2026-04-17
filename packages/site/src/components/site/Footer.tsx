import { useTenantTheme } from '../../theme/TenantProvider';
import { SectionDivider } from '../luxury/SectionDivider';

export function Footer() {
  const { brand } = useTenantTheme();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night text-cream py-16">
      <div className="max-w-7xl mx-auto px-6">
        <SectionDivider className="mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-xl font-light mb-4">{brand.nome}</h3>
            {brand.slogan && (
              <p className="text-cream-muted text-sm">{brand.slogan}</p>
            )}
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-medium tracking-widest uppercase text-gold mb-4">Links</h4>
            <ul className="space-y-2 text-sm text-cream-muted">
              <li><a href="#servicos" className="hover:text-gold transition-colors">Servicos</a></li>
              <li><a href="#sobre" className="hover:text-gold transition-colors">Sobre</a></li>
              <li><a href="#galeria" className="hover:text-gold transition-colors">Galeria</a></li>
              <li><a href="#testemunhos" className="hover:text-gold transition-colors">Testemunhos</a></li>
              <li><a href="#contacto" className="hover:text-gold transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-medium tracking-widest uppercase text-gold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-cream-muted">
              {brand.contacto?.telefone && (
                <li>Tel: {brand.contacto.telefone}</li>
              )}
              {brand.contacto?.email && (
                <li>Email: {brand.contacto.email}</li>
              )}
              {brand.contacto?.morada && (
                <li>{brand.contacto.morada}</li>
              )}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-medium tracking-widest uppercase text-gold mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              {brand.contacto?.redesSociais?.facebook && (
                <a
                  href={brand.contacto.redesSociais.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream-muted hover:text-gold transition-colors"
                >
                  Facebook
                </a>
              )}
              {brand.contacto?.redesSociais?.instagram && (
                <a
                  href={brand.contacto.redesSociais.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream-muted hover:text-gold transition-colors"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-center text-xs text-cream-muted">
          &copy; {year} {brand.nome}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
