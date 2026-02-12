export type QRContentType = 'url' | 'text' | 'contact' | 'email' | 'phone' | 'wifi' | 'sms';

export type QRErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type QRExportFormat = 'png' | 'svg' | 'pdf' | 'jpg';

export type QRSizePreset = 'small' | 'medium' | 'large' | 'xlarge' | 'custom';

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

export interface QRColorOptions {
  foreground: string;
  background: string;
}

export interface QRLogoOptions {
  url: string;
  size: number;
  margin: number;
  cornerRadius?: number;
}
export interface QRBrandingOptions {
  colors: QRColorOptions;
  logo?: QRLogoOptions;
  cornerStyle?: 'square' | 'rounded' | 'dot';
  dotStyle?: 'square' | 'rounded' | 'dot';
}
export interface QRGenerationOptions {
  content: string;
  contentType: QRContentType;
  size?: number;
  errorCorrectionLevel?: QRErrorCorrectionLevel;
  branding?: Partial<QRBrandingOptions>;
  margin?: number;
}
export interface QRGenerationResult {
  success: boolean;
  data?: string;
  dataUrl?: string;
  error?: string;
  strategy?: string;
  timestamp: number;
  metadata?: {
    size: number;
    errorCorrectionLevel: QRErrorCorrectionLevel;
    contentType: QRContentType;
    contentLength: number;
  };
}
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

export interface QRListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  contentType?: QRContentType;
  tags?: string[];
  favorite?: boolean;
}export interface QRStorageProvider {
  save(record: QRCodeRecord): Promise<void>;
  get(id: string): Promise<QRCodeRecord | null>;
  list(options?: QRListOptions): Promise<QRCodeRecord[]>;
  update(id: string, updates: Partial<QRCodeRecord>): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  export(): Promise<QRCodeRecord[]>;
  import(records: QRCodeRecord[]): Promise<void>;
  getStats(): Promise<{
    count: number;
    size: number;
    oldestRecord?: number;
    newestRecord?: number;
  }>;
}

export type QRScanEventType = 'view' | 'scan' | 'download' | 'share';

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

export interface QRValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  sanitized?: string;
}

export interface QRContentValidator {
  validate(content: string, contentType: QRContentType): QRValidationResult;
}
export interface QRGeneratorStrategy {
  name: string;
  priority: number;
  isAvailable(): Promise<boolean>;
  generate(options: QRGenerationOptions): Promise<QRGenerationResult>;
}

export interface QRExportOptions {
  format: QRExportFormat;
  size?: number;
  quality?: number;
  filename?: string;
  includeMetadata?: boolean;
}
export interface QRExportResult {
  success: boolean;
  blob?: Blob;
  error?: string;
  filename: string;
}
export type Locale = 'en-US' | 'es-ES' | 'ar-EG' | 'fr-FR' | 'de-DE' | 'zh-CN';

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

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

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

export function isQRGenerationResult(obj: unknown): obj is QRGenerationResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'success' in obj &&
    'timestamp' in obj
  );
}

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
