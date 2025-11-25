import { ApiProperty } from '@nestjs/swagger';

export class VocabularyItemDto {
  @ApiProperty({
    description: 'Vocabulary item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'English term',
    example: 'Apple',
  })
  englishTerm!: string;

  @ApiProperty({
    description: 'Spanish translation',
    example: 'Manzana',
  })
  spanishTranslation!: string;

  @ApiProperty({
    description: 'Word type (noun, verb, adjective, etc.)',
    example: 'noun',
    required: false,
  })
  type?: string;

  @ApiProperty({
    description: 'Difficulty level',
    example: 'basic',
    required: false,
  })
  difficulty?: string;

  @ApiProperty({
    description: 'Definition in English',
    example: 'A round fruit with red, green, or yellow skin',
    required: false,
  })
  definition?: string;

  @ApiProperty({
    description: 'Example sentence',
    example: 'I eat an apple every day',
    required: false,
  })
  exampleSentence?: string;

  @ApiProperty({
    description: 'Pronunciation guide',
    example: '/ˈæp.əl/',
    required: false,
  })
  pronunciation?: string;

  @ApiProperty({
    description: 'Audio URL',
    example: 'https://example.com/audio/apple.mp3',
    required: false,
  })
  audioUrl?: string;
}

export class VocabularyItemsDataDto {
  @ApiProperty({
    description: 'Array of vocabulary items',
    type: [VocabularyItemDto],
  })
  items!: VocabularyItemDto[];

  @ApiProperty({
    description: 'Total number of items in the chapter',
    example: 15,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 2,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage!: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPreviousPage!: boolean;
}

export class VocabularyItemsResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Vocabulary items data',
    type: () => VocabularyItemsDataDto,
  })
  data!: VocabularyItemsDataDto;

  @ApiProperty({
    description: 'Response message',
    example: 'Vocabulary items retrieved successfully',
  })
  message!: string;
}
