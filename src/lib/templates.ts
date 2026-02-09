export type TemplateId = 'classic' | 'modern';

export const TEMPLATE_COOKIE = 'atlaskit_template';
export const DEFAULT_TEMPLATE: TemplateId = 'classic';

export const templates: Array<{
  id: TemplateId;
  title: string;
  description: string;
}> = [
  {
    id: 'classic',
    title: 'Classic',
    description: 'Clean and minimal. Great for invoices and reports.'
  },
  {
    id: 'modern',
    title: 'Modern',
    description: 'Bold header, modern look. Great for branding.'
  }
];

export function normalizeTemplate(value: unknown): TemplateId {
  return value === 'modern' ? 'modern' : 'classic';
}
