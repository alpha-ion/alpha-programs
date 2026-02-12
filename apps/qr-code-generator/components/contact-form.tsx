'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { createContactSchema } from '@/lib/validation';
import type { QRContactInfo } from '@/types';
import { useTranslations } from 'next-intl';
import React, { useCallback, useMemo } from 'react';

interface ContactFormProps {
    value: QRContactInfo;
    onChange: (value: QRContactInfo) => void;
    autoFocus?: boolean;
}

interface FieldError {
    [key: string]: string | undefined;
}

export const ContactForm: React.FC<ContactFormProps> = ({
    value,
    onChange,
    autoFocus = false,
}) => {
    const t = useTranslations('contact-form');
    const tValidation = useTranslations('validation');

    // Validate entire form and get errors
    const errors = useMemo((): FieldError => {
        const contactSchema = createContactSchema(tValidation);
        const result = contactSchema.safeParse(value);
        if (result.success) return {};

        const fieldErrors: FieldError = {};
        result.error.issues.forEach((issue) => {
            const path = issue.path.join('.');
            fieldErrors[path] = issue.message;
        });
        return fieldErrors;
    }, [value]);

    const handleFieldChange = useCallback(
        (field: keyof QRContactInfo, fieldValue: string) => {
            onChange({
                ...value,
                [field]: fieldValue,
            });
        },
        [value, onChange]
    );

    const handleAddressChange = useCallback(
        (field: keyof NonNullable<QRContactInfo['address']>, fieldValue: string) => {
            onChange({
                ...value,
                address: {
                    ...value.address,
                    [field]: fieldValue,
                },
            });
        },
        [value, onChange]
    );

    return (
        <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                        {t('firstName')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="firstName"
                        type="text"
                        placeholder={t('firstNamePlaceholder')}
                        value={value.firstName}
                        onChange={(e) => handleFieldChange('firstName', e.target.value)}
                        autoFocus={autoFocus}
                        className={errors.firstName ? 'border-destructive' : ''}
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                    />
                    {errors.firstName && (
                        <p id="firstName-error" className="text-xs text-destructive">
                            {errors.firstName}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                        {t('lastName')}
                    </Label>
                    <Input
                        id="lastName"
                        type="text"
                        placeholder={t('lastNamePlaceholder')}
                        value={value.lastName || ''}
                        onChange={(e) => handleFieldChange('lastName', e.target.value)}
                        className={errors.lastName ? 'border-destructive' : ''}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                        {t('phone')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder={t('phonePlaceholder')}
                        value={value.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className={errors.phone ? 'border-destructive' : ''}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                    />
                    {errors.phone && (
                        <p id="phone-error" className="text-xs text-destructive">
                            {errors.phone}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                        {t('email')}
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={value.email || ''}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className={errors.email ? 'border-destructive' : ''}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                        <p id="email-error" className="text-xs text-destructive">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="organization" className="text-sm font-medium">
                        {t('organization')}
                    </Label>
                    <Input
                        id="organization"
                        type="text"
                        placeholder={t('organizationPlaceholder')}
                        value={value.organization || ''}
                        onChange={(e) => handleFieldChange('organization', e.target.value)}
                        className={errors.organization ? 'border-destructive' : ''}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="url" className="text-sm font-medium">
                        {t('website')}
                    </Label>
                    <Input
                        id="url"
                        type="url"
                        placeholder={t('websitePlaceholder')}
                        value={value.url || ''}
                        onChange={(e) => handleFieldChange('url', e.target.value)}
                        className={errors.url ? 'border-destructive' : ''}
                        aria-invalid={!!errors.url}
                        aria-describedby={errors.url ? 'url-error' : undefined}
                    />
                    {errors.url && (
                        <p id="url-error" className="text-xs text-destructive">
                            {errors.url}
                        </p>
                    )}
                </div>
            </div>

            <Separator />

            {/* Address Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Label className="text-sm font-semibold">
                        {t('addressSection')}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                        ({t('optional')})
                    </span>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="street" className="text-sm font-medium">
                        {t('street')}
                    </Label>
                    <Input
                        id="street"
                        type="text"
                        placeholder={t('streetPlaceholder')}
                        value={value.address?.street || ''}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        className={errors['address.street'] ? 'border-destructive' : ''}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium">
                            {t('city')}
                        </Label>
                        <Input
                            id="city"
                            type="text"
                            placeholder={t('cityPlaceholder')}
                            value={value.address?.city || ''}
                            onChange={(e) => handleAddressChange('city', e.target.value)}
                            className={errors['address.city'] ? 'border-destructive' : ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium">
                            {t('state')}
                        </Label>
                        <Input
                            id="state"
                            type="text"
                            placeholder={t('statePlaceholder')}
                            value={value.address?.state || ''}
                            onChange={(e) => handleAddressChange('state', e.target.value)}
                            className={errors['address.state'] ? 'border-destructive' : ''}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-sm font-medium">
                            {t('postalCode')}
                        </Label>
                        <Input
                            id="postalCode"
                            type="text"
                            placeholder={t('postalCodePlaceholder')}
                            value={value.address?.postalCode || ''}
                            onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                            className={errors['address.postalCode'] ? 'border-destructive' : ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-medium">
                            {t('country')}
                        </Label>
                        <Input
                            id="country"
                            type="text"
                            placeholder={t('countryPlaceholder')}
                            value={value.address?.country || ''}
                            onChange={(e) => handleAddressChange('country', e.target.value)}
                            className={errors['address.country'] ? 'border-destructive' : ''}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                <p>{t('requiredFieldsNote')}</p>
            </div>
        </div>
    );
};