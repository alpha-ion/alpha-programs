import type {
  QRContentType,
  QRValidationResult,
  QRContactInfo,
} from '@repo/qr-types';

// ============================================================================
// URL Validation
// ============================================================================

/**
 * Normalize URL by adding https:// if missing
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already has protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Add https://
  return `https://${trimmed}`;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): QRValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!url || !url.trim()) {
    errors.push('URL is required');
    return { valid: false, errors, warnings };
  }

  const normalized = normalizeUrl(url);

  try {
    const urlObj = new URL(normalized);
    
    // Check for valid protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      warnings.push('Only HTTP and HTTPS protocols are recommended');
    }

    // Check for suspicious patterns
    if (urlObj.hostname.includes('..')) {
      errors.push('Invalid hostname format');
    }

    // Length check
    if (normalized.length > 2000) {
      warnings.push('URL is very long and may not scan well');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      sanitized: normalized,
    };
  } catch (error) {
    errors.push('Invalid URL format');
    return { valid: false, errors, warnings };
  }
}

// ============================================================================
// Text Validation
// ============================================================================

/**
 * Validate text content
 */
export function validateText(text: string): QRValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!text || !text.trim()) {
    errors.push('Text is required');
    return { valid: false, errors, warnings };
  }

  const trimmed = text.trim();

  // Length checks
  if (trimmed.length > 4000) {
    errors.push('Text is too long (max 4000 characters)');
  } else if (trimmed.length > 2000) {
    warnings.push('Long text may result in dense QR code');
  }

  // Check for potentially problematic characters
  const hasControlChars = /[\x00-\x1F\x7F]/.test(trimmed);
  if (hasControlChars) {
    warnings.push('Text contains control characters');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized: trimmed,
  };
}

// ============================================================================
// Email Validation
// ============================================================================

/**
 * Validate email address
 */
export function validateEmail(email: string): QRValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!email || !email.trim()) {
    errors.push('Email is required');
    return { valid: false, errors, warnings };
  }

  const trimmed = email.trim();
  
  // Basic email regex (RFC 5322 simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    errors.push('Invalid email format');
  }

  // Length check
  if (trimmed.length > 254) {
    errors.push('Email is too long');
  }

  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = trimmed.split('@')[1]?.toLowerCase();
  const similarDomain = commonDomains.find(d => {
    return domain && d !== domain && levenshteinDistance(d, domain) === 1;
  });

  if (similarDomain) {
    warnings.push(`Did you mean ${trimmed.split('@')[0]}@${similarDomain}?`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized: trimmed.toLowerCase(),
  };
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    const row = new Array(a.length + 1).fill(0);
    row[0] = i;
    matrix[i] = row;
  }

  // matrix[0] is guaranteed to exist now
  if (matrix[0]) {
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
  }

  for (let i = 1; i <= b.length; i++) {
    const currentRow = matrix[i];
    const prevRow = matrix[i-1];
    
    // Safety check for TS noUncheckedIndexedAccess
    if (!currentRow || !prevRow) continue;

    for (let j = 1; j <= a.length; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      
      currentRow[j] = Math.min(
        (prevRow[j - 1] ?? 0) + 1, // substitution (actually + cost for true Lev, but here cost=0 or 1. Wait, true Lev is +cost for substitution)
        (currentRow[j - 1] ?? 0) + 1, // insertion
        (prevRow[j] ?? 0) + 1 // deletion
      );

      // Correction: Standard algorithm uses +cost for substitution path
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        currentRow[j] = prevRow[j - 1] ?? 0; // Match
      } else {
         // Mismatch: min(substitution, insertion, deletion)
         currentRow[j] = Math.min(
          (prevRow[j - 1] ?? 0) + 1,
          (currentRow[j - 1] ?? 0) + 1,
          (prevRow[j] ?? 0) + 1
        );
      }
    }
  }

  return matrix[b.length]?.[a.length] ?? 0;
}

// ============================================================================
// Phone Validation
// ============================================================================

/**
 * Validate phone number
 */
export function validatePhone(phone: string): QRValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!phone || !phone.trim()) {
    return { valid: true, errors, warnings, sanitized: '' }; // Phone is optional
  }

  const trimmed = phone.trim();
  
  // Remove common formatting characters
  const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');
  
  // Check for valid characters
  if (!/^[\+\d]+$/.test(cleaned)) {
    errors.push('Phone number contains invalid characters');
  }

  // Length check (international numbers can be 7-15 digits)
  if (cleaned.replace(/\+/, '').length < 7) {
    warnings.push('Phone number seems too short');
  } else if (cleaned.length > 15) {
    warnings.push('Phone number seems too long');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized: cleaned,
  };
}

// ============================================================================
// vCard Generation
// ============================================================================

/**
 * Generate vCard from contact info
 */
export function generateVCard(contact: QRContactInfo): string {
  const { firstName, lastName, phone, email, organization, url, address, birthday, notes } = contact;

  // Check if we have any data
  const hasData = firstName || lastName || phone || email || organization || url;
  if (!hasData) {
    return '';
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];

  // Name
  if (fullName) {
    lines.push(`FN:${fullName}`);
    lines.push(`N:${lastName};${firstName};;;`);
  }

  // Organization
  if (organization) {
    lines.push(`ORG:${organization}`);
  }

  // Contact details
  if (phone) {
    lines.push(`TEL:${phone}`);
  }

  if (email) {
    lines.push(`EMAIL:${email}`);
  }

  if (url) {
    lines.push(`URL:${url}`);
  }

  // Address
  if (address) {
    const { street, city, state, zip, country } = address;
    if (street || city || state || zip || country) {
      lines.push(
        `ADR:;;${street || ''};${city || ''};${state || ''};${zip || ''};${country || ''}`
      );
    }
  }

  // Birthday
  if (birthday) {
    lines.push(`BDAY:${birthday}`);
  }

  // Notes
  if (notes) {
    lines.push(`NOTE:${notes}`);
  }

  lines.push('END:VCARD');

  return lines.join('\n');
}

/**
 * Validate contact information
 */
export function validateContact(contact: QRContactInfo): QRValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // At least one field should be filled
  const hasData = 
    contact.firstName ||
    contact.lastName ||
    contact.phone ||
    contact.email ||
    contact.organization ||
    contact.url;

  if (!hasData) {
    errors.push('At least one contact field is required');
    return { valid: false, errors, warnings };
  }

  // Validate email if provided
  if (contact.email) {
    const emailResult = validateEmail(contact.email);
    errors.push(...emailResult.errors);
    if (emailResult.warnings) warnings.push(...emailResult.warnings);
  }

  // Validate phone if provided
  if (contact.phone) {
    const phoneResult = validatePhone(contact.phone);
    errors.push(...phoneResult.errors);
    if (phoneResult.warnings) warnings.push(...phoneResult.warnings);
  }

  // Validate URL if provided
  if (contact.url) {
    const urlResult = validateUrl(contact.url);
    errors.push(...urlResult.errors);
    if (urlResult.warnings) warnings.push(...urlResult.warnings);
  }

  const vcard = generateVCard(contact);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized: vcard,
  };
}

// ============================================================================
// Main Validator
// ============================================================================

/**
 * Validate content based on type
 */
export function validateQRContent(
  content: string,
  contentType: QRContentType
): QRValidationResult {
  switch (contentType) {
    case 'url':
      return validateUrl(content);
    
    case 'text':
      return validateText(content);
    
    case 'email':
      return validateEmail(content);
    
    case 'phone':
      return validatePhone(content);
    
    default:
      return validateText(content);
  }
}
