import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface ClientHints {
  screenWidth?: number | undefined;
  screenHeight?: number | undefined;
  pixelRatio?: number | undefined;
  mobile?: boolean | undefined;
  platform?: string | undefined;
}

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  userAgent: string;
  screenWidth?: number | undefined;
  screenHeight?: number | undefined;
  pixelRatio?: number | undefined;
  connectionType?: string | undefined;
  platform?: string | undefined;
  browser?: string | undefined;
  os?: string | undefined;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      deviceInfo?: DeviceInfo;
    }
  }
}

@Injectable()
export class DeviceDetectionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent'] || '';
    const clientHints = this.extractClientHints(req);

    const deviceInfo: DeviceInfo = {
      isMobile: this.isMobileDevice(userAgent, clientHints),
      isTablet: this.isTabletDevice(userAgent, clientHints),
      isDesktop: this.isDesktopDevice(userAgent, clientHints),
      userAgent,
      screenWidth: clientHints.screenWidth,
      screenHeight: clientHints.screenHeight,
      pixelRatio: clientHints.pixelRatio,
      connectionType: this.getConnectionType(req),
      platform: this.getPlatform(userAgent),
      browser: this.getBrowser(userAgent),
      os: this.getOperatingSystem(userAgent),
    };

    // Ensure only one device type is true
    if (deviceInfo.isMobile && deviceInfo.isTablet) {
      deviceInfo.isTablet = false;
    }
    if (!deviceInfo.isMobile && !deviceInfo.isTablet) {
      deviceInfo.isDesktop = true;
    }

    req.deviceInfo = deviceInfo;

    // Set response headers for client-side optimization
    res.setHeader('X-Device-Type', this.getDeviceType(deviceInfo));
    res.setHeader('X-Is-Mobile', deviceInfo.isMobile.toString());
    res.setHeader('X-Is-Tablet', deviceInfo.isTablet.toString());

    next();
  }

  private extractClientHints(req: Request): ClientHints {
    return {
      screenWidth: this.parseNumber(req.headers['sec-ch-viewport-width'] as string),
      screenHeight: this.parseNumber(req.headers['sec-ch-viewport-height'] as string),
      pixelRatio: this.parseNumber(req.headers['sec-ch-dpr'] as string),
      mobile: req.headers['sec-ch-ua-mobile']
        ? req.headers['sec-ch-ua-mobile'] === '?1'
        : undefined,
      platform: req.headers['sec-ch-ua-platform'] as string,
    };
  }

  private parseNumber(value: string | undefined): number | undefined {
    if (!value) return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }

  private isMobileDevice(userAgent: string, clientHints: ClientHints): boolean {
    // Check client hints first (more reliable)
    if (clientHints.mobile !== undefined) {
      return clientHints.mobile;
    }

    // Check screen width if available
    if (clientHints.screenWidth && clientHints.screenWidth < 768) {
      return true;
    }

    // Exclude tablets first (iPad, Android tablets)
    if (/iPad|Android(?!.*Mobile)|Tablet|PlayBook|Silk/i.test(userAgent)) {
      return false;
    }

    // Check for specific mobile patterns
    const specificMobileRegex = /iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile|Opera Mini|webOS/i;

    return specificMobileRegex.test(userAgent);
  }

  private isTabletDevice(userAgent: string, clientHints: ClientHints): boolean {
    // Check screen width for tablet range
    if (
      clientHints.screenWidth &&
      clientHints.screenWidth >= 768 &&
      clientHints.screenWidth <= 1024
    ) {
      return true;
    }

    // iPad detection (including modern iPads that may not have "iPad" in user agent)
    if (/iPad/i.test(userAgent)) {
      return true;
    }

    // Modern iPad detection using Safari on Mac patterns
    if (
      /Macintosh/i.test(userAgent) &&
      /Safari/i.test(userAgent) &&
      !/Chrome/i.test(userAgent) &&
      clientHints.mobile === false
    ) {
      return true;
    }

    // Android tablets (Android without "Mobile" keyword)
    if (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) {
      return true;
    }

    // Other tablet patterns
    const tabletRegex = /Tablet|PlayBook|Silk|Kindle/i;
    return tabletRegex.test(userAgent);
  }

  private isDesktopDevice(userAgent: string, clientHints: ClientHints): boolean {
    // Check screen width for desktop
    if (clientHints.screenWidth && clientHints.screenWidth > 1024) {
      return true;
    }

    // Check for desktop-specific patterns
    const desktopRegex = /Windows NT|Macintosh|Linux|X11/i;
    const mobileTabletRegex =
      /iPhone|iPod|iPad|Android|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|PlayBook|Silk|Kindle/i;

    // If it has desktop patterns and no mobile/tablet patterns, it's desktop
    return desktopRegex.test(userAgent) && !mobileTabletRegex.test(userAgent);
  }

  private getConnectionType(req: Request): string | undefined {
    // Check for connection type hints
    const downlink = req.headers['downlink'] as string;

    // Use proper connection headers
    if (req.headers['connection-type']) {
      return req.headers['connection-type'] as string;
    }

    if (downlink) {
      const speed = parseFloat(downlink);
      if (speed < 0.5) return 'slow-2g';
      if (speed < 1.5) return '2g';
      if (speed < 10) return '3g';
      return '4g';
    }

    // Fallback based on user agent patterns for mobile
    const userAgent = req.headers['user-agent'] || '';
    if (/2G|EDGE/i.test(userAgent)) return '2g';
    if (/3G/i.test(userAgent)) return '3g';
    if (/4G|LTE/i.test(userAgent)) return '4g';

    return undefined;
  }

  private getPlatform(userAgent: string): string | undefined {
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/iOS|iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/Mac OS X/i.test(userAgent)) return 'macOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    return undefined;
  }

  private getBrowser(userAgent: string): string | undefined {
    if (/Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)) return 'Chrome';
    if (/Firefox/i.test(userAgent)) return 'Firefox';
    if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return 'Safari';
    if (/Edge|Edg/i.test(userAgent)) return 'Edge';
    if (/Opera|OPR/i.test(userAgent)) return 'Opera';
    return undefined;
  }

  private getOperatingSystem(userAgent: string): string | undefined {
    if (/Windows NT 10/i.test(userAgent)) return 'Windows 10';
    if (/Windows NT 6.3/i.test(userAgent)) return 'Windows 8.1';
    if (/Windows NT 6.2/i.test(userAgent)) return 'Windows 8';
    if (/Windows NT 6.1/i.test(userAgent)) return 'Windows 7';
    if (/Mac OS X 10[._](\d+)/i.test(userAgent)) {
      const match = userAgent.match(/Mac OS X 10[._](\d+)/i);
      return match ? `macOS 10.${match[1]}` : 'macOS';
    }
    if (/Android (\d+\.\d+)/i.test(userAgent)) {
      const match = userAgent.match(/Android (\d+\.\d+)/i);
      return match ? `Android ${match[1]}` : 'Android';
    }
    if (/OS (\d+_\d+)/i.test(userAgent)) {
      const match = userAgent.match(/OS (\d+_\d+)/i);
      return match ? `iOS ${match[1].replace('_', '.')}` : 'iOS';
    }
    return undefined;
  }

  private getDeviceType(deviceInfo: DeviceInfo): string {
    if (deviceInfo.isMobile) return 'mobile';
    if (deviceInfo.isTablet) return 'tablet';
    return 'desktop';
  }
}

