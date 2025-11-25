import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { seedInterviews } from './interview-seeder';

async function runInterviewSeeder() {
  console.log('🚀 Starting Interview Seeder...\n');

  const dataSource = AppDataSource;

  try {
    // Initialize connection
    console.log('📡 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    // Run seeder
    await seedInterviews(dataSource);

    console.log('\n✅ Interview seeder completed successfully!');
  } catch (error) {
    console.error('❌ Error running interview seeder:', error);
    throw error;
  } finally {
    // Close connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('📡 Database connection closed');
    }
  }
}

// Run the seeder
runInterviewSeeder()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Seeder failed:', error);
    process.exit(1);
  });
