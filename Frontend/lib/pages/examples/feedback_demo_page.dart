import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/feedback_provider.dart';
import '../../widgets/feedback/feedback_mixin.dart';
import '../../providers/lives_provider.dart';

/// Demo page showing how to use the feedback system
class FeedbackDemoPage extends StatefulWidget {
  const FeedbackDemoPage({super.key});

  @override
  State<FeedbackDemoPage> createState() => _FeedbackDemoPageState();
}

class _FeedbackDemoPageState extends State<FeedbackDemoPage>
    with FeedbackMixin {
  int _currentQuestion = 1;
  int _correctAnswers = 0;
  final int _totalQuestions = 10;
  double _pronunciationAccuracy = 0.0;
  bool _isExerciseComplete = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Feedback System Demo'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          _buildDemoContent(),
          // Show feedback overlay if feedback is visible
          Consumer<FeedbackProvider>(
            builder: (context, feedbackProvider, child) {
              if (feedbackProvider.state == FeedbackState.showing && feedbackProvider.currentFeedback != null) {
                return _buildFeedbackOverlay(feedbackProvider.currentFeedback!);
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDemoContent() {
    if (_isExerciseComplete) {
      return _buildCompletionScreen();
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildProgressSection(),
          const SizedBox(height: 24),
          _buildLivesSection(),
          const SizedBox(height: 24),
          _buildFeedbackDemoSection(),
          const SizedBox(height: 24),
          _buildPronunciationDemoSection(),
          const SizedBox(height: 24),
          _buildQuizDemoSection(),
        ],
      ),
    );
  }

  Widget _buildProgressSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Progress', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            Text('Question $_currentQuestion of $_totalQuestions'),
            const SizedBox(height: 8),
            Text('Correct Answers: $_correctAnswers'),
            const SizedBox(height: 8),
            Text(
              'Accuracy: ${((_correctAnswers / _currentQuestion) * 100).toStringAsFixed(1)}%',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLivesSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Lives Status',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Consumer<LivesProvider>(
              builder: (context, livesProvider, child) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Current Lives: ${livesProvider.currentLives}/5',
                    ),
                    const SizedBox(height: 8),
                    Text('Has Lives: ${livesProvider.hasLives ? "Yes" : "No"}'),
                    const SizedBox(height: 8),
                    Text(
                      'Status: ${livesProvider.livesState.toString().split('.').last}',
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeedbackDemoSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Feedback Demo',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ElevatedButton(
                  onPressed: () => showSuccessFeedback(
                    message: 'Excellent! Correct answer!',
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                  ),
                  child: const Text(
                    'Show Success',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
                ElevatedButton(
                  onPressed: () => showErrorFeedback(
                    message: 'Incorrect answer',
                    hint: 'Try thinking about the context',
                    consumeLife: false,
                  ),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                  child: const Text(
                    'Show Error',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
                ElevatedButton(
                  onPressed: () => showAchievementFeedback(
                    message: 'Achievement Unlocked!',
                    subtitle: 'You\'re on a 5-question streak!',
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                  ),
                  child: const Text(
                    'Show Achievement',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
                ElevatedButton(
                  onPressed: () => showAchievementFeedback(
                    message: 'Perfect Score!',
                    subtitle: 'You got everything right!',
                    isPerfect: true,
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber,
                  ),
                  child: const Text(
                    'Show Perfect',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPronunciationDemoSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Pronunciation Demo',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            Text(
              'Current Accuracy: ${(_pronunciationAccuracy * 100).toStringAsFixed(1)}%',
            ),
            const SizedBox(height: 12),
            Slider(
              value: _pronunciationAccuracy,
              onChanged: (value) {
                setState(() {
                  _pronunciationAccuracy = value;
                });
              },
              min: 0.0,
              max: 1.0,
              divisions: 20,
              label: '${(_pronunciationAccuracy * 100).toStringAsFixed(0)}%',
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                ElevatedButton(
                  onPressed: () {
                    if (_pronunciationAccuracy >= 0.8) {
                      showSuccessFeedback(message: 'Great pronunciation!');
                    } else {
                      showErrorFeedback(
                        message: 'Pronunciation needs work',
                        hint: 'Try to speak more clearly',
                        consumeLife: false,
                      );
                    }
                  },
                  child: const Text('Test Pronunciation'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuizDemoSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Quiz Simulation',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            Text(
              'Question $_currentQuestion: What is the correct translation of "Hello"?',
            ),
            const SizedBox(height: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildAnswerButton('Hola', true),
                const SizedBox(height: 8),
                _buildAnswerButton('Goodbye', false),
                const SizedBox(height: 8),
                _buildAnswerButton('Thank you', false),
                const SizedBox(height: 8),
                _buildAnswerButton('Please', false),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                ElevatedButton(
                  onPressed: _resetDemo,
                  child: const Text('Reset Demo'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: hideFeedback,
                  child: const Text('Hide Feedback'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnswerButton(String answer, bool isCorrect) {
    return ElevatedButton(
      onPressed: () {
        if (isCorrect) {
          _handleCorrectAnswer();
        } else {
          _handleIncorrectAnswer();
        }
      },
      style: ElevatedButton.styleFrom(
        backgroundColor: isCorrect
            ? Colors.green.shade100
            : Colors.grey.shade200,
        foregroundColor: Colors.black87,
      ),
      child: Text(answer),
    );
  }

  Widget _buildCompletionScreen() {
    final accuracy = (_correctAnswers / _totalQuestions) * 100;
    final isPerfect = accuracy == 100;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isPerfect ? Icons.star : Icons.check_circle,
              size: 80,
              color: isPerfect ? Colors.amber : Colors.green,
            ),
            const SizedBox(height: 24),
            Text(
              isPerfect ? 'Perfect Score!' : 'Exercise Complete!',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: isPerfect
                    ? Colors.amber.shade700
                    : Colors.green.shade700,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'You got $_correctAnswers out of $_totalQuestions correct',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'Accuracy: ${accuracy.toStringAsFixed(1)}%',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(color: Colors.grey.shade600),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _resetDemo,
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 16,
                ),
              ),
              child: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }

  void _handleCorrectAnswer() {
    setState(() {
      _correctAnswers++;
      _currentQuestion++;
    });

    showSuccessFeedback(message: 'Correct! Well done!');

    if (_currentQuestion > _totalQuestions) {
      _handleExerciseComplete();
    } else if (_correctAnswers % 3 == 0) {
      // Show achievement every 3 correct answers
      Future.delayed(const Duration(seconds: 1), () {
        showAchievementFeedback(
          message: 'Great Streak!',
          subtitle: 'You\'re doing amazing!',
        );
      });
    }
  }

  void _handleIncorrectAnswer() {
    setState(() {
      _currentQuestion++;
    });

    showErrorFeedback(
      message: 'Not quite right',
      hint: 'Think about the meaning of the word',
      consumeLife: true,
    );

    if (_currentQuestion > _totalQuestions) {
      _handleExerciseComplete();
    }
  }

  void _handlePerfectScore() {
    showAchievementFeedback(
      message: 'Perfect Score!',
      subtitle: 'You got every question right!',
      isPerfect: true,
    );
  }

  void _handleExerciseComplete() {
    setState(() {
      _isExerciseComplete = true;
    });

    final accuracy = (_correctAnswers / _totalQuestions) * 100;
    if (accuracy == 100) {
      _handlePerfectScore();
    } else if (accuracy >= 80) {
      showAchievementFeedback(
        message: 'Excellent Work!',
        subtitle: 'You scored ${accuracy.toStringAsFixed(1)}%',
      );
    }
  }

  void _resetDemo() {
    setState(() {
      _currentQuestion = 1;
      _correctAnswers = 0;
      _pronunciationAccuracy = 0.0;
      _isExerciseComplete = false;
    });

    hideFeedback();
  }

  Widget _buildFeedbackOverlay(FeedbackData feedback) {
    return Positioned.fill(
      child: Container(
        color: Colors.black.withValues(alpha: 0.3),
        child: Center(
          child: Container(
            margin: const EdgeInsets.all(32),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: feedback.color ?? Colors.blue,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (feedback.icon != null)
                  Icon(
                    feedback.icon,
                    size: 48,
                    color: Colors.white,
                  ),
                const SizedBox(height: 16),
                Text(
                  feedback.message,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                if (feedback.subtitle != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    feedback.subtitle!,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
