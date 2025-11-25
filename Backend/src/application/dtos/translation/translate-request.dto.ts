import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TranslateRequestDto {
  @ApiProperty({
    description: 'Text to be translated',
    example: 'Hello, how are you?',
    minLength: 1,
    maxLength: 5000,
  })
  @IsNotEmpty({ message: 'Text is required' })
  @IsString({ message: 'Text must be a string' })
  @MinLength(1, { message: 'Text cannot be empty' })
  @MaxLength(5000, { message: 'Text cannot exceed 5000 characters' })
  readonly text!: string;

  @ApiProperty({
    description: 'Source language code (ISO 639-1)',
    example: 'en',
    enum: ['en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'zh', 'ja', 'ko'],
  })
  @IsNotEmpty({ message: 'Source language is required' })
  @IsString({ message: 'Source language must be a string' })
  @IsIn(['en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'zh', 'ja', 'ko'], {
    message: 'Source language must be a valid language code',
  })
  readonly sourceLanguage!: string;

  @ApiProperty({
    description: 'Target language code (ISO 639-1)',
    example: 'es',
    enum: ['en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'zh', 'ja', 'ko'],
  })
  @IsNotEmpty({ message: 'Target language is required' })
  @IsString({ message: 'Target language must be a string' })
  @IsIn(['en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'zh', 'ja', 'ko'], {
    message: 'Target language must be a valid language code',
  })
  readonly targetLanguage!: string;

  @ApiPropertyOptional({
    description: 'Additional context to improve translation accuracy',
    example: 'This is a greeting in a formal business context',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Context must be a string' })
  @MaxLength(1000, { message: 'Context cannot exceed 1000 characters' })
  readonly context?: string;
}
