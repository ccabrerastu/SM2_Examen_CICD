import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AnswerEvaluation } from '../../../domain/entities/interview-session.entity';
import { InterviewQuestion } from '../../../domain/entities/interview-question.entity';

/**
 * AI Evaluation Service - PLACEHOLDER for future AI integration
 *
 * This service will be responsible for evaluating user answers using AI models like:
 * - OpenAI GPT-4
 * - Anthropic Claude
 * - Google Gemini
 *
 * For now, it provides mock evaluations based on answer length and keywords.
 */
@Injectable()
export class AIEvaluationService {
  private readonly logger = new Logger(AIEvaluationService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private tempAudioFolder: string;

  constructor(private readonly configService: ConfigService) {
    // Initialize Google Gemini AI
    const apiKey = this.configService.get<string>('GOOGLE_GEMINI_API_KEY');
    if (apiKey && apiKey !== 'your-gemini-api-key-here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log('Google Gemini AI initialized successfully');
    } else {
      this.logger.warn('Google Gemini API key not configured - AI evaluation will use mock data');
    }

    // Get temp audio folder path
    this.tempAudioFolder = this.configService.get<string>('TEMP_AUDIO_FOLDER') || 'uploads/temp/audio';
  }

  /**
   * Evaluate an answer using AI (PLACEHOLDER - currently returns mock scores)
   *
   * Future implementation will:
   * 1. Send answer to AI model with context (question, expected criteria)
   * 2. Get structured evaluation with scores for each dimension
   * 3. Get feedback and suggestions from AI
   * 4. Cache results for performance
   */
  async evaluateAnswer(
    question: InterviewQuestion,
    answerText: string,
    timeSpentSeconds?: number,
  ): Promise<AnswerEvaluation> {
    this.logger.log(`[AI PLACEHOLDER] Evaluating answer for question: ${question.id}`);

    // PLACEHOLDER: Mock evaluation based on answer length and keywords
    const answerLength = answerText.length;
    const hasMinimumLength = answerLength >= question.minimumAnswerLength;

    // Simple keyword matching (will be replaced by AI)
    const keywordMatches = this.countKeywordMatches(answerText, question.keywords || []);
    const keywordScore = Math.min(100, (keywordMatches / (question.keywords?.length || 1)) * 100);

    // Mock scores (will be replaced by AI evaluation)
    const baseScore = hasMinimumLength ? 70 : 50;
    const lengthBonus = Math.min(15, (answerLength - question.minimumAnswerLength) / 10);
    const keywordBonus = keywordScore * 0.15;

    const fluencyScore = Math.min(100, baseScore + lengthBonus);
    const grammarScore = Math.min(100, baseScore + keywordBonus);
    const vocabularyScore = Math.min(100, baseScore + keywordScore * 0.1);
    const pronunciationScore = Math.min(100, baseScore + 10); // Placeholder
    const coherenceScore = Math.min(100, baseScore + lengthBonus + keywordBonus);

    const overallQuestionScore = (
      fluencyScore * 0.25 +
      grammarScore * 0.20 +
      vocabularyScore * 0.20 +
      pronunciationScore * 0.20 +
      coherenceScore * 0.15
    );

    // Generate mock feedback
    const feedback = this.generateMockFeedback(overallQuestionScore, hasMinimumLength, keywordMatches);
    const issues = this.generateMockIssues(answerLength, keywordMatches);
    const improvements = this.generateMockImprovements(overallQuestionScore);

    const evaluation: AnswerEvaluation = {
      questionId: question.id,
      questionText: question.question,
      answerText,
      answerLength,
      submittedAt: new Date(),
      fluencyScore: Math.round(fluencyScore * 100) / 100,
      grammarScore: Math.round(grammarScore * 100) / 100,
      vocabularyScore: Math.round(vocabularyScore * 100) / 100,
      pronunciationScore: Math.round(pronunciationScore * 100) / 100,
      coherenceScore: Math.round(coherenceScore * 100) / 100,
      overallQuestionScore: Math.round(overallQuestionScore * 100) / 100,
      aiFeedback: feedback,
      detectedIssues: issues,
      suggestedImprovements: improvements,
      ...(timeSpentSeconds !== undefined && { timeSpentSeconds }),
      attemptNumber: 1,
    };

    this.logger.log(`[AI PLACEHOLDER] Evaluation complete. Overall score: ${evaluation.overallQuestionScore}`);

    return evaluation;
  }

  /**
   * Count keyword matches in answer (case-insensitive)
   */
  private countKeywordMatches(answerText: string, keywords: string[]): number {
    const lowerAnswer = answerText.toLowerCase();
    return keywords.filter(keyword => lowerAnswer.includes(keyword.toLowerCase())).length;
  }

  /**
   * Generate mock feedback based on score
   */
  private generateMockFeedback(score: number, hasMinimumLength: boolean, _keywordMatches: number): string {
    if (score >= 90) {
      return 'Excellent answer! You demonstrated strong understanding and communication skills.';
    } else if (score >= 80) {
      return 'Great job! Your answer shows good comprehension. Minor improvements could make it even better.';
    } else if (score >= 70) {
      return 'Good answer. You covered the main points, but consider adding more detail and examples.';
    } else if (score >= 60) {
      return 'Adequate response, but there\'s room for improvement in clarity and depth.';
    } else {
      return hasMinimumLength
        ? 'Your answer needs more relevant content. Focus on addressing the key aspects of the question.'
        : 'Your answer is too brief. Try to provide more detailed explanations and examples.';
    }
  }

  /**
   * Generate mock detected issues
   */
  private generateMockIssues(answerLength: number, keywordMatches: number): string[] {
    const issues: string[] = [];

    if (answerLength < 60) {
      issues.push('Answer is quite brief - consider providing more detail');
    }

    if (keywordMatches === 0) {
      issues.push('Answer may not be addressing the key concepts of the question');
    }

    // Placeholder issues (will be replaced by AI analysis)
    if (issues.length === 0) {
      return [];
    }

    return issues;
  }

  /**
   * Generate mock improvement suggestions
   */
  private generateMockImprovements(score: number): string[] {
    const improvements: string[] = [];

    if (score < 90) {
      improvements.push('Try to provide specific examples to illustrate your points');
    }

    if (score < 80) {
      improvements.push('Expand on the main concepts with more detailed explanations');
    }

    if (score < 70) {
      improvements.push('Structure your answer more clearly with introduction, body, and conclusion');
      improvements.push('Use more technical vocabulary related to the topic');
    }

    return improvements;
  }

  /**
   * Evaluate an audio answer using Google Gemini AI
   *
   * @param question Interview question context
   * @param audioBuffer Audio file buffer (M4A format)
   * @param timeSpentSeconds Time spent on answer
   * @returns Promise<AnswerEvaluation> Evaluation with pronunciation analysis
   */
  async evaluateAudioAnswer(
    question: InterviewQuestion,
    audioBuffer: Buffer,
    timeSpentSeconds?: number,
  ): Promise<AnswerEvaluation> {
    this.logger.log(`[AI AUDIO] Evaluating audio answer for question: ${question.id}`);

    // If Gemini is not configured, return mock evaluation
    if (!this.genAI) {
      this.logger.warn('[AI AUDIO] Gemini not configured - using mock evaluation');
      return this.evaluateAnswer(question, '[Audio answer - AI not configured]', timeSpentSeconds);
    }

    let tempFilePath: string | null = null;

    try {
      // Save audio to temp file
      tempFilePath = await this.saveTempAudioFile(audioBuffer);
      this.logger.log(`[AI AUDIO] Audio saved to temp file: ${tempFilePath}`);

      // Convert audio to base64 for Gemini
      const audioBase64 = audioBuffer.toString('base64');

      // Initialize Gemini model (use gemini-1.5-pro for audio support)
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      // Construct the prompt based on user requirements
      const prompt = `
Analiza esta grabación y dame un reporte fonético completo pero corto y conciso:
- Pronunciación de vocales y consonantes
- Fonemas mal articulados
- Influencia del acento
- Problemas de ritmo, entonación y estrés
- Ejemplos de correcciones
- Porcentaje de inteligibilidad
- Palabras donde se detecten errores

Devuelve SOLO un JSON con las claves:
analisis_general, puntos_a_mejorar, evaluacion_final, recomendaciones, puntaje (0-100), aprobado (true/false).

Contexto de la pregunta: "${question.question}"
`;

      // Send request to Gemini with audio
      const result = await model.generateContent([
        {
          inlineData: {
            data: audioBase64,
            mimeType: 'audio/m4a', // M4A format from Flutter
          },
        },
        { text: prompt },
      ]);

      const response = await result.response;
      const text = response.text();

      this.logger.log(`[AI AUDIO] Gemini response received: ${text.substring(0, 200)}...`);

      // Parse JSON response
      const aiAnalysis = this.parseGeminiResponse(text);

      // Map Gemini response to AnswerEvaluation format
      const evaluation = this.mapGeminiToEvaluation(question, aiAnalysis, timeSpentSeconds);

      this.logger.log(`[AI AUDIO] Evaluation complete. Overall score: ${evaluation.overallQuestionScore}`);

      return evaluation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      this.logger.error(`[AI AUDIO] Error evaluating audio: ${errorMessage}`, errorStack);

      // Fallback to mock evaluation on error
      return this.evaluateAnswer(
        question,
        '[Audio answer - AI evaluation failed]',
        timeSpentSeconds,
      );
    } finally {
      // Clean up temp file
      if (tempFilePath) {
        await this.deleteTempFile(tempFilePath);
      }
    }
  }

  /**
   * Save audio buffer to temporary file
   */
  private async saveTempAudioFile(audioBuffer: Buffer): Promise<string> {
    // Ensure temp directory exists
    await fs.mkdir(this.tempAudioFolder, { recursive: true });

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `audio_${timestamp}.m4a`;
    const filePath = path.join(this.tempAudioFolder, filename);

    // Write buffer to file
    await fs.writeFile(filePath, audioBuffer);

    return filePath;
  }

  /**
   * Delete temporary file
   */
  private async deleteTempFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.logger.log(`[AI AUDIO] Temp file deleted: ${filePath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(`[AI AUDIO] Failed to delete temp file: ${filePath}`, errorMessage);
    }
  }

  /**
   * Parse Gemini JSON response with error handling
   */
  private parseGeminiResponse(text: string): GeminiAnalysis {
    try {
      // Remove markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/, '').replace(/```\n?$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/, '').replace(/```\n?$/, '');
      }

      const parsed = JSON.parse(cleanedText);

      // Validate required fields and provide defaults
      return {
        analisis_general: parsed.analisis_general || 'Audio analysis completed',
        puntos_a_mejorar: parsed.puntos_a_mejorar || 'Continue practicing pronunciation',
        evaluacion_final: parsed.evaluacion_final || 'Good effort',
        recomendaciones: parsed.recomendaciones || 'Keep practicing regularly',
        puntaje: typeof parsed.puntaje === 'number' ? parsed.puntaje : 70,
        aprobado: typeof parsed.aprobado === 'boolean' ? parsed.aprobado : parsed.puntaje >= 70,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;      
      this.logger.error('[AI AUDIO] Failed to parse Gemini response', errorMessage, errorStack);

      // Return default values on parse error
      return {
        analisis_general: 'Audio received and analyzed',
        puntos_a_mejorar: 'Focus on pronunciation clarity',
        evaluacion_final: 'Adequate response',
        recomendaciones: 'Practice speaking more regularly',
        puntaje: 70,
        aprobado: true,
      };
    }
  }

  /**
   * Map Gemini analysis to AnswerEvaluation format
   */
  private mapGeminiToEvaluation(
    question: InterviewQuestion,
    aiAnalysis: GeminiAnalysis,
    timeSpentSeconds?: number,
  ): AnswerEvaluation {
    const score = aiAnalysis.puntaje;

    // Calculate individual skill scores based on overall score
    // For audio, pronunciation is weighted more heavily
    const pronunciationScore = score;
    const fluencyScore = Math.max(score - 5, 0);
    const grammarScore = Math.max(score - 10, 0);
    const vocabularyScore = Math.max(score - 8, 0);
    const coherenceScore = Math.max(score - 5, 0);

    const overallQuestionScore = (
      pronunciationScore * 0.35 + // Higher weight for pronunciation in audio
      fluencyScore * 0.25 +
      grammarScore * 0.15 +
      vocabularyScore * 0.15 +
      coherenceScore * 0.10
    );

    // Build feedback array from Gemini response
    const detectedIssues = aiAnalysis.puntos_a_mejorar
      ? aiAnalysis.puntos_a_mejorar.split('\n').filter(line => line.trim().length > 0)
      : [];

    const suggestedImprovements = aiAnalysis.recomendaciones
      ? aiAnalysis.recomendaciones.split('\n').filter(line => line.trim().length > 0)
      : [];

    const evaluation: AnswerEvaluation = {
      questionId: question.id,
      questionText: question.question,
      answerText: '[Audio answer - evaluated by AI]',
      answerLength: 0, // Audio has no text length
      submittedAt: new Date(),
      fluencyScore: Math.round(fluencyScore * 100) / 100,
      grammarScore: Math.round(grammarScore * 100) / 100,
      vocabularyScore: Math.round(vocabularyScore * 100) / 100,
      pronunciationScore: Math.round(pronunciationScore * 100) / 100,
      coherenceScore: Math.round(coherenceScore * 100) / 100,
      overallQuestionScore: Math.round(overallQuestionScore * 100) / 100,
      aiFeedback: `${aiAnalysis.analisis_general}\n\n${aiAnalysis.evaluacion_final}`,
      detectedIssues,
      suggestedImprovements,
      ...(timeSpentSeconds !== undefined && { timeSpentSeconds }),
      attemptNumber: 1,
    };

    return evaluation;
  }

  /**
   * FUTURE: Integration with OpenAI GPT-4
   *
   * Example implementation:
   *
   * async evaluateWithOpenAI(question: string, answer: string): Promise<Evaluation> {
   *   const prompt = `
   *     Evaluate this interview answer on a scale of 0-100 for each dimension:
   *     - Fluency
   *     - Grammar
   *     - Vocabulary
   *     - Pronunciation (based on text quality)
   *     - Coherence
   *
   *     Question: ${question}
   *     Answer: ${answer}
   *
   *     Provide feedback and suggestions in JSON format.
   *   `;
   *
   *   const response = await openai.chat.completions.create({
   *     model: 'gpt-4',
   *     messages: [{ role: 'user', content: prompt }],
   *     response_format: { type: 'json_object' },
   *   });
   *
   *   return JSON.parse(response.choices[0].message.content);
   * }
   */
}

/**
 * Interface for Gemini AI response
 */
interface GeminiAnalysis {
  analisis_general: string;
  puntos_a_mejorar: string;
  evaluacion_final: string;
  recomendaciones: string;
  puntaje: number;
  aprobado: boolean;
}
