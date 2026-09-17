export const PROJECT_TYPE_VALUES = [
  'site-institucional',
  'sistema-sob-medida',
  'ecommerce-plataforma',
  'automacao',
  'nao-sei',
] as const;

export type ProjectType = (typeof PROJECT_TYPE_VALUES)[number];

export const PROJECT_TYPES = [
  { value: 'site-institucional', label: 'Site institucional' },
  { value: 'sistema-sob-medida', label: 'Sistema web sob medida' },
  { value: 'ecommerce-plataforma', label: 'E-commerce ou plataforma' },
  { value: 'automacao', label: 'Automação de processo' },
  { value: 'nao-sei', label: 'Ainda não sei' },
] as const satisfies ReadonlyArray<{ value: ProjectType; label: string }>;
