/**
 * URL Form Component
 * 
 * Simple form for URL input with label and helper text.
 */

'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Translation } from '@repo/qr-types';

interface URLFormProps {
  value: string;
  onChange: (value: string) => void;
  t: Translation;
  autoFocus?: boolean;
}

export function URLForm({ value, onChange, t, autoFocus }: URLFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url-input" className="text-base font-semibold">
          {t.websiteUrl}
        </Label>
        <Input
          id="url-input"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.urlPlaceholder}
          autoFocus={autoFocus}
          className="h-12 text-base"
        />
        <p className="text-sm text-muted-foreground">
          {t.urlHelp}
        </p>
      </div>
    </div>
  );
}
