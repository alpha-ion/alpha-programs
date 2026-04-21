'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createTextSchema } from '@/lib/validation';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

interface TextFormProps {
    value: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
}

export const TextForm: React.FC<TextFormProps> = ({
    value,
    onChange,
    autoFocus = false,
}) => {
    const t = useTranslations('text-form');
    const tValidation = useTranslations('validation');

    const error = useMemo(() => {
        if (!value) return undefined;
        const textSchema = createTextSchema(tValidation);
        const result = textSchema.safeParse(value);
        return result.success ? undefined : result.error.issues[0]?.message;
    }, [value, tValidation]);

    const characterCount = value.length;
    const maxCharacters = 2000;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="text" className="text-sm font-medium">
                        {t('textLabel')} <span className="text-destructive">*</span>
                    </Label>
                    <span
                        className={`text-xs ${characterCount > maxCharacters
                                ? 'text-destructive font-medium'
                                : 'text-muted-foreground'
                            }`}
                    >
                        {characterCount} / {maxCharacters}
                    </span>
                </div>
                <Textarea
                    id="text"
                    placeholder={t('textPlaceholder')}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoFocus={autoFocus}
                    className={`min-h-[200px] resize-none ${error ? 'border-destructive' : ''}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'text-error' : undefined}
                    maxLength={maxCharacters + 100} // Allow slight overflow for better UX
                />
                {error && (
                    <p id="text-error" className="text-xs text-destructive">
                        {error}
                    </p>
                )}
            </div>

            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                <p>{t('textHint')}</p>
            </div>
        </div>
    );
};