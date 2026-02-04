/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QrCode, Link, MessageSquare, User, Download, Copy, Check, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

type TabType = 'url' | 'text' | 'contact';

interface ContactInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  url: string;
}

interface Translation {
  [key: string]: string;
}

interface Translations {
  [locale: string]: Translation;
}

const DEBOUNCE_DELAY = 300;
const COPIED_TIMEOUT = 2000;
const QR_SIZE = 400;

const TRANSLATIONS: Translations = {
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
  },
} as const;


const detectBrowserLocale = (): string => {
  if (typeof navigator === 'undefined') return 'en-US';

  const browserLang = navigator.language;
  if (TRANSLATIONS[browserLang]) return browserLang;

  const shortLang = browserLang.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find((key) =>
    key.startsWith(`${shortLang}-`)
  );

  return match || 'en-US';
};

const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
};


const generateVCard = (contact: ContactInfo): string => {
  const { firstName, lastName, phone, email, organization, url } = contact;

  if (!firstName && !lastName && !phone && !email && !organization && !url) {
    return '';
  }

  const fullName = `${firstName} ${lastName}`.trim();

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${fullName}`,
    `N:${lastName};${firstName};;;`,
    organization && `ORG:${organization}`,
    phone && `TEL:${phone}`,
    email && `EMAIL:${email}`,
    url && `URL:${url}`,
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n');
};

const QRCodeGenerator: React.FC = () => {
  const [locale] = useState<string>(detectBrowserLocale());
  const [activeTab, setActiveTab] = useState<TabType>('url');
  const [qrData, setQrData] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qr-dark-mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [urlInput, setUrlInput] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: '',
  });

  const qrContainerRef = useRef<HTMLDivElement>(null);
  const qriousLoadedRef = useRef<boolean>(false);

  const t = useCallback(
    (key: string): string => {
      return TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en-US'][key] || key;
    },
    [locale]
  );

  const generateWithQRious = useCallback(async (text: string): Promise<boolean> => {
    if (!qrContainerRef.current || !text.trim()) return false;

    try {
      if (!window.QRious && !qriousLoadedRef.current) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
          script.onload = () => {
            qriousLoadedRef.current = true;
            resolve();
          };
          script.onerror = () => reject(new Error('Failed to load QRious'));
          document.head.appendChild(script);
        });
      }
      qrContainerRef.current.innerHTML = '';

      const canvas = document.createElement('canvas');
      qrContainerRef.current.appendChild(canvas);

      new window.QRious({
        element: canvas,
        value: text,
        size: QR_SIZE,
        background: 'white',
        foreground: 'black',
        level: 'M',
      });

      canvas.className = 'w-full h-auto rounded-xl';
      canvas.style.maxWidth = `${QR_SIZE}px`;

      return true;
    } catch (error) {
      console.warn('[QR Generator] QRious failed:', error);
      return false;
    }
  }, []);

  const generateWithGoogleCharts = useCallback((text: string): boolean => {
    if (!qrContainerRef.current || !text.trim()) return false;

    try {
      qrContainerRef.current.innerHTML = '';

      const img = document.createElement('img');
      const encodedData = encodeURIComponent(text);
      img.src = `https://chart.googleapis.com/chart?chs=${QR_SIZE}x${QR_SIZE}&cht=qr&chl=${encodedData}&choe=UTF-8`;
      img.alt = 'Generated QR Code';
      img.className = 'w-full h-auto rounded-xl bg-white p-4';
      img.style.maxWidth = `${QR_SIZE}px`;
      img.crossOrigin = 'anonymous';

      img.onerror = () => {
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&data=${encodedData}&format=png&margin=10`;
      };

      qrContainerRef.current.appendChild(img);
      return true;
    } catch (error) {
      console.error('[QR Generator] All strategies failed:', error);
      return false;
    }
  }, []);

  const generateQRCode = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) {
        if (qrContainerRef.current) {
          qrContainerRef.current.innerHTML = '';
        }
        return;
      }
      const qriousSuccess = await generateWithQRious(text);
      if (!qriousSuccess) {
        generateWithGoogleCharts(text);
      }
    },
    [generateWithQRious, generateWithGoogleCharts]
  );

  useEffect(() => {
    let data = '';

    switch (activeTab) {
      case 'url':
        data = normalizeUrl(urlInput);
        break;
      case 'text':
        data = textInput.trim();
        break;
      case 'contact':
        data = generateVCard(contactInfo);
        break;
    }

    setQrData(data);

    const debounceTimer = setTimeout(() => {
      generateQRCode(data);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(debounceTimer);
  }, [activeTab, urlInput, textInput, contactInfo, generateQRCode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('qr-dark-mode', darkMode.toString());
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, [darkMode]);

  const handleDownload = useCallback(async (): Promise<void> => {
    if (!qrData || !qrContainerRef.current) return;

    const canvas = qrContainerRef.current.querySelector('canvas');
    const img = qrContainerRef.current.querySelector('img');

    try {
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `QR-${activeTab}-${Date.now()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }
        }, 'image/png', 1.0);
      } else if (img) {
        const response = await fetch(img.src);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `QR-${activeTab}-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('[QR Generator] Download failed:', error);
      alert('Download failed. Please try right-clicking the QR code and selecting "Save image as..."');
    }
  }, [qrData, activeTab]);

  const handleCopy = useCallback(async (): Promise<void> => {
    if (!qrData) return;

    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_TIMEOUT);
    } catch (error) {
      console.error('[QR Generator] Copy failed:', error);
    }
  }, [qrData]);

  const resetForm = useCallback((): void => {
    setUrlInput('');
    setTextInput('');
    setContactInfo({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      organization: '',
      url: '',
    });
    setQrData('');
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }
  }, []);

  const toggleDarkMode = useCallback((): void => {
    setDarkMode((prev) => !prev);
  }, []);

  const updateContactField = useCallback(
    (field: keyof ContactInfo) => (value: string) => {
      setContactInfo((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  return (
    <div className="font-sans antialiased transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">
              {t('appTitle')}
            </h1>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="h-10 w-10 rounded-full"
            aria-label={t('toggleDarkMode')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </header>
      <main className="container max-w-5xl px-4 py-12 lg:py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-5xl font-bold tracking-tight lg:text-6xl">
            {t('appDescription')}
          </h2>
          <p className="text-lg text-muted-foreground lg:text-xl">
            {t('footerText')}
          </p>
        </div>

        <Card className="overflow-hidden border-2 shadow-2xl">
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as TabType)}
              className="w-full"
            >
              <div className="border-b bg-muted/30 p-2">
                <TabsList className="grid w-full grid-cols-3 bg-muted p-1.5">
                  <TabsTrigger
                    value="url"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Link className="mr-2 h-4 w-4" />
                    {t('urlTab')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="text"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t('textTab')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t('contactTab')}
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="grid min-h-[550px] lg:grid-cols-12">
                <div className="lg:col-span-7 p-8 lg:p-10">
                  <div className="flex h-full flex-col">
                    <div className="flex-1 space-y-6">
                      <TabsContent value="url" className="mt-0 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="url-input" className="text-base font-semibold">
                            {t('websiteUrl')}
                          </Label>
                          <Input
                            id="url-input"
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder={t('urlPlaceholder')}
                            className="h-11 text-base"
                            autoFocus
                          />
                          <p className="text-xs text-muted-foreground">
                            {t('urlHelp')}
                          </p>
                        </div>
                      </TabsContent>
                      <TabsContent value="text" className="mt-0 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="text-input" className="text-base font-semibold">
                            {t('textContent')}
                          </Label>
                          <Textarea
                            id="text-input"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder={t('textPlaceholder')}
                            rows={7}
                            className="resize-none text-base"
                            autoFocus
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="contact" className="mt-0 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="first-name" className="text-sm font-medium">
                              {t('firstName')}
                            </Label>
                            <Input
                              id="first-name"
                              value={contactInfo.firstName}
                              onChange={(e) =>
                                updateContactField('firstName')(e.target.value)
                              }
                              placeholder={t('firstNamePlaceholder')}
                              className="h-11"
                              autoFocus
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last-name" className="text-sm font-medium">
                              {t('lastName')}
                            </Label>
                            <Input
                              id="last-name"
                              value={contactInfo.lastName}
                              onChange={(e) =>
                                updateContactField('lastName')(e.target.value)
                              }
                              placeholder={t('lastNamePlaceholder')}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium">
                              {t('phoneNumber')}
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={contactInfo.phone}
                              onChange={(e) =>
                                updateContactField('phone')(e.target.value)
                              }
                              placeholder={t('phonePlaceholder')}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                              {t('emailAddress')}
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={contactInfo.email}
                              onChange={(e) =>
                                updateContactField('email')(e.target.value)
                              }
                              placeholder={t('emailPlaceholder')}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="organization" className="text-sm font-medium">
                              {t('organization')}
                            </Label>
                            <Input
                              id="organization"
                              value={contactInfo.organization}
                              onChange={(e) =>
                                updateContactField('organization')(e.target.value)
                              }
                              placeholder={t('organizationPlaceholder')}
                              className="h-11"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                    <div className="mt-8 flex justify-end border-t pt-6">
                      <Button
                        variant="ghost"
                        onClick={resetForm}
                        className="font-semibold"
                      >
                        {t('clearAllFields')}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-muted/30 p-8 lg:col-span-5 lg:p-10">
                  <div className="w-full max-w-[340px] space-y-8">
                    <Card className="aspect-square overflow-hidden border-2 shadow-2xl">
                      <CardContent className="flex h-full items-center justify-center p-8">
                        {qrData ? (
                          <div
                            ref={qrContainerRef}
                            className="flex h-full w-full items-center justify-center"
                            aria-label="Generated QR Code"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-muted-foreground">
                            <QrCode className="mb-4 h-20 w-20 opacity-40" />
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
                              {t('fillFormPrompt')}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {qrData && (
                      <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Button
                          onClick={handleDownload}
                          className="h-12 flex-1 gap-2 rounded-full font-semibold shadow-lg"
                          size="lg"
                        >
                          <Download className="h-4 w-4" />
                          {t('download')}
                        </Button>

                        <Button
                          onClick={handleCopy}
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          aria-label={copied ? t('copied') : t('copyData')}
                        >
                          {copied ? (
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

declare global {
  interface Window {
    QRious: any;
  }
}

export default QRCodeGenerator;