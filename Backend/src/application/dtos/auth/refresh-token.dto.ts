import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RefreshTokenRequestDto {
  @ApiProperty({
    description: 'The refresh token to be rotated',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;

  @ApiPropertyOptional({
    description: 'Device information for tracking',
    example: 'iPhone 13 Pro',
  })
  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @ApiPropertyOptional({
    description: 'User agent string',
    example: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'New access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'New refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 3600,
  })
  expiresIn!: number;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType!: string;
}

export class RevokeTokensRequestDto {
  @ApiPropertyOptional({
    description: 'Family ID to revoke (if not provided, revokes all user tokens)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  familyId?: string;

  @ApiPropertyOptional({
    description: 'Reason for revocation',
    example: 'USER_INITIATED_LOGOUT',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RevokeTokensResponseDto {
  @ApiProperty({
    description: 'Number of tokens revoked',
    example: 3,
  })
  revokedCount!: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Tokens successfully revoked',
  })
  message!: string;
}

export class ActiveSessionDto {
  @ApiProperty({
    description: 'Family ID of the session',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  familyId!: string;

  @ApiProperty({
    description: 'Device information',
    example: 'iPhone 13 Pro',
    required: false,
  })
  deviceInfo?: string;

  @ApiProperty({
    description: 'User agent information',
    example: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    required: false,
  })
  userAgent?: string;
}

export class GetActiveSessionsResponseDto {
  @ApiProperty({
    description: 'List of active sessions',
    type: [ActiveSessionDto],
  })
  sessions!: ActiveSessionDto[];

  @ApiProperty({
    description: 'Total number of active sessions',
    example: 3,
  })
  totalSessions!: number;
}
