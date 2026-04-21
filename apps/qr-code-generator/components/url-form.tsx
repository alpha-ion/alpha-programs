'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createUrlSchema } from '@/lib/validation';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

interface URLFormProps {
    value: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
}

export const URLForm: React.FC<URLFormProps> = ({
    value,
    onChange,
    autoFocus = false,
}) => {
    const t = useTranslations('url-form');
    const tValidation = useTranslations('validation');

    const error = useMemo(() => {
        if (!value) return undefined;
        const urlSchema = createUrlSchema(tValidation);
        const result = urlSchema.safeParse(value);
        return result.success ? undefined : result.error.issues[0]?.message;
    }, [value, tValidation]);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-medium">
                    {t('urlLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="url"
                    type="url"
                    placeholder={t('urlPlaceholder')}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoFocus={autoFocus}
                    className={error ? 'border-destructive' : ''}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'url-error' : undefined}
                />
                {error && (
                    <p id="url-error" className="text-xs text-destructive">
                        {error}
                    </p>
                )}
            </div>

            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                <p>{t('urlHint')}</p>
            </div>
        </div>
    );
};