/**
 * QR Generator Factory
 * 
 * Implements Strategy Pattern for QR code generation.
 * Automatically tries multiple strategies with failover support.
 */

import type {
  QRGenerationOptions,
  QRGenerationResult,
  QRGeneratorStrategy,
} from '@repo/qr-types';

// ============================================================================
// QRious Strategy (Client-side, High Quality)
// ============================================================================

export class QRiousStrategy implements QRGeneratorStrategy {
  name = 'qrious';
  priority = 1; // Highest priority

  private qriousLoaded = false;

  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    if (this.qriousLoaded || window.QRious) {
      return true;
    }

    try {
      await this.loadQRious();
      return true;
    } catch {
      return false;
    }
  }

  private async loadQRious(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.QRious) {
        this.qriousLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
      
      script.onload = () => {
        this.qriousLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load QRious library'));
      };
      
      document.head.appendChild(script);
    });
  }

  async generate(options: QRGenerationOptions): Promise<QRGenerationResult> {
    const { content, size = 400, errorCorrectionLevel = 'M', branding } = options;

    try {
      if (!window.QRious) {
        await this.loadQRious();
      }

      const canvas = document.createElement('canvas');
      
      new window.QRious({
        element: canvas,
        value: content,
        size: size,
        background: branding?.colors?.background || '#ffffff',
        foreground: branding?.colors?.foreground || '#000000',
        level: errorCorrectionLevel,
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);

      return {
        success: true,
        data: dataUrl,
        dataUrl: dataUrl,
        strategy: this.name,
        timestamp: Date.now(),
        metadata: {
          size,
          errorCorrectionLevel,
          contentType: options.contentType,
          contentLength: content.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'QRious generation failed',
        timestamp: Date.now(),
      };
    }
  }
}

// ============================================================================
// Google Charts Strategy (API-based, Reliable)
// ============================================================================

export class GoogleChartsStrategy implements QRGeneratorStrategy {
  name = 'google-charts';
  priority = 2;

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined';
  }

  async generate(options: QRGenerationOptions): Promise<QRGenerationResult> {
    const { content, size = 400, errorCorrectionLevel = 'M' } = options;

    try {
      const encodedData = encodeURIComponent(content);
      const url = `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodedData}&choe=UTF-8&chld=${errorCorrectionLevel}`;

      return {
        success: true,
        data: url,
        dataUrl: url,
        strategy: this.name,
        timestamp: Date.now(),
        metadata: {
          size,
          errorCorrectionLevel,
          contentType: options.contentType,
          contentLength: content.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google Charts generation failed',
        timestamp: Date.now(),
      };
    }
  }
}

// ============================================================================
// QR Server Strategy (Fallback)
// ============================================================================

export class QRServerStrategy implements QRGeneratorStrategy {
  name = 'qr-server';
  priority = 3;

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined';
  }

  async generate(options: QRGenerationOptions): Promise<QRGenerationResult> {
    const { content, size = 400, errorCorrectionLevel = 'M' } = options;

    try {
      const encodedData = encodeURIComponent(content);
      const eccMap: Record<string, string> = { L: 'L', M: 'M', Q: 'Q', H: 'H' };
      const ecc = eccMap[errorCorrectionLevel || 'M'] || 'M';
      
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&format=png&ecc=${ecc}&margin=10`;

      return {
        success: true,
        data: url,
        dataUrl: url,
        strategy: this.name,
        timestamp: Date.now(),
        metadata: {
          size,
          errorCorrectionLevel,
          contentType: options.contentType,
          contentLength: content.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'QR Server generation failed',
        timestamp: Date.now(),
      };
    }
  }
}

// ============================================================================
// Generator Factory (Main API)
// ============================================================================

export class QRGeneratorFactory {
  private strategies: QRGeneratorStrategy[] = [];
  private lastSuccessfulStrategy?: string;

  constructor() {
    // Register all strategies
    this.registerStrategy(new QRiousStrategy());
    this.registerStrategy(new GoogleChartsStrategy());
    this.registerStrategy(new QRServerStrategy());
  }

  /**
   * Register a new generation strategy
   */
  registerStrategy(strategy: QRGeneratorStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate QR code using best available strategy
   */
  async generate(options: QRGenerationOptions): Promise<QRGenerationResult> {
    if (!options.content || !options.content.trim()) {
      return {
        success: false,
        error: 'Content is required',
        timestamp: Date.now(),
      };
    }

    // Try last successful strategy first
    if (this.lastSuccessfulStrategy) {
      const lastStrategy = this.strategies.find(
        s => s.name === this.lastSuccessfulStrategy
      );
      
      if (lastStrategy && await lastStrategy.isAvailable()) {
        const result = await lastStrategy.generate(options);
        if (result.success) {
          return result;
        }
      }
    }

    // Try all strategies in priority order
    for (const strategy of this.strategies) {
      try {
        const available = await strategy.isAvailable();
        if (!available) continue;

        const result = await strategy.generate(options);
        
        if (result.success) {
          this.lastSuccessfulStrategy = strategy.name;
          return result;
        }
      } catch (error) {
        console.warn(`Strategy ${strategy.name} failed:`, error);
        continue;
      }
    }

    return {
      success: false,
      error: 'All generation strategies failed',
      timestamp: Date.now(),
    };
  }

  /**
   * Get list of available strategies
   */
  async getAvailableStrategies(): Promise<string[]> {
    const available: string[] = [];
    
    for (const strategy of this.strategies) {
      if (await strategy.isAvailable()) {
        available.push(strategy.name);
      }
    }
    
    return available;
  }
}

// ============================================================================
// Global Type Declarations
// ============================================================================

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    QRious: any;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let generatorInstance: QRGeneratorFactory | null = null;

/**
 * Get singleton instance of QR generator
 */
export function getQRGenerator(): QRGeneratorFactory {
  if (!generatorInstance) {
    generatorInstance = new QRGeneratorFactory();
  }
  return generatorInstance;
}
