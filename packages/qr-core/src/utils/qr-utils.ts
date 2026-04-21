/**
 * QR Utility Functions
 */

export function generateId(): string {
  return `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, '_');
}

// Re-export validators
export {
  normalizeUrl,
  validateUrl,
  validateText,
  validateEmail,
  validatePhone,
  validateContact,
  generateVCard,
  validateQRContent,
} from '../validators/content-validator';
