import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InterviewTopicRepository } from '../../../infrastructure/repositories/interview-topic.repository';
import { InterviewQuestionRepository } from '../../../infrastructure/repositories/interview-question.repository';
import { InterviewSessionRepository } from '../../../infrastructure/repositories/interview-session.repository';
import { AIEvaluationService } from './ai-evaluation.service';
import { InterviewSession, InterviewStatus } from '../../../domain/entities/interview-session.entity';
import {
  InterviewTopicDto,
  GetTopicsResponseDto,
  StartInterviewSessionDto,
  StartInterviewSessionResponseDto,
  InterviewQuestionInSessionDto,
  SubmitAnswerDto,
  SubmitAnswerResponseDto,
  AnswerEvaluationDto,
  GetSessionScoreResponseDto,
  SessionScoreBreakdownDto,
  QuestionAnswerSummaryDto,
} from '../../dtos/interview';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    private readonly topicRepository: InterviewTopicRepository,
    private readonly questionRepository: InterviewQuestionRepository,
    private readonly sessionRepository: InterviewSessionRepository,
    private readonly aiEvaluationService: AIEvaluationService,
  ) {}

  /**
   * Get all available interview topics
   */
  async getAvailableTopics(): Promise<GetTopicsResponseDto> {
    this.logger.log('Fetching available interview topics');

    const topics = await this.topicRepository.findAllActive();

    const topicDtos: InterviewTopicDto[] = topics.map(topic => ({
      id: topic.id,
      name: topic.name,
      ...(topic.description !== undefined && { description: topic.description }),
      category: topic.category,
      difficulty: topic.difficulty,
      ...(topic.iconName !== undefined && { iconName: topic.iconName }),
      ...(topic.iconUrl !== undefined && { iconUrl: topic.iconUrl }),
      isActive: topic.isActive,
      order: topic.order,
      estimatedDurationMinutes: topic.estimatedDurationMinutes,
      totalQuestions: topic.getTotalQuestions(),
    }));

    return {
      success: true,
      topics: topicDtos,
      totalTopics: topicDtos.length,
    };
  }

  /**
   * Start a new interview session
   */
  async startInterviewSession(
    userId: string,
    dto: StartInterviewSessionDto,
  ): Promise<StartInterviewSessionResponseDto> {
    this.logger.log(`Starting interview session for user ${userId}, topic ${dto.topicId}`);

    // Check if user has an active session for this topic
    const existingSession = await this.sessionRepository.findActiveSessionByUserAndTopic(userId, dto.topicId);
    if (existingSession) {
      throw new BadRequestException(
        'You already have an active interview session for this topic. Please complete or abandon it first.',
      );
    }

    // Get topic with questions
    const topic = await this.topicRepository.findActiveQuestionsForTopic(dto.topicId);
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${dto.topicId} not found or inactive`);
    }

    if (!topic.questions || topic.questions.length === 0) {
      throw new BadRequestException('This topic has no active questions available');
    }

    // Filter active questions and sort by order
    const activeQuestions = topic.questions.filter(q => q.isActive).sort((a, b) => a.order - b.order);

    // Create new session
    const session = InterviewSession.createSession(userId, dto.topicId);
    session.start(activeQuestions.length);

    const savedSession = await this.sessionRepository.create(session);

    // Map questions to DTOs
    const questionDtos: InterviewQuestionInSessionDto[] = activeQuestions.map(q => ({
      id: q.id,
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      categoryLabel: q.getCategoryLabel(),
      minimumAnswerLength: q.minimumAnswerLength,
      recommendedTimeSeconds: q.recommendedTimeSeconds,
      order: q.order,
      ...(q.sampleAnswers !== undefined && { sampleAnswers: q.sampleAnswers }),
    }));

    this.logger.log(`Interview session ${savedSession.id} started successfully`);

    return {
      sessionId: savedSession.id,
      topicId: topic.id,
      topicName: topic.name,
      totalQuestions: activeQuestions.length,
      estimatedDurationMinutes: topic.estimatedDurationMinutes,
      questions: questionDtos,
      startedAt: savedSession.startedAt!,
    };
  }

  /**
   * Submit an answer and get evaluation
   */
  async submitAnswer(userId: string, dto: SubmitAnswerDto): Promise<SubmitAnswerResponseDto> {
    this.logger.log(`Submitting answer for session ${dto.sessionId}, question ${dto.questionId}`);

    // Get session
    const session = await this.sessionRepository.findByIdSimple(dto.sessionId);
    if (!session) {
      throw new NotFoundException(`Session with ID ${dto.sessionId} not found`);
    }

    // Verify session belongs to user
    if (session.userId !== userId) {
      throw new BadRequestException('This session does not belong to you');
    }

    // Verify session is in progress
    if (session.status !== InterviewStatus.IN_PROGRESS) {
      throw new BadRequestException('This session is not in progress');
    }

    // Get question details
    const question = await this.questionRepository.findById(dto.questionId);
    if (!question) {
      throw new NotFoundException(`Question with ID ${dto.questionId} not found`);
    }

    // Verify question belongs to session's topic
    if (question.topicId !== session.topicId) {
      throw new BadRequestException('This question does not belong to the session topic');
    }

    // Evaluate answer using AI service (placeholder)
    const evaluation = await this.aiEvaluationService.evaluateAnswer(
      question,
      dto.answerText,
      dto.timeSpentSeconds,
    );

    // Submit answer to session
    session.submitAnswer(evaluation);

    // Save updated session
    const updatedSession = await this.sessionRepository.update(session);

    // Prepare response
    const evaluationDto: AnswerEvaluationDto = {
      questionId: evaluation.questionId,
      questionText: evaluation.questionText,
      answerText: evaluation.answerText,
      answerLength: evaluation.answerLength,
      submittedAt: evaluation.submittedAt,
      ...(evaluation.fluencyScore !== undefined && { fluencyScore: evaluation.fluencyScore }),
      ...(evaluation.grammarScore !== undefined && { grammarScore: evaluation.grammarScore }),
      ...(evaluation.vocabularyScore !== undefined && { vocabularyScore: evaluation.vocabularyScore }),
      ...(evaluation.pronunciationScore !== undefined && { pronunciationScore: evaluation.pronunciationScore }),
      ...(evaluation.coherenceScore !== undefined && { coherenceScore: evaluation.coherenceScore }),
      ...(evaluation.overallQuestionScore !== undefined && { overallQuestionScore: evaluation.overallQuestionScore }),
      ...(evaluation.aiFeedback !== undefined && { aiFeedback: evaluation.aiFeedback }),
      ...(evaluation.detectedIssues !== undefined && { detectedIssues: evaluation.detectedIssues }),
      ...(evaluation.suggestedImprovements !== undefined && { suggestedImprovements: evaluation.suggestedImprovements }),
      ...(evaluation.timeSpentSeconds !== undefined && { timeSpentSeconds: evaluation.timeSpentSeconds }),
      ...(evaluation.attemptNumber !== undefined && { attemptNumber: evaluation.attemptNumber }),
    };

    // Get next question if not completed
    let nextQuestion: { questionId: string; questionText: string; category: string; difficulty: string } | undefined;

    if (!updatedSession.isCompleted()) {
      const questions = await this.questionRepository.findByTopicId(session.topicId);
      const nextQuestionEntity = questions[updatedSession.currentQuestionIndex];

      if (nextQuestionEntity) {
        nextQuestion = {
          questionId: nextQuestionEntity.id,
          questionText: nextQuestionEntity.question,
          category: nextQuestionEntity.category,
          difficulty: nextQuestionEntity.difficulty,
        };
      }
    }

    this.logger.log(
      `Answer submitted successfully. Session completed: ${updatedSession.isCompleted()}`,
    );

    return {
      success: true,
      evaluation: evaluationDto,
      currentQuestionIndex: updatedSession.currentQuestionIndex,
      questionsAnswered: updatedSession.questionsAnswered,
      totalQuestions: updatedSession.totalQuestions,
      isCompleted: updatedSession.isCompleted(),
      ...(nextQuestion !== undefined && { nextQuestion }),
    };
  }

  /**
   * Submit an audio answer and get evaluation
   */
  async submitAnswerAudio(
    userId: string,
    sessionId: string,
    questionId: string,
    audioBuffer: Buffer,
    timeSpentSeconds?: number,
  ): Promise<SubmitAnswerResponseDto> {
    this.logger.log(`Submitting audio answer for session ${sessionId}, question ${questionId}`);

    // Get session
    const session = await this.sessionRepository.findByIdSimple(sessionId);
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    // Verify session belongs to user
    if (session.userId !== userId) {
      throw new BadRequestException('This session does not belong to you');
    }

    // Verify session is in progress
    if (session.status !== InterviewStatus.IN_PROGRESS) {
      throw new BadRequestException('This session is not in progress');
    }

    // Get question details
    const question = await this.questionRepository.findById(questionId);
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // Verify question belongs to session's topic
    if (question.topicId !== session.topicId) {
      throw new BadRequestException('This question does not belong to the session topic');
    }

    // Evaluate audio answer using AI service
    const evaluation = await this.aiEvaluationService.evaluateAudioAnswer(
      question,
      audioBuffer,
      timeSpentSeconds,
    );

    // Submit answer to session
    session.submitAnswer(evaluation);

    // Save updated session
    const updatedSession = await this.sessionRepository.update(session);

    // Prepare response
    const evaluationDto: AnswerEvaluationDto = {
      questionId: evaluation.questionId,
      questionText: evaluation.questionText,
      answerText: evaluation.answerText,
      answerLength: evaluation.answerLength,
      submittedAt: evaluation.submittedAt,
      ...(evaluation.fluencyScore !== undefined && { fluencyScore: evaluation.fluencyScore }),
      ...(evaluation.grammarScore !== undefined && { grammarScore: evaluation.grammarScore }),
      ...(evaluation.vocabularyScore !== undefined && { vocabularyScore: evaluation.vocabularyScore }),
      ...(evaluation.pronunciationScore !== undefined && { pronunciationScore: evaluation.pronunciationScore }),
      ...(evaluation.coherenceScore !== undefined && { coherenceScore: evaluation.coherenceScore }),
      ...(evaluation.overallQuestionScore !== undefined && { overallQuestionScore: evaluation.overallQuestionScore }),
      ...(evaluation.aiFeedback !== undefined && { aiFeedback: evaluation.aiFeedback }),
      ...(evaluation.detectedIssues !== undefined && { detectedIssues: evaluation.detectedIssues }),
      ...(evaluation.suggestedImprovements !== undefined && { suggestedImprovements: evaluation.suggestedImprovements }),
      ...(evaluation.timeSpentSeconds !== undefined && { timeSpentSeconds: evaluation.timeSpentSeconds }),
      ...(evaluation.attemptNumber !== undefined && { attemptNumber: evaluation.attemptNumber }),
    };

    // Get next question if not completed
    let nextQuestion: { questionId: string; questionText: string; category: string; difficulty: string } | undefined;

    if (!updatedSession.isCompleted()) {
      const questions = await this.questionRepository.findByTopicId(session.topicId);
      const nextQuestionEntity = questions[updatedSession.currentQuestionIndex];

      if (nextQuestionEntity) {
        nextQuestion = {
          questionId: nextQuestionEntity.id,
          questionText: nextQuestionEntity.question,
          category: nextQuestionEntity.category,
          difficulty: nextQuestionEntity.difficulty,
        };
      }
    }

    this.logger.log(
      `Audio answer submitted successfully. Session completed: ${updatedSession.isCompleted()}`,
    );

    return {
      success: true,
      evaluation: evaluationDto,
      currentQuestionIndex: updatedSession.currentQuestionIndex,
      questionsAnswered: updatedSession.questionsAnswered,
      totalQuestions: updatedSession.totalQuestions,
      isCompleted: updatedSession.isCompleted(),
      ...(nextQuestion !== undefined && { nextQuestion }),
    };
  }

  /**
   * Get final session score and feedback
   */
  async getSessionScore(userId: string, sessionId: string): Promise<GetSessionScoreResponseDto> {
    this.logger.log(`Getting score for session ${sessionId}`);

    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    // Verify session belongs to user
    if (session.userId !== userId) {
      throw new BadRequestException('This session does not belong to you');
    }

    // Verify session is completed
    if (session.status !== InterviewStatus.COMPLETED) {
      throw new BadRequestException('This session is not yet completed');
    }

    // Build score breakdown
    const scoreBreakdown: SessionScoreBreakdownDto = {
      fluencyScore: session.fluencyScore,
      grammarScore: session.grammarScore,
      vocabularyScore: session.vocabularyScore,
      pronunciationScore: session.pronunciationScore,
      coherenceScore: session.coherenceScore,
      overallScore: session.overallScore,
    };

    // Build question summaries
    const questionSummaries: QuestionAnswerSummaryDto[] = session.answers.map(answer => ({
      questionId: answer.questionId,
      questionText: answer.questionText,
      category: 'general', // Could be extracted from question entity
      answerText: answer.answerText,
      score: answer.overallQuestionScore || 0,
      ...(answer.aiFeedback !== undefined && { feedback: answer.aiFeedback }),
    }));

    const passed = session.overallScore >= 70;

    return {
      sessionId: session.id,
      topicId: session.topicId,
      topicName: session.topic.name,
      status: session.status,
      scores: scoreBreakdown,
      passed,
      finalFeedback: session.finalFeedback || '',
      strengths: session.strengths || [],
      areasForImprovement: session.areasForImprovement || [],
      questionAnswers: questionSummaries,
      totalQuestions: session.totalQuestions,
      questionsAnswered: session.questionsAnswered,
      totalTimeSpentSeconds: session.getTotalTimeSpent(),
      startedAt: session.startedAt!,
      completedAt: session.completedAt!,
    };
  }

  /**
   * Abandon/cancel an active interview session
   */
  async abandonSession(userId: string, sessionId: string): Promise<void> {
    this.logger.log(`Abandoning session ${sessionId} for user ${userId}`);

    const session = await this.sessionRepository.findByIdSimple(sessionId);
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    // Verify session belongs to user
    if (session.userId !== userId) {
      throw new BadRequestException('This session does not belong to you');
    }

    // Verify session is in progress (can only abandon in-progress sessions)
    if (session.status !== InterviewStatus.IN_PROGRESS) {
      throw new BadRequestException('Can only abandon sessions that are in progress');
    }

    // Mark session as abandoned
    session.abandon();

    await this.sessionRepository.update(session);

    this.logger.log(`Session ${sessionId} abandoned successfully`);
  }

  /**
   * Get active session for a topic (if exists)
   */
  async getActiveSessionForTopic(userId: string, topicId: string): Promise<StartInterviewSessionResponseDto | null> {
    this.logger.log(`Getting active session for user ${userId}, topic ${topicId}`);

    const session = await this.sessionRepository.findActiveSessionByUserAndTopic(userId, topicId);
    if (!session) {
      this.logger.log(`No active session found for user ${userId}, topic ${topicId}`);
      return null;
    }

    // Get topic with questions
    const topic = await this.topicRepository.findActiveQuestionsForTopic(topicId);
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found or inactive`);
    }

    // Filter active questions and sort by order
    const activeQuestions = topic.questions?.filter(q => q.isActive).sort((a, b) => a.order - b.order) || [];

    // Map questions to DTOs
    const questionDtos: InterviewQuestionInSessionDto[] = activeQuestions.map(q => ({
      id: q.id,
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      categoryLabel: q.getCategoryLabel(),
      minimumAnswerLength: q.minimumAnswerLength,
      recommendedTimeSeconds: q.recommendedTimeSeconds,
      order: q.order,
      ...(q.sampleAnswers !== undefined && { sampleAnswers: q.sampleAnswers }),
    }));

    this.logger.log(`Active session ${session.id} found and returned`);

    return {
      sessionId: session.id,
      topicId: topic.id,
      topicName: topic.name,
      totalQuestions: session.totalQuestions,
      estimatedDurationMinutes: topic.estimatedDurationMinutes,
      questions: questionDtos,
      startedAt: session.startedAt!,
      currentQuestionIndex: session.currentQuestionIndex,
    };
  }
}
