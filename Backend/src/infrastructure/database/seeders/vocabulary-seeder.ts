import { DataSource } from 'typeorm';
import { Chapter } from '../../../domain/entities/chapter.entity';
import { ChapterLevel } from '../../../domain/enums/chapter-level.enum';
import {
  VocabularyItem,
  VocabularyItemType,
  VocabularyDifficulty,
} from '../../../domain/entities/vocabulary-item.entity';

export class VocabularySeeder {
  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting vocabulary seeder...');

    const chapterRepository = this.dataSource.getRepository(Chapter);
    const vocabularyRepository = this.dataSource.getRepository(VocabularyItem);

    // Verificar si ya existen capítulos
    const existingChapters = await chapterRepository.count();
    if (existingChapters > 0) {
      console.log('⚠️  Chapters already exist. Skipping seeder...');
      return;
    }

    // Crear capítulos
    const chaptersData: Array<Partial<Chapter>> = [
      {
        title: 'Basic Greetings',
        level: ChapterLevel.BASIC,
        order: 1,
        isUnlocked: true,
        description: 'Learn common greetings and introductions in English',
        imageUrl: null,
        metadata: {
          estimatedTime: '15 minutes',
          difficulty: 'beginner',
        },
      },
      {
        title: 'Numbers and Colors',
        level: ChapterLevel.BASIC,
        order: 2,
        isUnlocked: false,
        description: 'Master numbers from 1-100 and basic colors',
        imageUrl: null,
        metadata: {
          estimatedTime: '20 minutes',
          difficulty: 'beginner',
        },
      },
      {
        title: 'Common Verbs',
        level: ChapterLevel.BASIC,
        order: 3,
        isUnlocked: false,
        description: 'Essential verbs for daily communication',
        imageUrl: null,
        metadata: {
          estimatedTime: '25 minutes',
          difficulty: 'beginner',
        },
      },
      {
        title: 'Family and Relationships',
        level: ChapterLevel.INTERMEDIATE,
        order: 4,
        isUnlocked: false,
        description: 'Vocabulary about family members and relationships',
        imageUrl: null,
        metadata: {
          estimatedTime: '20 minutes',
          difficulty: 'intermediate',
        },
      },
      {
        title: 'Tech Vocabulary',
        level: ChapterLevel.INTERMEDIATE,
        order: 5,
        isUnlocked: false,
        description: 'Technology-related terms for developers',
        imageUrl: null,
        metadata: {
          estimatedTime: '30 minutes',
          difficulty: 'intermediate',
        },
      },
      {
        title: 'Business English',
        level: ChapterLevel.ADVANCED,
        order: 6,
        isUnlocked: false,
        description: 'Professional vocabulary for business contexts',
        imageUrl: null,
        metadata: {
          estimatedTime: '35 minutes',
          difficulty: 'advanced',
        },
      },
      {
        title: 'Idioms and Expressions',
        level: ChapterLevel.ADVANCED,
        order: 7,
        isUnlocked: false,
        description: 'Common English idioms and expressions',
        imageUrl: null,
        metadata: {
          estimatedTime: '30 minutes',
          difficulty: 'advanced',
        },
      },
      {
        title: 'Food and Cooking',
        level: ChapterLevel.BASIC,
        order: 8,
        isUnlocked: false,
        description: 'Vocabulary about food, drinks, and cooking',
        imageUrl: null,
        metadata: {
          estimatedTime: '25 minutes',
          difficulty: 'beginner',
        },
      },
      {
        title: 'Travel and Tourism',
        level: ChapterLevel.INTERMEDIATE,
        order: 9,
        isUnlocked: false,
        description: 'Essential vocabulary for travelers',
        imageUrl: null,
        metadata: {
          estimatedTime: '30 minutes',
          difficulty: 'intermediate',
        },
      },
      {
        title: 'Academic English',
        level: ChapterLevel.ADVANCED,
        order: 10,
        isUnlocked: false,
        description: 'Advanced vocabulary for academic writing and research',
        imageUrl: null,
        metadata: {
          estimatedTime: '40 minutes',
          difficulty: 'advanced',
        },
      },
    ];

    console.log('📚 Creating chapters...');
    const chapters = await chapterRepository.save(chapterRepository.create(chaptersData));
    console.log(`✅ Created ${chapters.length} chapters`);

