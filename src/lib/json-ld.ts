import {
  AREA_SERVED,
  BUSINESS,
  HOME_DESCRIPTION,
  OPENING_HOURS,
  PHONE_E164,
  SAME_AS,
} from './business.ts';

export function buildLocalBusinessJsonLd({
  logoUrl,
  imageUrl,
}: {
  logoUrl: string;
  imageUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': `${BUSINESS.url}#organization`,
    name: BUSINESS.name,
    description: HOME_DESCRIPTION,
    url: BUSINESS.url,
    logo: logoUrl,
    image: imageUrl,
    telephone: PHONE_E164,
    email: BUSINESS.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS.locality,
      addressRegion: BUSINESS.region,
      addressCountry: BUSINESS.country,
    },
    areaServed: AREA_SERVED.map((name) => ({ '@type': 'City', name })),
    openingHoursSpecification: OPENING_HOURS.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [...h.days],
      opens: h.opens,
      closes: h.closes,
    })),
    founder: { '@type': 'Person', name: BUSINESS.founder },
    sameAs: [...SAME_AS],
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
