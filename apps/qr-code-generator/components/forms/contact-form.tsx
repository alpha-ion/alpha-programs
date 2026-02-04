/**
 * Contact Form Component
 * 
 * Form for vCard QR codes with contact information.
 */

'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Translation, QRContactInfo } from '@repo/qr-types';

interface ContactFormProps {
  value: QRContactInfo;
  onChange: (value: QRContactInfo) => void;
  t: Translation;
  autoFocus?: boolean;
}

export function ContactForm({ value, onChange, t, autoFocus }: ContactFormProps) {
  const updateField = (field: keyof QRContactInfo, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="space-y-6">
      {/* Name Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-semibold">
            {t.firstName}
          </Label>
          <Input
            id="firstName"
            value={value.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            placeholder={t.firstNamePlaceholder}
            autoFocus={autoFocus}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-semibold">
            {t.lastName}
          </Label>
          <Input
            id="lastName"
            value={value.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            placeholder={t.lastNamePlaceholder}
            className="h-11"
          />
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-semibold">
          {t.phoneNumber}
        </Label>
        <Input
          id="phone"
          type="tel"
          value={value.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder={t.phonePlaceholder}
          className="h-11"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold">
          {t.emailAddress}
        </Label>
        <Input
          id="email"
          type="email"
          value={value.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder={t.emailPlaceholder}
          className="h-11"
        />
      </div>

      {/* Organization */}
      <div className="space-y-2">
        <Label htmlFor="organization" className="text-sm font-semibold">
          {t.organization}
        </Label>
        <Input
          id="organization"
          value={value.organization}
          onChange={(e) => updateField('organization', e.target.value)}
          placeholder={t.organizationPlaceholder}
          className="h-11"
        />
      </div>
    </div>
  );
}