    // Vocabulario por capítulo
    const vocabularyData: { [key: number]: Array<Partial<VocabularyItem>> } = {
      // Chapter 1: Basic Greetings
      1: [
        {
          englishTerm: 'Hello',
          spanishTranslation: 'Hola',
          type: VocabularyItemType.WORD,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'A greeting used when meeting someone',
          exampleSentence: 'Hello, how are you today?',
          exampleTranslation: '¿Hola, cómo estás hoy?',
          pronunciation: '/həˈloʊ/',
          tags: ['greeting', 'basic'],
        },
        {
          englishTerm: 'Good morning',
          spanishTranslation: 'Buenos días',
          type: VocabularyItemType.PHRASE,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'A greeting used in the morning',
          exampleSentence: 'Good morning! Did you sleep well?',
          exampleTranslation: '¡Buenos días! ¿Dormiste bien?',
          pronunciation: '/ɡʊd ˈmɔːrnɪŋ/',
          tags: ['greeting', 'time'],
        },
        {
          englishTerm: 'Goodbye',
          spanishTranslation: 'Adiós',
          type: VocabularyItemType.WORD,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'A farewell expression',
          exampleSentence: 'Goodbye! See you tomorrow.',
          exampleTranslation: '¡Adiós! Te veo mañana.',
          pronunciation: '/ɡʊdˈbaɪ/',
          tags: ['farewell', 'basic'],
        },
        {
          englishTerm: 'Thank you',
          spanishTranslation: 'Gracias',
          type: VocabularyItemType.PHRASE,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'Expression of gratitude',
          exampleSentence: 'Thank you for your help!',
          exampleTranslation: '¡Gracias por tu ayuda!',
          pronunciation: '/θæŋk juː/',
          tags: ['politeness', 'gratitude'],
        },
        {
          englishTerm: 'Please',
          spanishTranslation: 'Por favor',
          type: VocabularyItemType.WORD,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'Polite request word',
          exampleSentence: 'Can you help me, please?',
          exampleTranslation: '¿Puedes ayudarme, por favor?',
          pronunciation: '/pliːz/',
          tags: ['politeness', 'request'],
        },
        {
          englishTerm: "You're welcome",
          spanishTranslation: 'De nada',
          type: VocabularyItemType.PHRASE,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'Response to thank you',
          exampleSentence: "You're welcome, anytime!",
          exampleTranslation: 'De nada, ¡cuando quieras!',
          pronunciation: '/jʊr ˈwɛlkəm/',
          tags: ['politeness', 'response'],
        },
        {
          englishTerm: 'How are you?',
          spanishTranslation: '¿Cómo estás?',
          type: VocabularyItemType.PHRASE,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'Common greeting question',
          exampleSentence: 'Hi Sarah, how are you?',
          exampleTranslation: 'Hola Sarah, ¿cómo estás?',
          pronunciation: '/haʊ ɑːr juː/',
          tags: ['greeting', 'question'],
        },
        {
          englishTerm: 'Nice to meet you',
          spanishTranslation: 'Mucho gusto',
          type: VocabularyItemType.EXPRESSION,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'Polite expression when meeting someone for the first time',
          exampleSentence: 'Nice to meet you, John!',
          exampleTranslation: '¡Mucho gusto, John!',
          pronunciation: '/naɪs tə miːt juː/',
          tags: ['introduction', 'politeness'],
        },
        {
          englishTerm: 'Excuse me',
          spanishTranslation: 'Disculpe / Perdón',
          type: VocabularyItemType.PHRASE,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'Polite expression to get attention or apologize',
          exampleSentence: 'Excuse me, where is the restroom?',
          exampleTranslation: 'Disculpe, ¿dónde está el baño?',
          pronunciation: '/ɪkˈskjuːz miː/',
          tags: ['politeness', 'apology'],
        },
        {
          englishTerm: 'See you later',
          spanishTranslation: 'Hasta luego',
          type: VocabularyItemType.PHRASE,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'Informal goodbye expression',
          exampleSentence: 'See you later, have a great day!',
          exampleTranslation: '¡Hasta luego, que tengas un gran día!',
          pronunciation: '/siː juː ˈleɪtər/',
          tags: ['farewell', 'informal'],
        },
      ],
      // Chapter 2: Numbers and Colors (10 items)
      2: [
        {
          englishTerm: 'One',
          spanishTranslation: 'Uno',
          type: VocabularyItemType.WORD,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'The number 1',
          exampleSentence: 'I have one apple.',
          exampleTranslation: 'Tengo una manzana.',
          pronunciation: '/wʌn/',
          tags: ['number', 'basic'],
        },
        {
          englishTerm: 'Red',
          spanishTranslation: 'Rojo',
          type: VocabularyItemType.WORD,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'The color of blood',
          exampleSentence: 'The car is red.',
          exampleTranslation: 'El carro es rojo.',
          pronunciation: '/rɛd/',
          tags: ['color', 'basic'],
        },
        {
          englishTerm: 'Blue',
          spanishTranslation: 'Azul',
          type: VocabularyItemType.WORD,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'The color of the sky',
          exampleSentence: 'The sky is blue.',
          exampleTranslation: 'El cielo es azul.',
          pronunciation: '/bluː/',
          tags: ['color', 'basic'],
        },
        {
          englishTerm: 'Ten',
          spanishTranslation: 'Diez',
          type: VocabularyItemType.WORD,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'The number 10',
          exampleSentence: 'I have ten fingers.',
          exampleTranslation: 'Tengo diez dedos.',
          pronunciation: '/tɛn/',
          tags: ['number', 'basic'],
        },
        {
          englishTerm: 'Green',
          spanishTranslation: 'Verde',
          type: VocabularyItemType.WORD,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'The color of grass',
          exampleSentence: 'The grass is green.',
          exampleTranslation: 'El pasto es verde.',
          pronunciation: '/ɡriːn/',
          tags: ['color', 'nature'],
        },
        {
          englishTerm: 'Twenty',
          spanishTranslation: 'Veinte',
          type: VocabularyItemType.WORD,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'The number 20',
          exampleSentence: 'She is twenty years old.',
          exampleTranslation: 'Ella tiene veinte años.',
          pronunciation: '/ˈtwɛnti/',
          tags: ['number', 'basic'],
        },
        {
          englishTerm: 'Yellow',
          spanishTranslation: 'Amarillo',
          type: VocabularyItemType.WORD,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'The color of the sun',
          exampleSentence: 'The sun is yellow.',
          exampleTranslation: 'El sol es amarillo.',
          pronunciation: '/ˈjɛloʊ/',
          tags: ['color', 'basic'],
        },
        {
          englishTerm: 'Hundred',
          spanishTranslation: 'Cien',
          type: VocabularyItemType.WORD,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'The number 100',
          exampleSentence: 'One hundred people came to the party.',
          exampleTranslation: 'Cien personas vinieron a la fiesta.',
          pronunciation: '/ˈhʌndrəd/',
          tags: ['number', 'large'],
        },
        {
          englishTerm: 'Black',
          spanishTranslation: 'Negro',
          type: VocabularyItemType.WORD,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'The darkest color',
          exampleSentence: 'My cat is black.',
          exampleTranslation: 'Mi gato es negro.',
          pronunciation: '/blæk/',
          tags: ['color', 'basic'],
        },
        {
          englishTerm: 'White',
          spanishTranslation: 'Blanco',
          type: VocabularyItemType.WORD,
          difficulty: VocabularyDifficulty.EASY,
          definition: 'The color of snow',
          exampleSentence: 'The snow is white.',
          exampleTranslation: 'La nieve es blanca.',
          pronunciation: '/waɪt/',
          tags: ['color', 'basic'],
        },
      ],
    };

    console.log('📝 Creating vocabulary items...');
    let totalVocabulary = 0;

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const vocabItems = vocabularyData[i + 1] || [];

      if (vocabItems.length > 0) {
        const vocabularyWithChapter = vocabItems.map(item => ({
          ...item,
          chapterId: chapter.id,
          isActive: true,
        }));

        await vocabularyRepository.save(vocabularyRepository.create(vocabularyWithChapter));

        totalVocabulary += vocabItems.length;
        console.log(`  ✅ Added ${vocabItems.length} vocabulary items to "${chapter.title}"`);
      }
    }

    console.log(
      `\n🎉 Seeding completed! Created ${chapters.length} chapters with ${totalVocabulary} vocabulary items`,
    );
  }

  async run(): Promise<void> {
    try {
      await this.seed();
    } catch (error) {
      console.error('❌ Error running vocabulary seeder:', error);
      throw error;
    }
  }
}
