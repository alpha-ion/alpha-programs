import { getQRGenerator } from '@repo/qr-core';
import type { QRGenerationOptions, QRGenerationResult } from '@repo/qr-types';
import { useCallback, useState, useRef } from 'react';

export function useQRGenerator() {
  const [result, setResult] = useState<QRGenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generationIdRef = useRef(0);

  const generate = useCallback(async (options: QRGenerationOptions) => {
    const currentId = ++generationIdRef.current;
    
    setIsGenerating(true);
    setError(null);

    try {
      const generator = getQRGenerator();
      const result = await generator.generate(options);
      
      // If a new request started or reset was called, ignore this result
      if (currentId !== generationIdRef.current) return;

      if (result.success) {
        setResult(result);
      } else {
        setError(result.error || 'Generation failed');
      }
    } catch (err) {
      if (currentId !== generationIdRef.current) return;
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      if (currentId === generationIdRef.current) {
        setIsGenerating(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    generationIdRef.current++; // Invalidate any pending requests
    setResult(null);
    setError(null);
    setIsGenerating(false);
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
