'use client';

import { ErrorBoundary } from '@/components/error-boundary';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContactValidation, useTextValidation, useUrlValidation } from '@/hooks/use-form-validation';
import { useClipboard, useQRGenerator } from '@/hooks/use-qr-generator';
import { generateVCard, normalizeUrl } from '@/lib/v-card';
import type { QRContactInfo, QRContentType } from '@/types';
import { Check, Copy, Download, Link, MessageSquare, QrCode, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ContactForm } from './contact-form';
import { Container } from './container';
import { LoadingIcon } from './icons/loading-icon';
import { TextForm } from './text-form';
import { Button } from './ui/button';
import { URLForm } from './url-form';

const DEBOUNCE_DELAY = 300;

const QRDisplay = memo(({
  qrContainerRef,
  result,
  isGenerating,
}: {
  qrContainerRef: React.RefObject<HTMLDivElement | null>;
  result: ReturnType<typeof useQRGenerator>['result'];
  isGenerating: boolean;
}) => {
  const t = useTranslations("main-page");
  return (
    <Card className="aspect-square overflow-hidden border bg-background shadow-xl">
      <CardContent className="flex h-full items-center justify-center p-6">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <LoadingIcon size={16} />
            <span className="text-xs font-medium uppercase tracking-wide">
              {t("loading")}
            </span>
          </div>
        ) : result?.success ? (
          <div
            ref={qrContainerRef}
            className="flex h-full w-full items-center justify-center"
            aria-label={t("generatedQrCode")}
            role="img"
          />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <QrCode className="mb-3 h-16 w-16 opacity-30" />
            <span className="text-xs font-medium uppercase tracking-wide opacity-60">
              {t("fillFormPrompt")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

QRDisplay.displayName = 'QRDisplay';

const ActionButtons = memo(({
  onDownload,
  onCopy,
  copied,
  isDisabled,
}: {
  onDownload: () => void;
  onCopy: () => void;
  copied: boolean;
  isDisabled: boolean;
}) => {
  const t = useTranslations("main-page");
  return (
    <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button
        onClick={onDownload}
        className="flex-1 gap-2 font-medium"
        size="lg"
        disabled={isDisabled}
        aria-label={t("download")}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {t("download")}
      </Button>

      <Button
        onClick={onCopy}
        variant="outline"
        size="lg"
        className="px-3"
        aria-label={copied ? t("copied") : t("copyData")}
        disabled={isDisabled}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

const QRCodeGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<QRContentType>('url');

  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState<QRContactInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  });

  const { generate, result, isGenerating, error, reset } = useQRGenerator();
  const { copy, copied } = useClipboard();
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("main-page");
  const urlValidation = useUrlValidation(urlInput);
  const textValidation = useTextValidation(textInput);
  const contactValidation = useContactValidation(contactInfo);
  const isCurrentFormValid = useMemo(() => {
    switch (activeTab) {
      case 'url':
        return urlInput.trim() !== '' && urlValidation.isValid;
      case 'text':
        return textInput.trim() !== '' && textValidation.isValid;
      case 'contact':
        return contactValidation.isValid;
      default:
        return false;
    }
  }, [activeTab, urlInput, textInput, urlValidation.isValid, textValidation.isValid, contactValidation.isValid]);

  const getCurrentContent = useCallback((): string => {
    switch (activeTab) {
      case 'url':
        return normalizeUrl(urlInput);
      case 'text':
        return textInput.trim();
      case 'contact':
        return generateVCard(contactInfo);
      default:
        return '';
    }
  }, [activeTab, urlInput, textInput, contactInfo]);

  useEffect(() => {
    const content = getCurrentContent();

    if (!content || !isCurrentFormValid) {
      reset();
      return;
    }

    const timer = setTimeout(() => {
      generate({
        content,
        contentType: activeTab,
        size: 400,
        errorCorrectionLevel: 'M',
      });
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [activeTab, urlInput, textInput, contactInfo, generate, getCurrentContent, reset, isCurrentFormValid]);

  useEffect(() => {
    if (!qrContainerRef.current || !result?.success) return;

    qrContainerRef.current.innerHTML = '';

    if (result.dataUrl) {
      if (result.strategy === 'qrious') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          qrContainerRef.current?.appendChild(canvas);
        };

        img.src = result.dataUrl;
        canvas.className = 'w-full h-auto rounded-xl';
        canvas.setAttribute('aria-label', t('qrCanvas'));
      } else {
        const img = document.createElement('img');
        img.src = result.dataUrl;
        img.alt = t('qrImage');
        img.className = 'w-full h-auto rounded-xl bg-white p-4';
        img.crossOrigin = 'anonymous';
        qrContainerRef.current.appendChild(img);
      }
    }
  }, [result]);

  const handleDownload = useCallback(async () => {
    if (!result?.success || !qrContainerRef.current) return;

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
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, [result, activeTab]);

  const handleCopy = useCallback(async () => {
    const content = getCurrentContent();
    if (content) {
      await copy(content);
    }
  }, [getCurrentContent, copy]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && result?.success) {
        e.preventDefault();
        handleDownload();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && result?.success) {
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          e.preventDefault();
          handleCopy();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [result, handleDownload, handleCopy]);

  const resetForm = useCallback(() => {
    setUrlInput('');
    setTextInput('');
    setContactInfo({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      organization: '',
      url: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    });
    reset();
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }
  }, [reset]);

  return (
    <ErrorBoundary>
      <div className="font-sans antialiased transition-colors duration-300">
        <main>
          <Container className='py-12'>
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-balance">
                {t("appDescription")}
              </h2>
              <p className="text-base text-muted-foreground sm:text-lg">
                {t("footerText")}
              </p>
            </div>
            <Card className="overflow-hidden border bg-background shadow-sm rounded-2xl">
              <CardContent className='lg:px-6 md:px-4 px-2'>
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as QRContentType)}
                  className="w-full px-0"
                >
                  <div className="">
                    <TabsList className="grid w-full grid-cols-3 h-auto">
                      <TabsTrigger value="url" className="flex items-center justify-center gap-2 rounded-none">
                        <Link className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">{t("urlTab")}</span>
                      </TabsTrigger>
                      <TabsTrigger value="text" className="flex items-center justify-center gap-2 rounded-none">
                        <MessageSquare className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">{t("textTab")}</span>
                      </TabsTrigger>
                      <TabsTrigger value="contact" className="flex items-center justify-center gap-2 rounded-none">
                        <User className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">{t("contactTab")}</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-12 lg:gap-0">
                    <div className="lg:col-span-7 px-6 py-6">
                      <div className="flex h-full flex-col">
                        <div className="flex-1 space-y-6">
                          <TabsContent value="url" className="mt-0">
                            <URLForm
                              value={urlInput}
                              onChange={setUrlInput}
                              autoFocus
                            />
                          </TabsContent>
                          <TabsContent value="text" className="mt-0">
                            <TextForm
                              value={textInput}
                              onChange={setTextInput}
                              autoFocus
                            />
                          </TabsContent>
                          <TabsContent value="contact" className="mt-0">
                            <ContactForm
                              value={contactInfo}
                              onChange={setContactInfo}
                              autoFocus
                            />
                          </TabsContent>
                        </div>
                        <div className="mt-8 flex justify-end border-t pt-6">
                          <Button
                            variant="ghost"
                            onClick={resetForm}
                            className="font-medium"
                            aria-label={t("clearAllFields")}
                          >
                            {t("clearAllFields")}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 sm:p-8 lg:col-span-5 lg:border-l">
                      <div className="w-full max-w-xs space-y-6">
                        <QRDisplay
                          qrContainerRef={qrContainerRef}
                          result={result}
                          isGenerating={isGenerating}
                        />
                        {result?.success && (
                          <ActionButtons
                            onDownload={handleDownload}
                            onCopy={handleCopy}
                            copied={copied}
                            isDisabled={isGenerating}
                          />
                        )}
                        {error && (
                          <div
                            className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive"
                            role="alert"
                            aria-live="polite"
                          >
                            {error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </Container>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default QRCodeGenerator;