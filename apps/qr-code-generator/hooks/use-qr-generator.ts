/**
 * Custom hooks for QR generation
 */

import { useState, useCallback, useEffect } from 'react';
import { getQRGenerator } from '@repo/qr-core';
import type { QRGenerationOptions, QRGenerationResult } from '@repo/qr-types';

const DEBOUNCE_DELAY = 300;

export function useQRGenerator() {
  const [result, setResult] = useState<QRGenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (options: QRGenerationOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      const generator = getQRGenerator();
      const result = await generator.generate(options);
      
      if (result.success) {
        setResult(result);
      } else {
        setError(result.error || 'Generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { generate, result, isGenerating, error, reset };
}

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { copy, copied };
}
