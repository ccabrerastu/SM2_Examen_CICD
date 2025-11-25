import { DataSource } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { DailyLives } from '../../../domain/entities/daily-lives.entity';

export class LivesSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting lives seeder...');

    const userRepository = this.dataSource.getRepository(User);
    const livesRepository = this.dataSource.getRepository(DailyLives);

    // Get all users
    const users = await userRepository.find();

    if (users.length === 0) {
      console.log('⚠️  No users found. Please create users first.');
      return;
    }

    console.log(`📊 Found ${users.length} users`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Check if user already has lives for today
      const today = new Date().toISOString().split('T')[0];
      const existingLives = await livesRepository.findOne({
        where: {
          userId: user.id,
        },
      });

      if (existingLives) {
        // Check if lives need reset
        // Handle both Date object and string format
        const lastResetDateObj =
          existingLives.lastResetDate instanceof Date
            ? existingLives.lastResetDate
            : new Date(existingLives.lastResetDate);

        const lastResetDate = lastResetDateObj.toISOString().split('T')[0];

        if (lastResetDate !== today) {
          // Reset lives for new day
          existingLives.currentLives = 5;
          existingLives.lastResetDate = new Date();
          await livesRepository.save(existingLives);
          updatedCount++;
          console.log(`  ♻️  Reset lives for user: ${user.email} (5 lives)`);
        } else if (existingLives.currentLives < 5) {
          // Restore lives to full
          existingLives.currentLives = 5;
          await livesRepository.save(existingLives);
          updatedCount++;
          console.log(
            `  🔄 Restored lives for user: ${user.email} (${existingLives.currentLives} → 5 lives)`,
          );
        } else {
          skippedCount++;
          console.log(`  ⏭️  User ${user.email} already has 5 lives for today`);
        }
      } else {
        // Create new lives entry
        const newLives = livesRepository.create({
          userId: user.id,
          currentLives: 5,
          lastResetDate: new Date(),
        });

        await livesRepository.save(newLives);
        createdCount++;
        console.log(`  ✅ Created lives for user: ${user.email} (5 lives)`);
      }
    }

    console.log(`\n📈 Lives seeder summary:`);
    console.log(`  - Created: ${createdCount} new entries`);
    console.log(`  - Updated: ${updatedCount} existing entries`);
    console.log(`  - Skipped: ${skippedCount} (already have 5 lives)`);
    console.log(`  - Total users processed: ${users.length}`);
    console.log('🎉 Lives seeding completed!\n');
  }

  async run(): Promise<void> {
    try {
      await this.seed();
    } catch (error) {
      console.error('❌ Error running lives seeder:', error);
      throw error;
    }
  }
}
