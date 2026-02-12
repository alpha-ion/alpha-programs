import { z } from 'zod';

/**
 * URL validation schema factory
 * Validates and normalizes URLs with localized error messages
 */
export const createUrlSchema = (t: (key: string) => string) => z
    .string()
    .min(1, t('urlRequired'))
    .refine(
        (value) => {
            try {
                // Try to parse as URL with protocol
                if (value.startsWith('http://') || value.startsWith('https://')) {
                    new URL(value);
                    return true;
                }
                // Try to parse with https:// prepended
                new URL(`https://${value}`);
                return true;
            } catch {
                return false;
            }
        },
        { message: t('urlInvalid') }
    );

/**
 * Text validation schema factory
 * Validates text input for QR code generation with localized error messages
 */
export const createTextSchema = (t: (key: string) => string) => z
    .string()
    .min(1, t('textRequired'))
    .max(2000, t('textTooLong'))
    .trim();

/**
 * Contact information validation schema factory
 * Validates contact form data for vCard generation with localized error messages
 */
export const createContactSchema = (t: (key: string) => string) => z.object({
    firstName: z
        .string()
        .min(1, t('firstNameRequired'))
        .max(100, t('firstNameTooLong'))
        .trim(),

    lastName: z
        .string()
        .max(100, t('lastNameTooLong'))
        .trim()
        .optional()
        .or(z.literal('')),

    phone: z
        .string()
        .regex(
            /^[\d\s\-\+\(\)]+$/,
            t('phoneInvalid')
        )
        .min(1, t('phoneRequired'))
        .max(20, t('phoneTooLong'))
        .trim(),

    email: z
        .string()
        .email(t('emailInvalid'))
        .max(100, t('emailTooLong'))
        .trim()
        .optional()
        .or(z.literal('')),

    organization: z
        .string()
        .max(100, t('orgTooLong'))
        .trim()
        .optional()
        .or(z.literal('')),

    url: z
        .string()
        .url(t('urlInvalid'))
        .max(200, t('urlTooLong'))
        .trim()
        .optional()
        .or(z.literal('')),

    address: z
        .object({
            street: z.string().max(200, t('streetTooLong')).trim().optional().or(z.literal('')),
            city: z.string().max(100, t('cityTooLong')).trim().optional().or(z.literal('')),
            state: z.string().max(100, t('stateTooLong')).trim().optional().or(z.literal('')),
            postalCode: z.string().max(20, t('postalCodeTooLong')).trim().optional().or(z.literal('')),
            country: z.string().max(100, t('countryTooLong')).trim().optional().or(z.literal('')),
        })
        .optional(),
});

/**
 * Type exports derived from schemas
 * Note: inferred types don't change based on runtime values like translation functions
 */
export type UrlInput = z.infer<ReturnType<typeof createUrlSchema>>;
export type TextInput = z.infer<ReturnType<typeof createTextSchema>>;
export type ContactInput = z.infer<ReturnType<typeof createContactSchema>>;