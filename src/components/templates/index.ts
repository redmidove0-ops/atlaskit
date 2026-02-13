// src/components/templates/index.ts
// ────────────────────────────────────────────────────────────────
// AtlasKit — Template Components Index
// Export all document template components
// ────────────────────────────────────────────────────────────────

export { default as ClassicTemplate } from './ClassicTemplate';
export { default as ModernTemplate } from './ModernTemplate';

// Re-export template types and utilities from design system
export {
  type TemplateId,
  type TemplateConfig,
  TEMPLATES,
  TEMPLATE_LIST,
  getTemplateConfig,
  normalizeTemplateId,
  CLASSIC_TEMPLATE,
  MODERN_TEMPLATE,
} from '@/lib/design';
