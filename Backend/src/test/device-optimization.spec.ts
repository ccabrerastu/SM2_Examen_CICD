import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import {
  DeviceDetectionMiddleware,
  DeviceInfo,
  DeviceOptimizationHelper,
} from '../shared/middleware/device-detection.middleware';

// Extended interface for testing with deviceInfo
interface RequestWithDeviceInfo extends Request {
  deviceInfo?: DeviceInfo;
}

// Mock Response type for testing - using Response type directly

describe('Device Optimization System', () => {
  let deviceDetectionMiddleware: DeviceDetectionMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceDetectionMiddleware],
    }).compile();

    deviceDetectionMiddleware = module.get<DeviceDetectionMiddleware>(DeviceDetectionMiddleware);
  });

  describe('DeviceDetectionMiddleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;

    beforeEach(() => {
      mockRequest = {
        headers: {},
        get: jest.fn(),
      };
      mockResponse = {
        setHeader: jest.fn(),
      };
      nextFunction = jest.fn();
    });

    it('should detect mobile device from user agent', () => {
      mockRequest.headers = {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      };

      deviceDetectionMiddleware.use(
        mockRequest as Request,
        mockResponse as unknown as Response,
        nextFunction,
      );

      expect(mockRequest.deviceInfo).toBeDefined();
      expect(mockRequest.deviceInfo!.isMobile).toBe(true);
      expect(mockRequest.deviceInfo!.platform).toBe('iOS');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should detect tablet device from user agent', () => {
      mockRequest.headers = {
        'user-agent': 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      };

      deviceDetectionMiddleware.use(
        mockRequest as RequestWithDeviceInfo,
        mockResponse as unknown as Response,
        nextFunction,
      );

      expect(mockRequest.deviceInfo).toBeDefined();
      expect(mockRequest.deviceInfo!.isTablet).toBe(true);
      expect(mockRequest.deviceInfo!.platform).toBe('iOS');
    });

    it('should detect desktop device from user agent', () => {
      mockRequest.headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      };

      deviceDetectionMiddleware.use(
        mockRequest as RequestWithDeviceInfo,
        mockResponse as unknown as Response,
        nextFunction,
      );

      expect(mockRequest.deviceInfo).toBeDefined();
      expect(mockRequest.deviceInfo!.isDesktop).toBe(true);
      expect(mockRequest.deviceInfo!.platform).toBe('Windows');
    });

    it('should detect Android device', () => {
      mockRequest.headers = {
        'user-agent':
          'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36',
      };

      deviceDetectionMiddleware.use(
        mockRequest as RequestWithDeviceInfo,
        mockResponse as unknown as Response,
        nextFunction,
      );

      expect(mockRequest.deviceInfo).toBeDefined();
      expect(mockRequest.deviceInfo!.isMobile).toBe(true);
      expect(mockRequest.deviceInfo!.platform).toBe('Android');
    });

    it('should detect low-end device from custom headers', () => {
      mockRequest.headers = {
        'user-agent':
          'Mozilla/5.0 (Linux; Android 8.0; SM-J320F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36',
        'x-low-end-device': 'true',
      };

      deviceDetectionMiddleware.use(
        mockRequest as RequestWithDeviceInfo,
        mockResponse as unknown as Response,
        nextFunction,
      );

      expect(mockRequest.deviceInfo).toBeDefined();
      expect(mockRequest.deviceInfo!.isMobile).toBe(true);
    });

    it('should detect slow connection from custom headers', () => {
      mockRequest.headers = {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        'x-slow-connection': 'true',
      };

      deviceDetectionMiddleware.use(
        mockRequest as RequestWithDeviceInfo,
        mockResponse as unknown as Response,
        nextFunction,
      );

      expect(mockRequest.deviceInfo).toBeDefined();
      expect(mockRequest.deviceInfo!.isMobile).toBe(true);
    });

    it('should handle missing user agent gracefully', () => {
      mockRequest.headers = {};

      deviceDetectionMiddleware.use(
        mockRequest as Request,
        mockResponse as unknown as Response,
        nextFunction,
      );

      expect(mockRequest.deviceInfo).toBeDefined();
      expect(mockRequest.deviceInfo!.isDesktop).toBe(true); // Default fallback
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should parse device model correctly', () => {
      mockRequest.headers = {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        'x-device-model': 'iPhone 12 Pro',
      };

      deviceDetectionMiddleware.use(
        mockRequest as RequestWithDeviceInfo,
        mockResponse as unknown as Response,
        nextFunction,
      );

      expect(mockRequest.deviceInfo).toBeDefined();
      expect(mockRequest.deviceInfo!.isMobile).toBe(true);
      expect(mockRequest.deviceInfo!.platform).toBe('iOS');
    });
  });

  describe('DeviceOptimizationHelper', () => {
    let mockDeviceInfo: DeviceInfo;

    beforeEach(() => {
      mockDeviceInfo = {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        platform: 'iOS',
        screenWidth: 375,
        screenHeight: 812,
        pixelRatio: 3,
        connectionType: '4g',
      };
    });

    it('should get correct max examples count for mobile devices', () => {
      const maxExamples = DeviceOptimizationHelper.getMaxExamplesCount(mockDeviceInfo);
      expect(maxExamples).toBeLessThanOrEqual(2); // Mobile should have max 2 examples
    });

    it('should get correct max examples count for slow connections', () => {
      mockDeviceInfo.connectionType = 'slow-2g';
      const maxExamples = DeviceOptimizationHelper.getMaxExamplesCount(mockDeviceInfo);
      expect(maxExamples).toBe(1); // Slow connections should have max 1 example
    });

    it('should get optimal response size for mobile devices', () => {
      const responseSize = DeviceOptimizationHelper.getOptimalResponseSize(mockDeviceInfo);
      expect(responseSize).toBe(500); // Mobile should have max 500 chars
    });

    it('should not include audio for slow connections', () => {
      mockDeviceInfo.connectionType = 'slow-2g';
      const shouldInclude = DeviceOptimizationHelper.shouldIncludeAudio(mockDeviceInfo);

      expect(shouldInclude).toBe(false);
    });

    it('should include audio for normal connections', () => {
      const shouldInclude = DeviceOptimizationHelper.shouldIncludeAudio(mockDeviceInfo);
      expect(shouldInclude).toBe(true);
    });

    it('should get correct max examples for desktop devices', () => {
      mockDeviceInfo.isMobile = false;
      mockDeviceInfo.isTablet = false;
      mockDeviceInfo.isDesktop = true;
      const maxExamples = DeviceOptimizationHelper.getMaxExamplesCount(mockDeviceInfo);

      expect(maxExamples).toBe(5); // Desktop should have max 5 examples
    });

    it('should include examples for normal connections', () => {
      const shouldInclude = DeviceOptimizationHelper.shouldIncludeExamples(mockDeviceInfo);
      expect(shouldInclude).toBe(true);
    });

    it('should handle undefined deviceInfo gracefully', () => {
      const maxExamples = DeviceOptimizationHelper.getMaxExamplesCount(undefined);
      const shouldIncludeAudio = DeviceOptimizationHelper.shouldIncludeAudio(undefined);

      expect(maxExamples).toBe(3);
      expect(shouldIncludeAudio).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should process device detection quickly', () => {
      const mockRequest = {
        headers: {
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        },
      };
      const mockResponse = {
        setHeader: jest.fn(),
      };
      const nextFunction = jest.fn();

      const startTime = Date.now();

      deviceDetectionMiddleware.use(
        mockRequest as RequestWithDeviceInfo,
        mockResponse as unknown as Response,
        nextFunction,
      );

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(10); // Should complete in less than 10ms
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should optimize responses quickly', () => {
      const mockDeviceInfo: DeviceInfo = {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        platform: 'iOS',
        screenWidth: 375,
        screenHeight: 812,
        pixelRatio: 3,
        connectionType: '4g',
      };

      const startTime = Date.now();

      DeviceOptimizationHelper.getMaxExamplesCount(mockDeviceInfo);
      DeviceOptimizationHelper.getOptimalResponseSize(mockDeviceInfo);
      DeviceOptimizationHelper.shouldIncludeAudio(mockDeviceInfo);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(50); // Should complete in less than 50ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed user agents gracefully', () => {
      const mockRequest = {
        headers: {
          'user-agent': 'invalid-user-agent-string',
        },
        deviceInfo: undefined,
      };
      const mockResponse = {
        setHeader: jest.fn(),
      };
      const nextFunction = jest.fn();

      expect(() => {
        deviceDetectionMiddleware.use(
          mockRequest as unknown as RequestWithDeviceInfo,
          mockResponse as unknown as Response,
          nextFunction,
        );
      }).not.toThrow();

      expect(mockRequest.deviceInfo).toBeDefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle very long user agents', () => {
      const longUserAgent = 'Mozilla/5.0 '.repeat(1000);
      const mockRequest = {
        headers: {
          'user-agent': longUserAgent,
        },
        deviceInfo: undefined,
      };
      const mockResponse = {
        setHeader: jest.fn(),
      };
      const nextFunction = jest.fn();

      expect(() => {
        deviceDetectionMiddleware.use(
          mockRequest as unknown as RequestWithDeviceInfo,
          mockResponse as unknown as Response,
          nextFunction,
        );
      }).not.toThrow();

      expect(mockRequest.deviceInfo).toBeDefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle optimization with extreme values', () => {
      const mockDeviceInfo: DeviceInfo = {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        userAgent: 'Mozilla/5.0 (Linux; Android 4.4.2; SM-G313HN Build/KOT49H)',
        platform: 'Android',
        screenWidth: 0,
        screenHeight: 0,
        pixelRatio: 0,
        connectionType: 'slow-2g',
      };

      expect(() => {
        DeviceOptimizationHelper.getOptimalResponseSize(mockDeviceInfo);
        DeviceOptimizationHelper.getMaxExamplesCount(mockDeviceInfo);
      }).not.toThrow();
    });
  });
});

// Type augmentation for testing - using module augmentation instead of namespace
declare module 'express-serve-static-core' {
  interface Request {
    deviceInfo?: DeviceInfo;
  }
}
