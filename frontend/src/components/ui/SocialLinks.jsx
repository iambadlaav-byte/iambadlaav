/**
 * SocialLinks — shared row of brand icons (Instagram, WhatsApp, YouTube,
 * Facebook). Used in the footer and on the contact page. Links render only
 * when their destination is set in SOCIAL / WHATSAPP_NUMBER, so YouTube and
 * Facebook stay hidden until real URLs are added (see content.js SOCIAL).
 *
 * lucide-react has no WhatsApp brand glyph, so it ships inline below.
 */
import { Instagram, Facebook, Youtube } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { SOCIAL } from '../../lib/content.js';
import { WHATSAPP_NUMBER } from '../../lib/constants.js';

function WhatsAppIcon({ size = 20, ...props }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.477-.911zm5.392-15.205c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    </svg>
  );
}

const waHref = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`;

// Render order. `href` is the single source of truth: an empty href is skipped.
const LINKS = [
  { key: 'instagram', label: 'Instagram', href: SOCIAL.instagram, Icon: Instagram },
  { key: 'whatsapp',  label: 'WhatsApp',  href: waHref,           Icon: WhatsAppIcon },
  { key: 'youtube',   label: 'YouTube',   href: SOCIAL.youtube,   Icon: Youtube },
  { key: 'facebook',  label: 'Facebook',  href: SOCIAL.facebook,  Icon: Facebook },
];

export function SocialLinks({ className = '', iconSize = 20 }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {LINKS.filter((l) => l.href).map(({ key, label, href, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-charcoal/80 hover:text-teal transition-colors"
        >
          <Icon size={iconSize} />
        </a>
      ))}
    </div>
  );
}
