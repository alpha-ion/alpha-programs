/**
 * @repo/qr-types
 * 
 * Shared TypeScript type definitions for QR Code generation system.
 * This package provides a single source of truth for all types across the application.
 */

// ============================================================================
// Content Types
// ============================================================================

/**
 * Supported QR code content types
 */
export type QRContentType = 'url' | 'text' | 'contact' | 'email' | 'phone' | 'wifi' | 'sms';

/**
 * Error correction levels for QR codes
 * L = ~7% correction, M = ~15%, Q = ~25%, H = ~30%
 */
export type QRErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * Export format options
 */
export type QRExportFormat = 'png' | 'svg' | 'pdf' | 'jpg';

/**
 * QR code size presets
 */
export type QRSizePreset = 'small' | 'medium' | 'large' | 'xlarge' | 'custom';

// ============================================================================
// Contact Information
// ============================================================================

/**
 * Contact information for vCard generation
 */
export interface QRContactInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  url: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  birthday?: string;
  notes?: string;
}

// ============================================================================
// Branding & Customization
// ============================================================================

/**
 * Color configuration for QR codes
 */
export interface QRColorOptions {
  foreground: string;
  background: string;
}

/**
 * Logo embedding options
 */
export interface QRLogoOptions {
  url: string;
  size: number;
  margin: number;
  cornerRadius?: number;
}

/**
 * Complete branding options
 */
export interface QRBrandingOptions {
  colors: QRColorOptions;
  logo?: QRLogoOptions;
  cornerStyle?: 'square' | 'rounded' | 'dot';
  dotStyle?: 'square' | 'rounded' | 'dot';
}

// ============================================================================
// Generation Options
// ============================================================================

/**
 * Complete options for QR code generation
 */
export interface QRGenerationOptions {
  content: string;
  contentType: QRContentType;
  size?: number;
  errorCorrectionLevel?: QRErrorCorrectionLevel;
  branding?: Partial<QRBrandingOptions>;
  margin?: number;
}

/**
 * Result of QR code generation
 */
export interface QRGenerationResult {
  success: boolean;
  data?: string; // Base64 or URL
  dataUrl?: string; // Data URL for canvas
  error?: string;
  strategy?: string; // Which generator was used
  timestamp: number;
  metadata?: {
    size: number;
    errorCorrectionLevel: QRErrorCorrectionLevel;
    contentType: QRContentType;
    contentLength: number;
  };
}

// ============================================================================
// Storage & History
// ============================================================================

/**
 * Stored QR code record
 */
export interface QRCodeRecord {
  id: string;
  content: string;
  contentType: QRContentType;
  dataUrl: string;
  createdAt: number;
  updatedAt: number;
  metadata: {
    size: number;
    errorCorrectionLevel: QRErrorCorrectionLevel;
    name?: string;
    tags?: string[];
    favorite?: boolean;
  };
}

/**
 * Options for listing stored QR codes
 */
export interface QRListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  contentType?: QRContentType;
  tags?: string[];
  favorite?: boolean;
}

// ============================================================================
// Storage Provider Interface
// ============================================================================

/**
 * Abstract storage provider interface
 * Implementations: IndexedDB, localStorage, remote API
 */
export interface QRStorageProvider {
  /**
   * Save a QR code record
   */
  save(record: QRCodeRecord): Promise<void>;

  /**
   * Get a QR code by ID
   */
  get(id: string): Promise<QRCodeRecord | null>;

  /**
   * List QR codes with optional filtering
   */
  list(options?: QRListOptions): Promise<QRCodeRecord[]>;

  /**
   * Update an existing record
   */
  update(id: string, updates: Partial<QRCodeRecord>): Promise<void>;

  /**
   * Delete a QR code
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all QR codes
   */
  clear(): Promise<void>;

  /**
   * Export all data
   */
  export(): Promise<QRCodeRecord[]>;

  /**
   * Import data
   */
  import(records: QRCodeRecord[]): Promise<void>;

