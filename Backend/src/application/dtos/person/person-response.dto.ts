import { ApiProperty } from '@nestjs/swagger';

export class PersonResponseDto {
  @ApiProperty({
    description: 'Person unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'Person full name',
    example: 'John Doe',
  })
  readonly fullName!: string;

  @ApiProperty({
    description: 'Person creation timestamp',
    example: '2023-12-01T10:00:00.000Z',
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: 'Person last update timestamp',
    example: '2023-12-01T10:00:00.000Z',
  })
  readonly updatedAt!: Date;
}
