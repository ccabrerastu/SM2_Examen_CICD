import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserSeeder } from './user-seeder';
import { LivesSeeder } from './lives-seeder';
import { User } from '../../../domain/entities/user.entity';
import { Person } from '../../../domain/entities/person.entity';
import { DailyLives } from '../../../domain/entities/daily-lives.entity';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { UserProgress } from '../../../domain/entities/user-progress.entity';
import { Chapter } from '../../../domain/entities/chapter.entity';
import { VocabularyItem } from '../../../domain/entities/vocabulary-item.entity';
import { ReadingChapter } from '../../../domain/entities/reading-chapter.entity';
import { ReadingContent } from '../../../domain/entities/reading-content.entity';
import { QuizQuestion } from '../../../domain/entities/quiz-question.entity';

// Load environment variables
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'english_app_backend',
  entities: [
    User,
    Person,
    DailyLives,
    RefreshToken,
    UserProgress,
    Chapter,
    VocabularyItem,
    ReadingChapter,
    ReadingContent,
    QuizQuestion,
  ],
  synchronize: false,
  logging: false,
});

async function runLivesSeeder() {
  console.log('🚀 Initializing database connection...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    // Run user seeder first
    const userSeeder = new UserSeeder(AppDataSource);
    await userSeeder.run();

    // Then run lives seeder
    const livesSeeder = new LivesSeeder(AppDataSource);
    await livesSeeder.run();

    console.log('✨ All seeders completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

runLivesSeeder();
