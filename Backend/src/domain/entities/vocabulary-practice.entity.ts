import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { PracticeSession, PracticeType } from './practice-session.entity';

@Entity('vocabulary_practices')
export class VocabularyPractice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => PracticeSession, { cascade: true })
  @JoinColumn({ name: 'practice_session_id' })
  practiceSession!: PracticeSession;

  @Column({ name: 'words_studied', type: 'int', default: 0 })
  wordsStudied!: number;

  @Column({ name: 'words_learned', type: 'int', default: 0 })
  wordsLearned!: number;

  @Column({ name: 'correct_answers', type: 'int', default: 0 })
  correctAnswers!: number;

  @Column({ name: 'total_attempts', type: 'int', default: 0 })
  totalAttempts!: number;

  @Column({ name: 'last_word_studied', type: 'varchar', length: 255, nullable: true })
  lastWordStudied?: string;

  @Column({ name: 'words_reviewed', type: 'int', default: 0 })
  wordsReviewed!: number;

  @Column({ name: 'streak_count', type: 'int', default: 0 })
  streakCount!: number;

  @Column({ name: 'difficulty_level', type: 'varchar', length: 50, nullable: true })
  difficultyLevel?: string;

  @Column({ name: 'current_word_index', type: 'int', default: 0 })
  currentWordIndex!: number;

  @Column({ name: 'studied_words', type: 'json', nullable: true })
  studiedWords?: string[];

  @Column({ name: 'reviewed_words', type: 'int', default: 0 })
  reviewedWords!: number;

  @Column({ name: 'incorrect_answers', type: 'int', default: 0 })
  incorrectAnswers!: number;

  // Business methods
  getAccuracyPercentage(): number {
    if (this.totalAttempts === 0) {
      return 0;
    }
    return Math.round((this.correctAnswers / this.totalAttempts) * 100);
  }

  getLearningRate(): number {
    if (this.wordsStudied === 0) {
      return 0;
    }
    return Math.round((this.wordsLearned / this.wordsStudied) * 100);
  }

  getProgress(): number {
    // Calculate progress based on words studied vs total available words
    // For now, we'll use a simple calculation based on words studied
    const totalWordsInSession = this.studiedWords?.length || 0;
    if (totalWordsInSession === 0) {
      return 0;
    }
    return Math.round((this.currentWordIndex / totalWordsInSession) * 100);
  }

  getScore(): number {
    return this.getAccuracyPercentage();
  }

  isCompleted(): boolean {
    const totalWords = this.studiedWords?.length || 0;
    return totalWords > 0 && this.currentWordIndex >= totalWords;
  }

  studyWord(wordId: string, timeSpentSeconds: number): void {
    this.currentWordIndex++;
    this.wordsStudied++;
    this.lastWordStudied = wordId;

    if (!this.studiedWords) {
      this.studiedWords = [];
    }
    this.studiedWords.push(wordId);

    // Update practice session time
    this.practiceSession.timeSpentSeconds += timeSpentSeconds;
  }

  addWordStudied(word: string, isCorrect: boolean): void {
    this.wordsStudied++;
    this.totalAttempts++;
    this.lastWordStudied = word;

    if (isCorrect) {
      this.correctAnswers++;
      this.wordsLearned++;
      this.streakCount++;
    } else {
      this.streakCount = 0;
    }
  }

  reviewWord(isCorrect: boolean): void {
    this.wordsReviewed++;
    this.totalAttempts++;

    if (isCorrect) {
      this.correctAnswers++;
      this.streakCount++;
    } else {
      this.incorrectAnswers++;
      this.streakCount = 0;
    }
  }

  static createForSession(
    practiceSession: PracticeSession,
    difficultyLevel?: string,
  ): VocabularyPractice {
    const vocabularyPractice = new VocabularyPractice();
    vocabularyPractice.practiceSession = practiceSession;
    vocabularyPractice.practiceSession.practiceType = PracticeType.VOCABULARY;
    if (difficultyLevel) {
      vocabularyPractice.difficultyLevel = difficultyLevel;
    }
    return vocabularyPractice;
  }
}
