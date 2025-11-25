import { DataSource } from 'typeorm';
import AppDataSource from '../../../../ormconfig';
import { ReadingSeeder } from './reading-seeder';

async function runSeeder() {
  console.log('📚 Initializing Reading Seeder...\n');

  let dataSource: DataSource | null = null;

  try {
    // Initialize database connection
    console.log('🔌 Connecting to database...');
    dataSource = await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    // Run seeder
    const seeder = new ReadingSeeder(dataSource);
    await seeder.seed();

    console.log('\n🎉 Reading seeder completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running reading seeder:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// Execute seeder
runSeeder();
