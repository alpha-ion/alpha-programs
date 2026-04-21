'use client';

import { ErrorBoundary } from '@/components/error-boundary';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContactValidation, useTextValidation, useUrlValidation } from '@/hooks/use-form-validation';
import { useClipboard, useQRGenerator } from '@/hooks/use-qr-generator';
import { generateVCard, normalizeUrl } from '@/lib/v-card';
import type { QRContactInfo, QRContentType } from '@/types';
import { Check, Copy, Download, Link, MessageSquare, Palette, QrCode, RotateCcw, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ContactForm } from './contact-form';
import { Container } from './container';
import { LoadingIcon } from './icons/loading-icon';
import { TextForm } from './text-form';
import { Button } from './ui/button';
import { URLForm } from './url-form';

const DEBOUNCE_DELAY = 300;

// ─── Preset Colors ─────────────────────────────────────────────────────────
const PRESET_COLORS = [
  { label: 'Black',   value: '#000000' },
  { label: 'Slate',   value: '#1e293b' },
  { label: 'Indigo',  value: '#3730a3' },
  { label: 'Blue',    value: '#1d4ed8' },
  { label: 'Teal',    value: '#0f766e' },
  { label: 'Green',   value: '#15803d' },
  { label: 'Rose',    value: '#be123c' },
  { label: 'Orange',  value: '#c2410c' },
  { label: 'Purple',  value: '#7e22ce' },
  { label: 'Pink',    value: '#be185d' },
];

// ─── Color Picker ──────────────────────────────────────────────────────────
const ColorPicker = memo(({ color, onChange }: { color: string; onChange: (c: string) => void }) => {
  const isCustom = !PRESET_COLORS.some(p => p.value === color);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <Palette className="h-3.5 w-3.5" />
          <span>QR Color</span>
        </div>
        {color !== '#000000' && (
          <button
            onClick={() => onChange('#000000')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Reset to black"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* Swatches */}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((preset) => {
          const active = color === preset.value;
          return (
            <button
              key={preset.value}
              onClick={() => onChange(preset.value)}
              title={preset.label}
              className="relative h-7 w-7 rounded-full transition-all duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              style={{
                backgroundColor: preset.value,
                boxShadow: active
                  ? `0 0 0 2px var(--background, #fff), 0 0 0 4px ${preset.value}`
                  : '0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              {active && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-white drop-shadow" />
                </span>
              )}
            </button>
          );
        })}

        {/* Custom color wheel swatch */}
        <label
          title="Custom color"
          className="relative h-7 w-7 cursor-pointer rounded-full overflow-hidden transition-all duration-150 hover:scale-110"
          style={{
            background: isCustom ? color : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
            boxShadow: isCustom
              ? `0 0 0 2px var(--background, #fff), 0 0 0 4px ${color}`
              : '0 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
          {isCustom && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-white drop-shadow" />
            </span>
          )}
        </label>
      </div>

      {/* Hex badge */}
      <div className="inline-flex items-center gap-2 rounded-md bg-muted/60 px-2.5 py-1">
        <span
          className="h-3.5 w-3.5 rounded-sm border border-border/50 shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="font-mono text-[11px] text-muted-foreground tracking-wider uppercase">
          {color}
        </span>
      </div>
    </div>
  );
});
ColorPicker.displayName = 'ColorPicker';

