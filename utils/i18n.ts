
import fr from '@/locales/fr.json';

type TranslationKeys = typeof fr;

// Simple i18n utility - can be extended with libraries like i18next later
class I18n {
  private currentLocale: string = 'fr';
  private translations: { [key: string]: any } = {
    fr: fr,
  };

  setLocale(locale: string) {
    if (this.translations[locale]) {
      this.currentLocale = locale;
      console.log(`Locale changed to: ${locale}`);
    } else {
      console.warn(`Locale ${locale} not found, keeping ${this.currentLocale}`);
    }
  }

  getLocale(): string {
    return this.currentLocale;
  }

  t(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLocale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  }

  // Helper method to get all translations for a section
  getSection(section: string): any {
    const keys = section.split('.');
    let value: any = this.translations[this.currentLocale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation section not found: ${section}`);
        return {};
      }
    }

    return value;
  }
}

export const i18n = new I18n();

// Export a hook for React components
export const useTranslation = () => {
  return {
    t: (key: string) => i18n.t(key),
    locale: i18n.getLocale(),
    setLocale: (locale: string) => i18n.setLocale(locale),
  };
};
