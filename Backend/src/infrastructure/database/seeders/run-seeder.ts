import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { VocabularySeeder } from './vocabulary-seeder';
import { ReadingSeeder } from './reading-seeder';
import { UserSeeder } from './user-seeder';
import { LivesSeeder } from './lives-seeder';
import { InterviewSeeder } from './interview-seeder';

// Load environment variables
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'english_app_backend',
  entities: ['src/domain/entities/*.entity.ts'],
  synchronize: false,
  logging: false,
});

async function runSeeder() {
  console.log('🚀 Initializing database connection...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    console.log('📦 Running all seeders in sequence...\n');

    // 1. Vocabulary Seeder
    console.log('1️⃣  Running Vocabulary Seeder...');
    const vocabularySeeder = new VocabularySeeder(AppDataSource);
    await vocabularySeeder.run();

    // 2. Reading Seeder
    console.log('2️⃣  Running Reading Seeder...');
    const readingSeeder = new ReadingSeeder(AppDataSource);
    await readingSeeder.run();

    // 3. User Seeder (must run before Lives)
    console.log('3️⃣  Running User Seeder...');
    const userSeeder = new UserSeeder(AppDataSource);
    await userSeeder.run();

    // 4. Lives Seeder (depends on User)
    console.log('4️⃣  Running Lives Seeder...');
    const livesSeeder = new LivesSeeder(AppDataSource);
    await livesSeeder.run();

    // 5. Interview Seeder
    console.log('5️⃣  Running Interview Seeder...');
    const interviewSeeder = new InterviewSeeder(AppDataSource);
    await interviewSeeder.seed();

    console.log('\n' + '='.repeat(60));
    console.log('✨ SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Vocabulary chapters and items created');
    console.log('✅ Reading chapters and content created');
    console.log('✅ Test user created (test@test.com / MySecurePassword)');
    console.log('✅ Daily lives assigned to test user');
    console.log('✅ Interview topics and questions created');
    console.log('='.repeat(60) + '\n');
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

runSeeder();
