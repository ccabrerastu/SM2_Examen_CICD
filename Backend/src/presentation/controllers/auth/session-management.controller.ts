import {
  Controller,
  Get,
  Delete,
  Param,
  HttpStatus,
  HttpCode,
  Req,
  Query,
  BadRequestException,
  ForbiddenException,
  Headers,
} from '@nestjs/common';
import { SkipCSRF } from '../../../shared/guards/csrf.guard';
import { UseRateLimit, RATE_LIMITS } from '../../../shared/guards/rate-limit.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { BaseAuthController } from './base-auth.controller';

// Use Cases
import { GetActiveSessionsUseCase } from '../../../application/use-cases/auth/get-active-sessions.use-case';
import { LogoutUserUseCase } from '../../../application/use-cases/auth/logout-user.use-case';

// DTOs
import { ActiveSessionsResponseDto } from '../../../application/dtos/auth/active-session.dto';
import { SessionRevocationResponseDto } from '../../../application/dtos/auth/session-revocation-response.dto';

@ApiTags('Authentication - Session Management')
@Controller('auth')
export class SessionManagementController extends BaseAuthController {
  constructor(
    private readonly getActiveSessionsUseCase: GetActiveSessionsUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
  ) {
    super();
  }

  // =================== SESSION MANAGEMENT ===================

  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  @SkipCSRF()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get active sessions for the authenticated user',
    description:
      'Returns a list of all active sessions for the current user with device and location information.',
  })
  @ApiQuery({
    name: 'currentFamilyId',
    required: false,
    description: 'Current session family ID to mark as current',
  })
  @ApiResponse({
    status: 200,
    description: 'Active sessions retrieved successfully',
    type: ActiveSessionsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated - valid JWT required',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async getActiveSessions(
    @Req() request: Request,
    @Headers('authorization') _authorization?: string,
    @Query('currentFamilyId') currentFamilyId?: string,
  ): Promise<ActiveSessionsResponseDto> {
    try {
      // Extract user ID from JWT token (should be available via guards)
      const userId =
        (request as { user?: { userId?: string; sub?: string } }).user?.userId ||
        (request as { user?: { userId?: string; sub?: string } }).user?.sub;

      if (!userId) {
        this.logger.warn('Active sessions request without valid user context');
        throw new BadRequestException('Invalid user context');
      }

      this.logger.debug(`Getting active sessions for user: ${userId}`);

      const result = await this.getActiveSessionsUseCase.execute({
        userId,
        ...(currentFamilyId && { currentFamilyId }),
      });

      this.logger.debug(`Retrieved ${result.totalCount} active sessions for user: ${userId}`);

      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Get active sessions failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      this.handleAuthError(error);
    }
  }

  @Delete('sessions/:familyId')
  @HttpCode(HttpStatus.OK)
  @SkipCSRF()
  @UseRateLimit(RATE_LIMITS.SESSION_REVOCATION)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Revoke a specific session',
    description:
      'Revokes a specific session by its family ID. The user can only revoke their own sessions.',
  })
  @ApiParam({
    name: 'familyId',
    description: 'Family ID of the session to revoke',
  })
  @ApiResponse({
    status: 200,
    description: 'Session revoked successfully',
    type: SessionRevocationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid family ID format',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Cannot revoke session - not authorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  async revokeSession(
    @Param('familyId') familyId: string,
    @Req() request: Request,
    @Headers('authorization') _authorization?: string,
  ): Promise<SessionRevocationResponseDto> {
    try {
      // Extract user ID from JWT token (should be available via guards)
      const userId =
        (request as { user?: { userId?: string; sub?: string } }).user?.userId ||
        (request as { user?: { userId?: string; sub?: string } }).user?.sub;

      if (!userId) {
        this.logger.warn('Session revocation request without valid user context');
        throw new BadRequestException('Invalid user context');
      }

      // Validate family ID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(familyId)) {
        this.logger.warn(`Invalid family ID format: ${familyId}`);
        throw new BadRequestException('Invalid family ID format');
      }

      this.logger.log(`Session revocation attempt for family: ${familyId}, user: ${userId}`);

      // Check if the user is trying to revoke their current session
      const currentFamilyId = (request as { user?: { familyId?: string } }).user?.familyId;
      if (familyId === currentFamilyId) {
        this.logger.warn(`User ${userId} attempting to revoke current session: ${familyId}`);
        throw new ForbiddenException(
          'Cannot revoke your current session. Use logout endpoint instead.',
        );
      }

      // Get user's active sessions to verify ownership
      const sessions = await this.getActiveSessionsUseCase.execute({ userId });
      const sessionExists = sessions.sessions.some(session => session.familyId === familyId);

      if (!sessionExists) {
        this.logger.warn(
          `User ${userId} attempted to revoke non-existent or unauthorized session: ${familyId}`,
        );
        throw new ForbiddenException('Session not found or not authorized');
      }

      // Revoke the specific session by family ID
      await this.logoutUserUseCase.revokeSessionByFamilyId(userId, familyId, 'USER_REVOCATION');

      this.logger.log(`Session ${familyId} revoked successfully for user: ${userId}`);

      return {
        success: true,
        message: 'Session revoked successfully',
        familyId,
        revokedAt: new Date(),
      };
    } catch (error: unknown) {
      this.logger.error(
        `Session revocation failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      this.handleAuthError(error);
    }
  }
}
