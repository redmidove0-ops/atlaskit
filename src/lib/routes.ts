// src/lib/routes.ts
// Centralized route builder – single source of truth for all app routes.
// Prevents hardcoded path strings scattered across components.

export const routes = {
  home: (locale: string) => `/${locale}`,
  dashboard: (locale: string) => `/${locale}/dashboard`,
  login: (locale: string) => `/${locale}/login`,
  logout: (locale: string) => `/${locale}/logout`,

  // Documents
  documents: (locale: string) => `/${locale}/documents`,
  documentNew: (locale: string) => `/${locale}/documents/new`,
  document: (locale: string, id: string) => `/${locale}/documents/${id}`,
  documentPrint: (locale: string, id: string) => `/${locale}/documents/${id}/print`,
  documentPreviewPrint: (locale: string) => `/${locale}/documents/preview/print`,

  // Other sections
  clients: (locale: string) => `/${locale}/clients`,
  products: (locale: string) => `/${locale}/products`,
  templates: (locale: string) => `/${locale}/templates`,
  settings: (locale: string) => `/${locale}/settings`,
  settingsCompany: (locale: string) => `/${locale}/settings/company`,
};
