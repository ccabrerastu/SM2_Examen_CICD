import { ApiProperty } from '@nestjs/swagger';

export class ActiveSessionDto {
  @ApiProperty({
    description: 'Unique family ID for the session',
    example: 'uuid-family-id',
  })
  readonly familyId!: string;

  @ApiProperty({
    description: 'Device information where session is active',
    example: 'iPhone 13 Pro',
    nullable: true,
  })
  readonly deviceInfo!: string | null;

  @ApiProperty({
    description: 'User agent string from the browser/app',
    example: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    nullable: true,
  })
  readonly userAgent!: string | null;

  @ApiProperty({
    description: 'Location or IP information (masked for privacy)',
    example: 'New York, NY',
    nullable: true,
  })
  readonly location!: string | null;

  @ApiProperty({
    description: 'When this session was first created',
    example: '2024-01-15T10:30:00Z',
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: 'When this session was last used',
    example: '2024-01-15T14:45:00Z',
  })
  readonly lastUsedAt!: Date;

  @ApiProperty({
    description: 'Whether this is the current session',
    example: true,
  })
  readonly isCurrent!: boolean;

  constructor(
    familyId: string,
    deviceInfo: string | null,
    userAgent: string | null,
    location: string | null,
    createdAt: Date,
    lastUsedAt: Date,
    isCurrent: boolean,
  ) {
    this.familyId = familyId;
    this.deviceInfo = deviceInfo;
    this.userAgent = userAgent;
    this.location = location;
    this.createdAt = createdAt;
    this.lastUsedAt = lastUsedAt;
    this.isCurrent = isCurrent;
  }
}

export class ActiveSessionsResponseDto {
  @ApiProperty({
    description: 'List of active sessions for the user',
    type: [ActiveSessionDto],
  })
  readonly sessions!: ActiveSessionDto[];

  @ApiProperty({
    description: 'Total number of active sessions',
    example: 3,
  })
  readonly totalCount!: number;

  @ApiProperty({
    description: 'Current user ID',
    example: 'uuid-user-id',
  })
  readonly userId!: string;

  constructor(sessions: ActiveSessionDto[], totalCount: number, userId: string) {
    this.sessions = sessions;
    this.totalCount = totalCount;
    this.userId = userId;
  }
}
