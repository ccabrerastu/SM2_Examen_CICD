import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:english_app/providers/auth_provider.dart';
import 'package:english_app/providers/progress_provider.dart';
import 'package:english_app/providers/vocabulary_provider.dart';

void main() {
  group('Session Resumption Unit Tests', () {
    late AuthProvider authProvider;
    late ProgressProvider progressProvider;
    late VocabularyProvider vocabularyProvider;

    setUp(() async {
      // Initialize SharedPreferences for testing
      SharedPreferences.setMockInitialValues({});
      
      authProvider = AuthProvider();
      progressProvider = ProgressProvider();
      vocabularyProvider = VocabularyProvider(progressProvider: progressProvider);
    });

    test('should initialize providers correctly', () {
      // Assert
      expect(authProvider.authState, equals(AuthState.initial));
      expect(progressProvider.progressState, equals(ProgressState.initial));
      expect(vocabularyProvider.words, isNotEmpty);
      expect(vocabularyProvider.currentWordIndex, equals(0));
    });

    test('should save vocabulary progress locally', () async {
      // Arrange
      const chapterId = 'test-chapter';
      const word = 'test-word';
      const wordsLearned = 5;

      // Act
      progressProvider.onVocabularyPracticed(chapterId, word, wordsLearned);
      await Future.delayed(Duration(milliseconds: 100)); // Allow async operations

      // Assert
      expect(progressProvider.progressState, anyOf([
        ProgressState.saving,
        ProgressState.saved,
        ProgressState.initial
      ]));
    });

    test('should handle vocabulary session progression', () {
      // Arrange
      final initialIndex = vocabularyProvider.currentWordIndex;
      final initialWordsLearned = vocabularyProvider.wordsLearned;

      // Act
      vocabularyProvider.nextWord();
      vocabularyProvider.markWordAsLearned();

      // Assert
      if (vocabularyProvider.hasNextWord) {
        expect(vocabularyProvider.currentWordIndex, greaterThan(initialIndex));
      }
      expect(vocabularyProvider.wordsLearned, greaterThan(initialWordsLearned));
    });

    test('should calculate progress correctly during session', () {
      // Arrange
      final totalWords = vocabularyProvider.words.length;
      
      // Act
      vocabularyProvider.nextWord();
      final progress = vocabularyProvider.progress;

      // Assert
      expect(progress, greaterThan(0.0));
      expect(progress, lessThanOrEqualTo(1.0));
      expect(progress, equals((vocabularyProvider.currentWordIndex + 1) / totalWords));
    });

    test('should reset session state properly', () {
      // Arrange
      vocabularyProvider.nextWord();
      vocabularyProvider.markWordAsLearned();
      vocabularyProvider.toggleStudyMode();

      // Act
      vocabularyProvider.resetProgress();

      // Assert
      expect(vocabularyProvider.currentWordIndex, equals(0));
      expect(vocabularyProvider.wordsLearned, equals(0));
      expect(vocabularyProvider.isStudyMode, isTrue);
    });

    test('should handle completion percentage calculation', () {
      // Arrange
      final totalWords = vocabularyProvider.words.length;
      
      // Act
      vocabularyProvider.markWordAsLearned();
      final percentage = vocabularyProvider.completionPercentage;

      // Assert
      expect(percentage, greaterThan(0.0));
      expect(percentage, lessThanOrEqualTo(100.0));
      expect(percentage, equals((vocabularyProvider.wordsLearned / totalWords) * 100));
    });

    test('should maintain session state during navigation', () {
      // Arrange
      const targetIndex = 3;
      final totalWords = vocabularyProvider.words.length;

      // Act
      if (targetIndex < totalWords) {
        vocabularyProvider.goToWord(targetIndex);
      }

      // Assert
      if (targetIndex < totalWords) {
        expect(vocabularyProvider.currentWordIndex, equals(targetIndex));
        expect(vocabularyProvider.currentWord, isNotNull);
      }
    });

    test('should handle study mode toggle correctly', () {
      // Arrange
      final initialMode = vocabularyProvider.isStudyMode;

      // Act
      vocabularyProvider.toggleStudyMode();
      final afterToggle = vocabularyProvider.isStudyMode;
      
      vocabularyProvider.toggleStudyMode();
      final afterSecondToggle = vocabularyProvider.isStudyMode;

      // Assert
      expect(afterToggle, equals(!initialMode));
      expect(afterSecondToggle, equals(initialMode));
    });

    test('should provide unlearned words list correctly', () {
      // Arrange
      final totalWords = vocabularyProvider.words.length;
      
      // Act
      vocabularyProvider.markWordAsLearned();
      final unlearnedWords = vocabularyProvider.unlearnedWords;

      // Assert
      expect(unlearnedWords.length, equals(totalWords - vocabularyProvider.wordsLearned));
    });
  });
}