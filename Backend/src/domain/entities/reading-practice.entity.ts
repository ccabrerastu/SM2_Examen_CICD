import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { PracticeSession, PracticeType } from './practice-session.entity';

@Entity('reading_practices')
export class ReadingPractice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => PracticeSession, { cascade: true })
  @JoinColumn({ name: 'practice_session_id' })
  practiceSession!: PracticeSession;

  @Column({ name: 'text_id', type: 'varchar', length: 255, nullable: true })
  textId?: string;

  @Column({ name: 'text_title', type: 'varchar', length: 500, nullable: true })
  textTitle?: string;

  @Column({ name: 'total_words', type: 'int', default: 0 })
  totalWords!: number;

  @Column({ name: 'words_read', type: 'int', default: 0 })
  wordsRead!: number;

  @Column({ name: 'reading_speed_wpm', type: 'decimal', precision: 8, scale: 2, nullable: true })
  readingSpeedWpm?: number;

  @Column({ name: 'comprehension_questions_total', type: 'int', default: 0 })
  comprehensionQuestionsTotal!: number;

  @Column({ name: 'comprehension_questions_correct', type: 'int', default: 0 })
  comprehensionQuestionsCorrect!: number;

  @Column({ name: 'reading_time_seconds', type: 'int', default: 0 })
  readingTimeSeconds!: number;

  @Column({ name: 'difficulty_level', type: 'varchar', length: 50, nullable: true })
  difficultyLevel?: string;

  @Column({ name: 'text_category', type: 'varchar', length: 100, nullable: true })
  textCategory?: string;

  @Column({ name: 'last_position', type: 'int', default: 0 })
  lastPosition!: number;

  @Column({ name: 'bookmarks', type: 'json', nullable: true })
  bookmarks?: Array<{
    position: number;
    note?: string | undefined;
    timestamp: Date;
  }>;

  @Column({ name: 'vocabulary_encountered', type: 'json', nullable: true })
  vocabularyEncountered?: Array<{
    word: string;
    definition?: string | undefined;
    context: string;
    position: number;
  }>;

  // Business methods
  getReadingProgress(): number {
    if (this.totalWords === 0) {
      return 0;
    }
    return Math.round((this.wordsRead / this.totalWords) * 100);
  }

  getComprehensionScore(): number {
    if (this.comprehensionQuestionsTotal === 0) {
      return 0;
    }
    return Math.round(
      (this.comprehensionQuestionsCorrect / this.comprehensionQuestionsTotal) * 100,
    );
  }

  updateReadingProgress(wordsRead: number, timeSpentSeconds: number): void {
    this.wordsRead = Math.min(wordsRead, this.totalWords);
    this.readingTimeSeconds += timeSpentSeconds;
    this.lastPosition = wordsRead;

    // Calculate reading speed (words per minute)
    if (this.readingTimeSeconds > 0) {
      this.readingSpeedWpm = (this.wordsRead / this.readingTimeSeconds) * 60;
    }

    // Update practice session progress
    this.practiceSession.progress = this.getReadingProgress();
  }

  answerComprehensionQuestion(isCorrect: boolean): void {
    this.comprehensionQuestionsTotal++;
    if (isCorrect) {
      this.comprehensionQuestionsCorrect++;
    }

    // Update practice session score based on comprehension
    this.practiceSession.score = this.getComprehensionScore();
  }

  addBookmark(position: number, note?: string): void {
    if (!this.bookmarks) {
      this.bookmarks = [];
    }
    this.bookmarks.push({
      position,
      note,
      timestamp: new Date(),
    });
  }

  addVocabularyWord(word: string, context: string, position: number, definition?: string): void {
    if (!this.vocabularyEncountered) {
      this.vocabularyEncountered = [];
    }
    this.vocabularyEncountered.push({
      word,
      definition,
      context,
      position,
    });
  }

  isCompleted(): boolean {
    return this.wordsRead >= this.totalWords;
  }

  getEstimatedTimeToComplete(): number {
    if (this.readingSpeedWpm && this.readingSpeedWpm > 0) {
      const remainingWords = this.totalWords - this.wordsRead;
      return Math.ceil(remainingWords / this.readingSpeedWpm); // minutes
    }
    return 0;
  }

  static createForSession(
    practiceSession: PracticeSession,
    textId: string,
    textTitle: string,
    totalWords: number,
    difficultyLevel: string,
    textCategory: string,
  ): ReadingPractice {
    const readingPractice = new ReadingPractice();
    readingPractice.practiceSession = practiceSession;
    readingPractice.practiceSession.practiceType = PracticeType.READING;
    readingPractice.textId = textId;
    readingPractice.textTitle = textTitle;
    readingPractice.totalWords = totalWords;
    readingPractice.difficultyLevel = difficultyLevel;
    readingPractice.textCategory = textCategory;
    readingPractice.practiceSession.maxScore = 100; // Comprehension score is percentage-based
    return readingPractice;
  }
}
