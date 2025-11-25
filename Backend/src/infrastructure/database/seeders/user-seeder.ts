import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../../domain/entities/user.entity';
import { Person } from '../../../domain/entities/person.entity';

export class UserSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting user seeder...');

    const userRepository = this.dataSource.getRepository(User);
    const personRepository = this.dataSource.getRepository(Person);

    // Check if test user already exists
    const existingUser = await userRepository.findOne({
      where: { email: 'test@test.com' },
    });

    if (existingUser) {
      console.log('⚠️  Test user already exists. Skipping user seeder...');
      return;
    }

    // Create person
    const person = personRepository.create({
      fullName: 'Test User',
    });

    const savedPerson = await personRepository.save(person);
    console.log('  ✅ Created person: Test User');

    // Hash password
    const hashedPassword = await bcrypt.hash('MySecurePassword', 12);

    // Create user
    const user = userRepository.create({
      email: 'test@test.com',
      password: hashedPassword,
      authProvider: 'EMAIL_PASSWORD',
      role: 'STUDENT',
      isActive: true,
      isEmailVerified: true,
      personId: savedPerson.id,
    });

    await userRepository.save(user);
    console.log('  ✅ Created user: test@test.com (password: MySecurePassword)');

    console.log('\n🎉 User seeding completed!\n');
  }

  async run(): Promise<void> {
    try {
      await this.seed();
    } catch (error) {
      console.error('❌ Error running user seeder:', error);
      throw error;
    }
  }
}