  /**
   * Get storage statistics
   */
  getStats(): Promise<{
    count: number;
    size: number;
    oldestRecord?: number;
    newestRecord?: number;
  }>;
}

// ============================================================================
// Analytics & Tracking
// ============================================================================

/**
 * Scan event types
 */
export type QRScanEventType = 'view' | 'scan' | 'download' | 'share';

/**
 * Analytics event
 */
export interface QRAnalyticsEvent {
  id: string;
  qrCodeId: string;
  eventType: QRScanEventType;
  timestamp: number;
  metadata?: {
    userAgent?: string;
    platform?: string;
    location?: string;
    referrer?: string;
  };
}

/**
 * Analytics provider interface
 */
export interface QRAnalyticsProvider {
  track(event: QRAnalyticsEvent): Promise<void>;
  getEvents(qrCodeId: string): Promise<QRAnalyticsEvent[]>;
  getStats(qrCodeId: string): Promise<{
    totalScans: number;
    uniqueScans: number;
    lastScan?: number;
    scansByType: Record<QRScanEventType, number>;
  }>;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validation result
 */
export interface QRValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  sanitized?: string; // Cleaned/normalized version
}

/**
 * Content validator interface
 */
export interface QRContentValidator {
  validate(content: string, contentType: QRContentType): QRValidationResult;
}

// ============================================================================
// Generator Strategy
// ============================================================================

/**
 * QR generator strategy interface
 */
export interface QRGeneratorStrategy {
  name: string;
  priority: number;
  isAvailable(): Promise<boolean>;
  generate(options: QRGenerationOptions): Promise<QRGenerationResult>;
}

// ============================================================================
// Export Options
// ============================================================================

/**
 * Options for exporting QR codes
 */
export interface QRExportOptions {
  format: QRExportFormat;
  size?: number;
  quality?: number; // 0-1 for JPG
  filename?: string;
  includeMetadata?: boolean;
}

/**
 * Export result
 */
export interface QRExportResult {
  success: boolean;
  blob?: Blob;
  error?: string;
  filename: string;
}

// ============================================================================
// Internationalization
// ============================================================================

/**
 * Supported locales
 */
export type Locale = 'en-US' | 'es-ES' | 'ar-EG' | 'fr-FR' | 'de-DE' | 'zh-CN';

/**
 * Translation keys
 */
export interface Translation {
  appTitle: string;
  appDescription: string;
  urlTab: string;
  textTab: string;
  contactTab: string;
  websiteUrl: string;
  urlPlaceholder: string;
  urlHelp: string;
  textContent: string;
  textPlaceholder: string;
  firstName: string;
  firstNamePlaceholder: string;
  lastName: string;
  lastNamePlaceholder: string;
  phoneNumber: string;
  phonePlaceholder: string;
  emailAddress: string;
  emailPlaceholder: string;
  organization: string;
  organizationPlaceholder: string;
  clearAllFields: string;
  fillFormPrompt: string;
  download: string;
  copyData: string;
  copied: string;
  footerText: string;
  toggleDarkMode: string;
  error: string;
  success: string;
  loading: string;
  [key: string]: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional
 */
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================================================
// Configuration
// ============================================================================

/**
 * Application configuration
 */
export interface QRAppConfig {
  defaultSize: number;
  defaultErrorCorrection: QRErrorCorrectionLevel;
  maxContentLength: number;
  enableHistory: boolean;
  enableCustomization: boolean;
  enableTracking: boolean;
  storageProvider: 'indexeddb' | 'localstorage' | 'remote';
  apiEndpoint?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for QRGenerationResult
 */
export function isQRGenerationResult(obj: unknown): obj is QRGenerationResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'success' in obj &&
    'timestamp' in obj
  );
}

/**
 * Type guard for QRCodeRecord
 */
export function isQRCodeRecord(obj: unknown): obj is QRCodeRecord {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'content' in obj &&
    'contentType' in obj &&
    'dataUrl' in obj
  );
}