// ─── QR Display ────────────────────────────────────────────────────────────
const QRDisplay = memo(({
  qrContainerRef,
  result,
  isGenerating,
}: {
  qrContainerRef: React.RefObject<HTMLDivElement | null>;
  result: ReturnType<typeof useQRGenerator>['result'];
  isGenerating: boolean;
}) => {
  const t = useTranslations('main-page');
  return (
    <Card className="aspect-square overflow-hidden border bg-background shadow-xl">
      <CardContent className="flex h-full items-center justify-center p-6">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <LoadingIcon size={16} />
            <span className="text-xs font-medium uppercase tracking-wide">{t('loading')}</span>
          </div>
        ) : result?.success ? (
          <div
            ref={qrContainerRef}
            className="flex h-full w-full items-center justify-center"
            aria-label={t('generatedQrCode')}
            role="img"
          />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <QrCode className="mb-3 h-16 w-16 opacity-30" />
            <span className="text-xs font-medium uppercase tracking-wide opacity-60">{t('fillFormPrompt')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
QRDisplay.displayName = 'QRDisplay';

// ─── Action Buttons ────────────────────────────────────────────────────────
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
  const t = useTranslations('main-page');
  return (
    <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button
        onClick={onDownload}
        className="flex-1 gap-2 font-medium"
        size="lg"
        disabled={isDisabled}
        aria-label={t('download')}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {t('download')}
      </Button>
      <Button
        onClick={onCopy}
        variant="outline"
        size="lg"
        className="px-3"
        aria-label={copied ? t('copied') : t('copyData')}
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

// ─── Main Component ─────────────────────────────────────────────────────────
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
    address: { street: '', city: '', state: '', postalCode: '', country: '' },
  });
  const [qrColor, setQrColor] = useState('#000000');

  const { generate, result, isGenerating, error, reset } = useQRGenerator();
  const { copy, copied } = useClipboard();
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('main-page');

  const urlValidation = useUrlValidation(urlInput);
  const textValidation = useTextValidation(textInput);
  const contactValidation = useContactValidation(contactInfo);

  const isCurrentFormValid = useMemo(() => {
    switch (activeTab) {
      case 'url':     return urlInput.trim() !== '' && urlValidation.isValid;
      case 'text':    return textInput.trim() !== '' && textValidation.isValid;
      case 'contact': return contactValidation.isValid;
      default:        return false;
    }
  }, [activeTab, urlInput, textInput, urlValidation.isValid, textValidation.isValid, contactValidation.isValid]);

  const getCurrentContent = useCallback((): string => {
    switch (activeTab) {
      case 'url':     return normalizeUrl(urlInput);
      case 'text':    return textInput.trim();
      case 'contact': return generateVCard(contactInfo);
      default:        return '';
    }
  }, [activeTab, urlInput, textInput, contactInfo]);

  // Regenerate QR whenever content OR color changes
  useEffect(() => {
    const content = getCurrentContent();
    if (!content || !isCurrentFormValid) { reset(); return; }

    const timer = setTimeout(() => {
      generate({
        content,
        contentType: activeTab,
        size: 400,
        errorCorrectionLevel: 'M',
        branding: { colors: { foreground: qrColor, background: '#ffffff' } },
      });
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [activeTab, urlInput, textInput, contactInfo, qrColor, generate, getCurrentContent, reset, isCurrentFormValid]);

  // Render QR result into DOM
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
    if (content) await copy(content);
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
      firstName: '', lastName: '', phone: '', email: '',
      organization: '', url: '',
      address: { street: '', city: '', state: '', postalCode: '', country: '' },
    });
    setQrColor('#000000');
    reset();
    if (qrContainerRef.current) qrContainerRef.current.innerHTML = '';
  }, [reset]);

  return (
    <ErrorBoundary>
      <div className="font-sans antialiased transition-colors duration-300">
        <main>
          <Container className="py-12">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-balance">
                {t('appDescription')}
              </h2>
              <p className="text-base text-muted-foreground sm:text-lg">{t('footerText')}</p>
            </div>

            <Card className="overflow-hidden border bg-background shadow-sm rounded-2xl">
              <CardContent className="lg:px-6 md:px-4 px-2">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as QRContentType)}
                  className="w-full px-0"
                >
                  <TabsList className="grid w-full grid-cols-3 h-auto">
                    <TabsTrigger value="url" className="flex items-center justify-center gap-2 rounded-none">
                      <Link className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">{t('urlTab')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="text" className="flex items-center justify-center gap-2 rounded-none">
                      <MessageSquare className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">{t('textTab')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="flex items-center justify-center gap-2 rounded-none">
                      <User className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">{t('contactTab')}</span>
                    </TabsTrigger>
                  </TabsList>
                  <div className="grid gap-6 lg:grid-cols-12 lg:gap-0">
                    <div className="lg:col-span-7 px-6 py-6">
                      <div className="flex h-full flex-col">
                        <div className="flex-1 space-y-6">
                          <TabsContent value="url"     className="mt-0"><URLForm value={urlInput} onChange={setUrlInput} autoFocus /></TabsContent>
                          <TabsContent value="text"    className="mt-0"><TextForm value={textInput} onChange={setTextInput} autoFocus /></TabsContent>
                          <TabsContent value="contact" className="mt-0"><ContactForm value={contactInfo} onChange={setContactInfo} autoFocus /></TabsContent>
                        </div>
                        <div className="mt-8 flex justify-end border-t pt-6">
                          <Button variant="ghost" onClick={resetForm} className="font-medium" aria-label={t('clearAllFields')}>
                            {t('clearAllFields')}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 sm:p-8 lg:col-span-5 lg:border-l">
                      <div className="w-full max-w-xs space-y-5">
                        <QRDisplay
                          qrContainerRef={qrContainerRef}
                          result={result}
                          isGenerating={isGenerating}
                        />

                        {/* Color Picker Panel */}
                        <div className="rounded-xl border bg-muted/30 p-4">
                          <ColorPicker color={qrColor} onChange={setQrColor} />
                        </div>

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