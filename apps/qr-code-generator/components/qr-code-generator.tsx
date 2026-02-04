/**
 * QR Code Generator - Refactored Main Component
 * 
 * This is a simplified, clean version using the new architecture.
 * Compare with the original 500+ line monolithic component!
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QrCode, Link, MessageSquare, User, Download, Copy, Check, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

// Import from new packages
import { normalizeUrl, generateVCard } from '@repo/qr-core';
import type { QRContactInfo, QRContentType } from '@repo/qr-types';

// Import from new structure
import { useQRGenerator, useClipboard } from '@/hooks/use-qr-generator';
import { detectBrowserLocale, useTranslation } from '@/lib/i18n/translations';
import { URLForm } from '@/components/forms/url-form';
import { TextForm } from '@/components/forms/text-form';
import { ContactForm } from '@/components/forms/contact-form';

// Constants
const DEBOUNCE_DELAY = 300;

const QRCodeGenerator: React.FC = () => {
  // State - Much cleaner than before!
  const [locale] = useState(detectBrowserLocale());
  const [activeTab, setActiveTab] = useState<QRContentType>('url');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qr-dark-mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Form state
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState<QRContactInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: '',
  });

  // Hooks - Clean separation of concerns!
  const { generate, result, isGenerating, error, reset } = useQRGenerator();
  const { copy, copied } = useClipboard();
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const t = useTranslation(locale);

  // Get current content based on active tab
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

  // Generate QR code (debounced)
  useEffect(() => {
    const content = getCurrentContent();

    if (!content) {
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
  }, [activeTab, urlInput, textInput, contactInfo, generate, getCurrentContent, reset]);

  // Update DOM with QR code result
  useEffect(() => {
    if (!qrContainerRef.current || !result?.success) return;

    qrContainerRef.current.innerHTML = '';

    if (result.dataUrl) {
      if (result.strategy === 'qrious') {
        // Canvas from QRious
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
      } else {
        // Image from API
        const img = document.createElement('img');
        img.src = result.dataUrl;
        img.alt = 'Generated QR Code';
        img.className = 'w-full h-auto rounded-xl bg-white p-4';
        img.crossOrigin = 'anonymous';
        qrContainerRef.current.appendChild(img);
      }
    }
  }, [result]);

  // Dark mode persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('qr-dark-mode', darkMode.toString());
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, [darkMode]);

  // Handlers
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
    });
    reset();
  }, [reset]);

  return (
    <div className="font-sans antialiased transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">
              {t.appTitle}
            </h1>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="h-10 w-10 rounded-full"
            aria-label={t.toggleDarkMode}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl px-4 py-12 lg:py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-5xl font-bold tracking-tight lg:text-6xl">
            {t.appDescription}
          </h2>
          <p className="text-lg text-muted-foreground lg:text-xl">
            {t.footerText}
          </p>
        </div>

        <Card className="overflow-hidden border-2 shadow-2xl">
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as QRContentType)}
              className="w-full"
            >
              {/* Tab Headers */}
              <div className="border-b bg-muted/30 p-2">
                <TabsList className="grid w-full grid-cols-3 bg-muted p-1.5">
                  <TabsTrigger value="url">
                    <Link className="mr-2 h-4 w-4" />
                    {t.urlTab}
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t.textTab}
                  </TabsTrigger>
                  <TabsTrigger value="contact">
                    <User className="mr-2 h-4 w-4" />
                    {t.contactTab}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Content Grid */}
              <div className="grid min-h-[550px] lg:grid-cols-12">
                {/* Forms Side */}
                <div className="lg:col-span-7 p-8 lg:p-10">
                  <div className="flex h-full flex-col">
                    <div className="flex-1 space-y-6">
                      <TabsContent value="url" className="mt-0">
                        <URLForm
                          value={urlInput}
                          onChange={setUrlInput}
                          t={t}
                          autoFocus
                        />
                      </TabsContent>

                      <TabsContent value="text" className="mt-0">
                        <TextForm
                          value={textInput}
                          onChange={setTextInput}
                          t={t}
                          autoFocus
                        />
                      </TabsContent>

                      <TabsContent value="contact" className="mt-0">
                        <ContactForm
                          value={contactInfo}
                          onChange={setContactInfo}
                          t={t}
                          autoFocus
                        />
                      </TabsContent>
                    </div>

                    {/* Reset Button */}
                    <div className="mt-8 flex justify-end border-t pt-6">
                      <Button
                        variant="ghost"
                        onClick={resetForm}
                        className="font-semibold"
                      >
                        {t.clearAllFields}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* QR Display Side */}
                <div className="flex flex-col items-center justify-center bg-muted/30 p-8 lg:col-span-5 lg:p-10">
                  <div className="w-full max-w-[340px] space-y-8">
                    {/* QR Card */}
                    <Card className="aspect-square overflow-hidden border-2 shadow-2xl">
                      <CardContent className="flex h-full items-center justify-center p-8">
                        {result?.success ? (
                          <div
                            ref={qrContainerRef}
                            className="flex h-full w-full items-center justify-center"
                            aria-label="Generated QR Code"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-muted-foreground">
                            <QrCode className="mb-4 h-20 w-20 opacity-40" />
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
                              {isGenerating ? t.loading : t.fillFormPrompt}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    {result?.success && (
                      <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Button
                          onClick={handleDownload}
                          className="h-12 flex-1 gap-2 rounded-full font-semibold shadow-lg"
                          size="lg"
                          disabled={isGenerating}
                        >
                          <Download className="h-4 w-4" />
                          {t.download}
                        </Button>

                        <Button
                          onClick={handleCopy}
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          aria-label={copied ? t.copied : t.copyData}
                          disabled={isGenerating}
                        >
                          {copied ? (
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    )}

                    {error && (
                      <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
                        {error}
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

export default QRCodeGenerator;