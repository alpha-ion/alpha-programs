'use client';

import { createContactSchema, createTextSchema, createUrlSchema } from '@/lib/validation';
import type { QRContactInfo } from '@/types';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';

/**
 * Custom hook for form validation
 */
export const useFormValidation = <T extends z.ZodType>(
    schema: T,
    value: z.infer<T>
) => {
    const validationResult = useMemo(() => {
        return schema.safeParse(value);
    }, [schema, value]);

    const isValid = validationResult.success;

    const errors = useMemo(() => {
        if (validationResult.success) return [];
        return validationResult.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
        }));
    }, [validationResult]);

    const getFieldError = useCallback(
        (fieldPath: string) => {
            return errors.find((error) => error.path === fieldPath)?.message;
        },
        [errors]
    );

    return {
        isValid,
        errors,
        getFieldError,
        validationResult,
    };
};

/**
 * Custom hook for URL validation
 */
export const useUrlValidation = (url: string) => {
    const t = useTranslations('validation');
    const schema = useMemo(() => createUrlSchema(t), [t]);
    return useFormValidation(schema, url);
};

/**
 * Custom hook for text validation
 */
export const useTextValidation = (text: string) => {
    const t = useTranslations('validation');
    const schema = useMemo(() => createTextSchema(t), [t]);
    return useFormValidation(schema, text);
};

/**
 * Custom hook for contact validation
 */
export const useContactValidation = (contact: QRContactInfo) => {
    const t = useTranslations('validation');
    const schema = useMemo(() => createContactSchema(t), [t]);
    return useFormValidation(schema, contact);
};