import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ReadingContentRepository } from '../../../infrastructure/repositories/reading-content.repository';
import { QuizQuestionDto } from '../../dtos/reading/quiz-question-response.dto';

@Injectable()
export class GetQuizQuestionsUseCase {
  private readonly logger = new Logger(GetQuizQuestionsUseCase.name);

  constructor(private readonly readingContentRepository: ReadingContentRepository) {}

  async execute(readingChapterId: string): Promise<{
    questions: QuizQuestionDto[];
    totalQuestions: number;
  }> {
    this.logger.log(`Getting quiz questions for reading chapter: ${readingChapterId}`);

    const content = await this.readingContentRepository.findByReadingChapterId(readingChapterId);

    if (!content) {
      throw new NotFoundException(`Reading content not found for chapter: ${readingChapterId}`);
    }

    const questions: QuizQuestionDto[] = content.quizQuestions
      .sort((a, b) => a.order - b.order)
      .map(q => ({
        id: q.id,
        readingContentId: q.readingContentId,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        hint: q.hint,
        order: q.order,
        hasExplanation: q.hasExplanation(),
      }));

    return {
      questions,
      totalQuestions: questions.length,
    };
  }
}
