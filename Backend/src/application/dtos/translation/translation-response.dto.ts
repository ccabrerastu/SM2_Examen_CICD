import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TranslationResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the translation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'Original text that was translated',
    example: 'Hello, how are you?',
  })
  readonly originalText!: string;

  @ApiProperty({
    description: 'Translated text',
    example: 'Hola, ¿cómo estás?',
  })
  readonly translatedText!: string;

  @ApiProperty({
    description: 'Source language code',
    example: 'en',
  })
  readonly sourceLanguage!: string;

  @ApiProperty({
    description: 'Target language code',
    example: 'es',
  })
  readonly targetLanguage!: string;

  @ApiPropertyOptional({
    description: 'Phonetic pronunciation of the translated text',
    example: 'ˈoʊlə, ˈkoʊmoʊ ɛsˈtɑs',
  })
  readonly pronunciation?: string | null;

  @ApiPropertyOptional({
    description: 'Example sentences using the translated text',
    example: ['Hola, ¿cómo estás hoy?', 'Hola, ¿cómo estás después del trabajo?'],
    type: [String],
  })
  readonly examples?: string[];

  @ApiPropertyOptional({
    description: 'URL to audio pronunciation file',
    example: 'https://api.example.com/audio/pronunciation/123.mp3',
  })
  readonly audioUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Definition or explanation of the translated text',
    example: "A common greeting used to ask about someone's well-being",
  })
  readonly definition?: string | null;

  @ApiPropertyOptional({
    description: 'Context provided for the translation',
    example: 'This is a greeting in a formal business context',
  })
  readonly context?: string | null;

  @ApiProperty({
    description: 'Timestamp when the translation was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  readonly createdAt!: string;

  @ApiPropertyOptional({
    description: 'Timestamp when the translation expires (for caching)',
    example: '2024-02-15T10:30:00.000Z',
  })
  readonly expiresAt?: string | null;
}
