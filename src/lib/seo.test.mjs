import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  AREA_SERVED,
  BUSINESS,
  HOME_DESCRIPTION,
  HOME_TITLE,
  OG_IMAGE,
  OPENING_HOURS,
  PHONE_E164,
  phoneDisplay,
  SAME_AS,
  SECONDARY_TITLE_SUFFIX,
} from './business.ts';
import { buildLocalBusinessJsonLd, serializeJsonLd } from './json-ld.ts';

const LOGO = 'https://agenciadmarques.com.br/_astro/simbolo.png';
const IMAGE = 'https://agenciadmarques.com.br/og-image.jpg';

test('identidade oficial do negocio', () => {
  assert.equal(BUSINESS.name, 'Dmarques Desenvolvimento Web');
  assert.equal(BUSINESS.url, 'https://agenciadmarques.com.br/');
  assert.equal(BUSINESS.email, 'contato@agenciadmarques.com.br');
  assert.equal(BUSINESS.locality, 'Ibitinga');
  assert.equal(BUSINESS.region, 'SP');
  assert.equal(BUSINESS.country, 'BR');
  assert.equal(BUSINESS.founder, 'Felipe Salles');
});

test('telefone E.164 derivado do WhatsApp', () => {
  assert.equal(PHONE_E164, '+5516996111785');
  assert.match(PHONE_E164, /^\+[1-9]\d{10,14}$/);
});

test('telefone de exibicao tem os mesmos digitos do E.164', () => {
  assert.equal(phoneDisplay(), '(16) 99611-1785');
  assert.equal(`55${phoneDisplay().replace(/\D/g, '')}`, PHONE_E164.slice(1));
});

test('titulo da home', () => {
  assert.equal(HOME_TITLE, 'Sites, sistemas e automações em Ibitinga/SP | Dmarques');
});

test('descricao da home', () => {
  assert.ok(HOME_DESCRIPTION.length >= 120 && HOME_DESCRIPTION.length <= 160);
  for (const termo of ['Ibitinga', 'sites', 'sistemas', 'automações']) {
    assert.ok(HOME_DESCRIPTION.includes(termo), termo);
  }
});

test('sufixo de titulo secundario', () => {
  assert.equal(SECONDARY_TITLE_SUFFIX, ' | Dmarques Desenvolvimento Web');
});

test('metadados da imagem OG', () => {
  assert.equal(typeof OG_IMAGE.alt, 'string');
  assert.ok(OG_IMAGE.alt.length > 0);
  assert.deepEqual(OG_IMAGE, {
    path: '/og-image.jpg',
    width: 1200,
    height: 630,
    type: 'image/jpeg',
    alt: OG_IMAGE.alt,
  });
});

test('area atendida e sameAs e horarios exportados', () => {
  assert.equal(AREA_SERVED.length, 6);
  assert.equal(SAME_AS.length, 2);
  assert.equal(OPENING_HOURS.length, 2);
});

test('JSON-LD: contexto, tipo, id e campos basicos', () => {
  const ld = buildLocalBusinessJsonLd({ logoUrl: LOGO, imageUrl: IMAGE });
  assert.equal(ld['@context'], 'https://schema.org');
  assert.deepEqual(ld['@type'], ['ProfessionalService', 'LocalBusiness']);
  assert.equal(ld['@id'], 'https://agenciadmarques.com.br/#organization');
  assert.equal(ld.name, BUSINESS.name);
  assert.equal(ld.url, BUSINESS.url);
  assert.equal(ld.email, BUSINESS.email);
  assert.equal(ld.telephone, PHONE_E164);
  assert.equal(ld.description, HOME_DESCRIPTION);
  assert.equal(ld.logo, LOGO);
  assert.equal(ld.image, IMAGE);
});

test('JSON-LD: endereco so com cidade', () => {
  const ld = buildLocalBusinessJsonLd({ logoUrl: LOGO, imageUrl: IMAGE });
  assert.deepEqual(ld.address, {
    '@type': 'PostalAddress',
    addressLocality: 'Ibitinga',
    addressRegion: 'SP',
    addressCountry: 'BR',
  });
  assert.ok(!('streetAddress' in ld.address));
});

test('JSON-LD: areaServed com seis cidades em ordem', () => {
  const ld = buildLocalBusinessJsonLd({ logoUrl: LOGO, imageUrl: IMAGE });
  assert.equal(ld.areaServed.length, 6);
  for (const item of ld.areaServed) assert.equal(item['@type'], 'City');
  assert.deepEqual(
    ld.areaServed.map((c) => c.name),
    ['Ibitinga', 'Araraquara', 'Matão', 'Itápolis', 'Iacanga', 'Bauru'],
  );
});

test('JSON-LD: sameAs', () => {
  const ld = buildLocalBusinessJsonLd({ logoUrl: LOGO, imageUrl: IMAGE });
  assert.deepEqual(ld.sameAs, [
    'https://www.instagram.com/agenciadmarques/',
    'https://share.google/5cU7xCYeXu5uWD9Yq',
  ]);
});

test('JSON-LD: fundador so com nome', () => {
  const ld = buildLocalBusinessJsonLd({ logoUrl: LOGO, imageUrl: IMAGE });
  assert.deepEqual(ld.founder, { '@type': 'Person', name: 'Felipe Salles' });
});

test('JSON-LD: horarios de funcionamento', () => {
  const ld = buildLocalBusinessJsonLd({ logoUrl: LOGO, imageUrl: IMAGE });
  assert.deepEqual(ld.openingHoursSpecification, [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:00',
      closes: '19:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '09:00',
      closes: '14:00',
    },
  ]);
});

test('JSON-LD: sem campos proibidos', () => {
  const ld = buildLocalBusinessJsonLd({ logoUrl: LOGO, imageUrl: IMAGE });
  for (const chave of ['priceRange', 'taxID', 'vatID', 'legalName']) {
    assert.ok(!(chave in ld), chave);
  }
});

test('serializeJsonLd escapa o sinal de menor', () => {
  const out = serializeJsonLd({ a: '</script><b>' });
  assert.ok(!out.includes('<'));
  assert.deepEqual(JSON.parse(out), { a: '</script><b>' });
});

test('serializeJsonLd escapa U+2028 e U+2029', () => {
  const out = serializeJsonLd({ a: 'x y z' });
  assert.ok(!out.includes(' '));
  assert.ok(!out.includes(' '));
  assert.ok(out.includes('\\u2028'));
  assert.ok(out.includes('\\u2029'));
  assert.deepEqual(JSON.parse(out), { a: 'x y z' });
});
