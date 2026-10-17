import { formatPhone } from './form-schema.ts';
import { WHATSAPP_NUMBER } from './whatsapp.ts';

export const BUSINESS = {
  name: 'Dmarques Desenvolvimento Web',
  shortName: 'Dmarques',
  url: 'https://agenciadmarques.com.br/',
  email: 'contato@agenciadmarques.com.br',
  locality: 'Ibitinga',
  region: 'SP',
  country: 'BR',
  founder: 'Felipe Salles',
} as const;

export const PHONE_E164 = `+${WHATSAPP_NUMBER}`;

export function phoneDisplay(): string {
  return formatPhone(WHATSAPP_NUMBER.slice(2));
}

export const AREA_SERVED = [
  'Ibitinga',
  'Araraquara',
  'Matão',
  'Itápolis',
  'Iacanga',
  'Bauru',
] as const;

export const SAME_AS = [
  'https://www.instagram.com/agenciadmarques/',
  'https://share.google/5cU7xCYeXu5uWD9Yq',
] as const;

export const OPENING_HOURS = [
  {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '07:00',
    closes: '19:00',
  },
  { days: ['Saturday'], opens: '09:00', closes: '14:00' },
] as const;

export const HOME_TITLE = 'Sites, sistemas e automações em Ibitinga/SP | Dmarques';

export const HOME_DESCRIPTION =
  'Criamos sites, sistemas sob medida e automações em Ibitinga/SP e região. Rápidos, seguros e prontos para crescer. Fale direto com quem desenvolve.';

export const SECONDARY_TITLE_SUFFIX = ` | ${BUSINESS.name}`;

export const OG_IMAGE = {
  path: '/og-image.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'Dmarques Desenvolvimento Web: Software sob medida, com acabamento de produto.',
} as const;
