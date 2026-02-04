/**
 * Text Form Component
 * 
 * Textarea form for plain text QR codes.
 */

'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Translation } from '@repo/qr-types';

interface TextFormProps {
  value: string;
  onChange: (value: string) => void;
  t: Translation;
  autoFocus?: boolean;
}

export function TextForm({ value, onChange, t, autoFocus }: TextFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-input" className="text-base font-semibold">
          {t.textContent}
        </Label>
        <Textarea
          id="text-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.textPlaceholder}
          autoFocus={autoFocus}
          className="min-h-[200px] text-base resize-none"
          rows={8}
        />
        <p className="text-xs text-muted-foreground text-right">
          {value.length} / 4000
        </p>
      </div>
    </div>
  );
}