// Helper functions for use in services
export class DeviceOptimizationHelper {
  static shouldCompressResponse(deviceInfo?: DeviceInfo): boolean {
    if (!deviceInfo) return false;

    // Compress for mobile devices or slow connections
    return (
      deviceInfo.isMobile ||
      deviceInfo.connectionType === 'slow-2g' ||
      deviceInfo.connectionType === '2g'
    );
  }

  static getOptimalImageSize(deviceInfo?: DeviceInfo): { width: number; height: number } {
    if (!deviceInfo) return { width: 800, height: 600 };

    if (deviceInfo.isMobile) {
      return { width: 400, height: 300 };
    } else if (deviceInfo.isTablet) {
      return { width: 600, height: 450 };
    } else {
      return { width: 800, height: 600 };
    }
  }

  static getOptimalResponseSize(deviceInfo?: DeviceInfo): number {
    if (!deviceInfo) return 1000;

    // Limit response size for mobile devices
    if (deviceInfo.isMobile) {
      return 500; // 500 characters max for mobile
    } else if (deviceInfo.isTablet) {
      return 750; // 750 characters max for tablet
    } else {
      return 1000; // 1000 characters max for desktop
    }
  }

  static shouldIncludeExamples(deviceInfo?: DeviceInfo): boolean {
    if (!deviceInfo) return true;

    // Reduce examples for mobile to save bandwidth
    return !deviceInfo.isMobile || deviceInfo.connectionType !== 'slow-2g';
  }

  static getMaxExamplesCount(deviceInfo?: DeviceInfo): number {
    if (!deviceInfo) return 3;

    if (deviceInfo.isMobile) {
      return deviceInfo.connectionType === 'slow-2g' ? 1 : 2;
    } else if (deviceInfo.isTablet) {
      return 3;
    } else {
      return 5;
    }
  }

  static shouldIncludeAudio(deviceInfo?: DeviceInfo): boolean {
    if (!deviceInfo) return true;

    // Skip audio for very slow connections
    return deviceInfo.connectionType !== 'slow-2g';
  }

  static getOptimalCacheHeaders(deviceInfo?: DeviceInfo): Record<string, string> {
    const baseHeaders = {
      'Cache-Control': 'public, max-age=3600',
      Vary: 'User-Agent, Accept-Encoding',
    };

    if (!deviceInfo) return baseHeaders;

    // Longer cache for mobile devices to reduce requests
    if (deviceInfo.isMobile) {
      baseHeaders['Cache-Control'] = 'public, max-age=7200'; // 2 hours
    }

    // Add device-specific vary headers
    baseHeaders['Vary'] += ', Sec-CH-UA-Mobile, Sec-CH-Viewport-Width';

    return baseHeaders;
  }
}
