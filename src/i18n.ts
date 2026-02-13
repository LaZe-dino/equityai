import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export const locales = ['en', 'es', 'fr', 'zh', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Map country codes to locales
const countryToLocale: Record<string, Locale> = {
  US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en', IN: 'en',
  MX: 'es', ES: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  FR: 'fr', BE: 'fr', CH: 'fr', CA_FR: 'fr',
  CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
  SA: 'ar', AE: 'ar', EG: 'ar', QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar',
  JO: 'ar', LB: 'ar', IQ: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar',
};

async function detectLocale(): Promise<Locale> {
  try {
    const headersList = await headers();
    
    // Vercel provides geo headers automatically
    const country = headersList.get('x-vercel-ip-country') || '';
    if (country && countryToLocale[country]) {
      return countryToLocale[country];
    }

    // Fallback: check Accept-Language header
    const acceptLang = headersList.get('accept-language') || '';
    const primaryLang = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase();
    if (primaryLang && locales.includes(primaryLang as Locale)) {
      return primaryLang as Locale;
    }
  } catch {
    // Ignore errors during locale detection
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await detectLocale();
  
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
