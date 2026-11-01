/** Centralized branding identity for the application */
export const BRAND = {
  name: 'AuraFest',
  company: 'AuraFest Technologies',
  tagline: "Precision Planning for Life's Defining Celebrations",
  subtitle: 'One connected plan. Every celebration, elevated.',
  shortName: 'AuraFest',
  primaryColor: '#7c3aed',
  accentColor: '#14b8a6',
  supportEmail: 'concierge@aurafest.io',
  version: '2.5.0',
} as const;

export type Brand = typeof BRAND;
