import 'package:flutter_test/flutter_test.dart';
import 'package:english_app/providers/vocabulary_provider.dart';

void main() {
  group('VocabularyProvider Tests', () {
    late VocabularyProvider provider;

    setUp(() {
      provider = VocabularyProvider();
    });

    test('should initialize with sample words', () {
      // Assert
      expect(provider.words, isNotEmpty);
      expect(provider.currentWordIndex, equals(0));
      expect(provider.wordsLearned, equals(0));
      expect(provider.isStudyMode, isTrue);
    });

    test('should advance to next word', () {
      // Arrange
      final initialIndex = provider.currentWordIndex;
      final hasNext = provider.hasNextWord;

      // Act
      if (hasNext) {
        provider.nextWord();
      }

      // Assert
      if (hasNext) {
        expect(provider.currentWordIndex, equals(initialIndex + 1));
      } else {
        expect(provider.currentWordIndex, equals(initialIndex));
      }
    });

    test('should go to previous word', () {
      // Arrange
      provider.nextWord(); // Move to second word first
      final initialIndex = provider.currentWordIndex;

      // Act
      provider.previousWord();

      // Assert
      expect(provider.currentWordIndex, equals(initialIndex - 1));
    });

    test('should mark word as learned', () {
      // Arrange
      final initialWordsLearned = provider.wordsLearned;

      // Act
      provider.markWordAsLearned();

      // Assert
      expect(provider.wordsLearned, equals(initialWordsLearned + 1));
    });

    test('should toggle study mode', () {
      // Arrange
      final initialStudyMode = provider.isStudyMode;

      // Act
      provider.toggleStudyMode();

      // Assert
      expect(provider.isStudyMode, equals(!initialStudyMode));
    });

    test('should calculate progress correctly', () {
      // Arrange
      final totalWords = provider.words.length;
      final currentIndex = provider.currentWordIndex;

      // Act
      final progress = provider.progress;

      // Assert
      expect(progress, equals((currentIndex + 1) / totalWords));
    });

    test('should reset progress properly', () {
      // Arrange
      provider.nextWord();
      provider.markWordAsLearned();
      provider.toggleStudyMode();

      // Act
      provider.resetProgress();

      // Assert
      expect(provider.currentWordIndex, equals(0));
      expect(provider.wordsLearned, equals(0));
      expect(provider.isStudyMode, isTrue);
    });

    test('should go to specific word index', () {
      // Arrange
      const targetIndex = 2;
      final totalWords = provider.words.length;

      // Act
      if (targetIndex < totalWords) {
        provider.goToWord(targetIndex);
      }

      // Assert
      if (targetIndex < totalWords) {
        expect(provider.currentWordIndex, equals(targetIndex));
      }
    });

    test('should calculate completion percentage', () {
      // Arrange
      provider.markWordAsLearned();
      final totalWords = provider.words.length;
      final wordsLearned = provider.wordsLearned;

      // Act
      final percentage = provider.completionPercentage;

      // Assert
      expect(percentage, equals((wordsLearned / totalWords) * 100));
    });
  });
}
