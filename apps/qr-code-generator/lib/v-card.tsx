import type { QRContactInfo } from '@/types';

/**
 * Normalize URL by adding protocol if missing
 */
export const normalizeUrl = (url: string): string => {
    if (!url) return '';

    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }

    return `https://${trimmed}`;
};

/**
 * Generate vCard string from contact information
 * Supports VCard version 3.0 format
 */
export const generateVCard = (contact: QRContactInfo): string => {
    const lines: string[] = [];

    // vCard header
    lines.push('BEGIN:VCARD');
    lines.push('VERSION:3.0');

    // Name (required)
    const formattedName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    lines.push(`FN:${formattedName}`);
    lines.push(`N:${contact.lastName || ''};${contact.firstName};;;`);

    // Phone (required)
    if (contact.phone) {
        lines.push(`TEL;TYPE=CELL:${contact.phone}`);
    }

    // Email (optional)
    if (contact.email) {
        lines.push(`EMAIL:${contact.email}`);
    }

    // Organization (optional)
    if (contact.organization) {
        lines.push(`ORG:${contact.organization}`);
    }

    // Website URL (optional)
    if (contact.url) {
        lines.push(`URL:${normalizeUrl(contact.url)}`);
    }

    // Address (optional)
    if (contact.address) {
        const { street, city, state, postalCode, country } = contact.address;

        // Check if any address field is filled
        const hasAddress = street || city || state || postalCode || country;

        if (hasAddress) {
            // ADR format: ;;street;city;state;postalCode;country
            const addressLine = `ADR;TYPE=WORK:;;${street || ''};${city || ''};${state || ''};${postalCode || ''};${country || ''}`;
            lines.push(addressLine);
        }
    }

    // vCard footer
    lines.push('END:VCARD');

    return lines.join('\n');
};

/**
 * Escape special characters for vCard format
 */
export const escapeVCardValue = (value: string): string => {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
};

/**
 * Validate if string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(normalizeUrl(url));
        return true;
    } catch {
        return false;
    }
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    return cleaned;
};