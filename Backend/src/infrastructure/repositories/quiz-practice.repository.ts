import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizPractice } from '../../domain/entities/quiz-practice.entity';
import { IQuizPracticeRepository } from '../../application/interfaces/repositories/quiz-practice-repository.interface';

@Injectable()
export class QuizPracticeRepository implements IQuizPracticeRepository {
  constructor(
    @InjectRepository(QuizPractice)
    private readonly repository: Repository<QuizPractice>,
  ) {}

  async create(quizPractice: QuizPractice): Promise<QuizPractice> {
    return await this.repository.save(quizPractice);
  }

  async findById(id: string): Promise<QuizPractice | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['practiceSession', 'practiceSession.chapter'],
    });
  }

  async findByPracticeSessionId(practiceSessionId: string): Promise<QuizPractice | null> {
    return await this.repository.findOne({
      where: { practiceSession: { id: practiceSessionId } },
      relations: ['practiceSession', 'practiceSession.chapter'],
    });
  }

  async findByUserId(userId: string, limit = 10, offset = 0): Promise<QuizPractice[]> {
    return await this.repository.find({
      where: { practiceSession: { userId } },
      relations: ['practiceSession', 'practiceSession.chapter'],
      order: { practiceSession: { createdAt: 'DESC' } },
      take: limit,
      skip: offset,
    });
  }

  async findByUserIdAndCategory(
    userId: string,
    category: string,
    limit = 10,
    offset = 0,
  ): Promise<QuizPractice[]> {
    return await this.repository.find({
      where: {
        practiceSession: { userId },
        quizCategory: category,
      },
      relations: ['practiceSession', 'practiceSession.chapter'],
      order: { practiceSession: { createdAt: 'DESC' } },
      take: limit,
      skip: offset,
    });
  }

  async findByUserIdAndDifficulty(
    userId: string,
    difficulty: string,
    limit = 10,
    offset = 0,
  ): Promise<QuizPractice[]> {
    return await this.repository.find({
      where: {
        practiceSession: { userId },
        difficultyLevel: difficulty,
      },
      relations: ['practiceSession', 'practiceSession.chapter'],
      order: { practiceSession: { createdAt: 'DESC' } },
      take: limit,
      skip: offset,
    });
  }

  async update(id: string, updates: Partial<QuizPractice>): Promise<QuizPractice> {
    // Exclude relation properties from updates to avoid TypeORM issues
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { practiceSession, ...updateData } = updates;
    await this.repository.update(id, updateData);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Quiz practice not found after update');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getStatsByUserId(userId: string): Promise<{
    totalSessions: number;
    totalQuestions: number;
    totalCorrectAnswers: number;
    averageAccuracy: number;
    averageTimePerQuestion: number;
    categoriesPlayed: string[];
  }> {
    const practices = await this.repository.find({
      where: { practiceSession: { userId } },
      relations: ['practiceSession'],
    });

    if (practices.length === 0) {
      return {
        totalSessions: 0,
        totalQuestions: 0,
        totalCorrectAnswers: 0,
        averageAccuracy: 0,
        averageTimePerQuestion: 0,
        categoriesPlayed: [],
      };
    }

    const totalSessions = practices.length;
    const totalQuestions = practices.reduce((sum, p) => sum + p.questionsAnswered, 0);
    const totalCorrectAnswers = practices.reduce((sum, p) => sum + p.correctAnswers, 0);
    const averageAccuracy =
      totalQuestions > 0 ? Math.round((totalCorrectAnswers / totalQuestions) * 100) : 0;

    const totalTimeSpent = practices.reduce((sum, p) => sum + (p.averageTimePerQuestion || 0), 0);
    const averageTimePerQuestion = practices.length > 0 ? totalTimeSpent / practices.length : 0;

    const categoriesPlayed = Array.from(
      new Set(
        practices
          .map(p => p.quizCategory)
          .filter((category): category is string => Boolean(category)),
      ),
    );

    return {
      totalSessions,
      totalQuestions,
      totalCorrectAnswers,
      averageAccuracy,
      averageTimePerQuestion,
      categoriesPlayed,
    };
  }

  async getAvailableCategories(): Promise<
    Array<{
      category: string;
      displayName: string;
      description: string;
      totalQuizzes: number;
    }>
  > {
    // This would typically come from a categories table or configuration
    // For now, we'll return some predefined categories
    const categories = [
      {
        category: 'grammar',
        displayName: 'Grammar',
        description: 'Test your English grammar knowledge',
        totalQuizzes: 0,
      },
      {
        category: 'vocabulary',
        displayName: 'Vocabulary',
        description: 'Expand your vocabulary with word quizzes',
        totalQuizzes: 0,
      },
      {
        category: 'listening',
        displayName: 'Listening',
        description: 'Improve your listening comprehension',
        totalQuizzes: 0,
      },
      {
        category: 'reading',
        displayName: 'Reading',
        description: 'Test your reading comprehension skills',
        totalQuizzes: 0,
      },
      {
        category: 'mixed',
        displayName: 'Mixed',
        description: 'A combination of different English skills',
        totalQuizzes: 0,
      },
    ];

    // Count actual quizzes for each category
    for (const category of categories) {
      const count = await this.repository.count({
        where: { quizCategory: category.category },
      });
      category.totalQuizzes = count;
    }

    return categories;
  }
}
