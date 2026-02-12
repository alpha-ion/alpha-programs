export interface LanguageToggleProps {
    currentLocale: string
}

/**
 * Address information for vCard
 */
export interface QRAddress {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

/**
 * Contact information for vCard generation
 */
export interface QRContactInfo {
    firstName: string;
    lastName?: string;
    phone: string;
    email?: string;
    organization?: string;
    url?: string;
    address?: QRAddress;
}

/**
 * QR Code content types
 */
export type QRContentType = 'url' | 'text' | 'contact';

/**
 * QR Code generation options
 */
export interface QRGenerateOptions {
    content: string;
    contentType: QRContentType;
    size?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * QR Code generation result
 */
export interface QRGenerateResult {
    success: boolean;
    dataUrl?: string;
    strategy?: 'qrious' | 'qrcode';
    error?: string;
}

/**
 * Form validation error
 */
export interface FormValidationError {
    field: string;
    message: string;
}