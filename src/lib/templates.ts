// src/lib/templates.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — Template Configuration (Legacy)
// Re-exports from design system for backward compatibility
// ────────────────────────────────────────────────────────────────

// Re-export from design system
export { 
  type TemplateId,
  TEMPLATE_LIST,
  normalizeTemplateId as normalizeTemplate,
  CLASSIC_TEMPLATE,
  MODERN_TEMPLATE,
} from '@/lib/design';

export const TEMPLATE_COOKIE = 'atlaskit_template';
export const DEFAULT_TEMPLATE = 'classic' as const;

// Legacy templates array format for backward compatibility
export const templates: Array<{
  id: 'classic' | 'modern';
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

