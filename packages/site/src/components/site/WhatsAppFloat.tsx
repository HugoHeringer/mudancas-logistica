import { MessageCircle } from 'lucide-react';
import { useTenantTheme } from '../../theme/TenantProvider';

export function WhatsAppFloat() {
  const { brand } = useTenantTheme();
  const whatsappNumber = brand.contacto?.whatsapp || brand.contacto?.telefone?.replace(/\s/g, '') || '';

  if (!whatsappNumber) return null;

  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <a
      href={`https://wa.me/${cleanNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      title="Conversar no WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
