/**
 * Internationalization system
 */

import type { Locale, Translation } from '@repo/qr-types';

export const translations: Record<Locale, Translation> = {
  'en-US': {
    appTitle: 'QR Generator',
    appDescription: 'Create, customize, and share.',
    urlTab: 'URL',
    textTab: 'Text',
    contactTab: 'Contact',
    websiteUrl: 'Website URL',
    urlPlaceholder: 'https://apple.com',
    urlHelp: 'https:// will be added automatically if missing.',
    textContent: 'Message',
    textPlaceholder: 'Type your message...',
    firstName: 'First Name',
    firstNamePlaceholder: 'Jane',
    lastName: 'Last Name',
    lastNamePlaceholder: 'Appleseed',
    phoneNumber: 'Phone Number',
    phonePlaceholder: '+1 (555) 000-0000',
    emailAddress: 'Email Address',
    emailPlaceholder: 'jane@icloud.com',
    organization: 'Organization',
    organizationPlaceholder: 'Apple Inc.',
    clearAllFields: 'Reset Form',
    fillFormPrompt: 'Enter details to generate',
    download: 'Save Image',
    copyData: 'Copy Data',
    copied: 'Copied!',
    footerText: 'Designed for simplicity. No data stored.',
    toggleDarkMode: 'Toggle dark mode',
    error: 'Error',
    success: 'Success',
    loading: 'Loading...',
  },
  'es-ES': {
    appTitle: 'Generador QR',
    appDescription: 'Crea, personaliza y comparte.',
    urlTab: 'URL',
    textTab: 'Texto',
    contactTab: 'Contacto',
    websiteUrl: 'URL del Sitio Web',
    urlPlaceholder: 'https://apple.com',
    urlHelp: 'Se añadirá https:// automáticamente.',
    textContent: 'Mensaje',
    textPlaceholder: 'Escribe tu mensaje...',
    firstName: 'Nombre',
    firstNamePlaceholder: 'Juan',
    lastName: 'Apellido',
    lastNamePlaceholder: 'Pérez',
    phoneNumber: 'Teléfono',
    phonePlaceholder: '+1 (555) 000-0000',
    emailAddress: 'Correo Electrónico',
    emailPlaceholder: 'juan@icloud.com',
    organization: 'Organización',
    organizationPlaceholder: 'Empresa S.A.',
    clearAllFields: 'Restablecer',
    fillFormPrompt: 'Ingresa datos para generar',
    download: 'Guardar Imagen',
    copyData: 'Copiar Datos',
    copied: '¡Copiado!',
    footerText: 'Diseñado para la simplicidad. Sin rastreo.',
    toggleDarkMode: 'Alternar modo oscuro',
    error: 'Error',
    success: 'Éxito',
    loading: 'Cargando...',
  },
  'ar-EG': {
    appTitle: 'مولد رمز QR',
    appDescription: 'إنشاء وتخصيص ومشاركة',
    urlTab: 'رابط',
    textTab: 'نص',
    contactTab: 'جهة اتصال',
    websiteUrl: 'عنوان الموقع',
    urlPlaceholder: 'https://apple.com',
    urlHelp: 'سيتم إضافة https:// تلقائياً',
    textContent: 'الرسالة',
    textPlaceholder: 'اكتب رسالتك...',
    firstName: 'الاسم الأول',
    firstNamePlaceholder: 'أحمد',
    lastName: 'اسم العائلة',
    lastNamePlaceholder: 'محمد',
    phoneNumber: 'رقم الهاتف',
    phonePlaceholder: '0100 000 0000',
    emailAddress: 'البريد الإلكتروني',
    emailPlaceholder: 'ahmed@icloud.com',
    organization: 'المنظمة',
    organizationPlaceholder: 'شركة المستقبل',
    clearAllFields: 'إعادة تعيين',
    fillFormPrompt: 'أدخل التفاصيل للإنشاء',
    download: 'حفظ الصورة',
    copyData: 'نسخ البيانات',
    copied: 'تم النسخ!',
    footerText: 'مصمم للبساطة. لا يتم تخزين البيانات',
    toggleDarkMode: 'تبديل الوضع الداكن',
    error: 'خطأ',
    success: 'نجح',
    loading: 'جار التحميل...',
  },
};

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en-US';

  const browserLang = navigator.language;
  if (browserLang in translations) return browserLang as Locale;

  const shortLang = browserLang.split('-')[0];
  const match = Object.keys(translations).find(key =>
    key.startsWith(`${shortLang}-`)
  );

  return (match as Locale) || 'en-US';
}

export function useTranslation(locale: Locale): Translation {
  return translations[locale] || translations['en-US'];
}
