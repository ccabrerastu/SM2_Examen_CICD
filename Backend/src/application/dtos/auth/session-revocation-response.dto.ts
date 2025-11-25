import { ApiProperty } from '@nestjs/swagger';

export class SessionRevocationResponseDto {
  @ApiProperty({
    description: 'Indicates if the session was successfully revoked',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Human-readable message about the revocation',
    example: 'Session revoked successfully',
  })
  readonly message!: string;

  @ApiProperty({
    description: 'Family ID of the revoked session',
    example: 'uuid-family-id',
  })
  readonly familyId!: string;

  @ApiProperty({
    description: 'Timestamp when the session was revoked',
    example: '2024-01-15T14:45:00Z',
  })
  readonly revokedAt!: Date;

  constructor(success: boolean, message: string, familyId: string, revokedAt: Date) {
    this.success = success;
    this.message = message;
    this.familyId = familyId;
    this.revokedAt = revokedAt;
  }
}
