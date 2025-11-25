import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/lives_provider.dart';
import '../widgets/lives_counter.dart';
import '../widgets/lives_guard.dart';
import '../widgets/no_lives_dialog.dart';

/// Demo screen showing how to integrate the lives system
class LivesDemoScreen extends StatefulWidget {
  const LivesDemoScreen({super.key});

  @override
  State<LivesDemoScreen> createState() => _LivesDemoScreenState();
}

class _LivesDemoScreenState extends State<LivesDemoScreen> with LivesAwareMixin {
  int correctAnswers = 0;
  int totalQuestions = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lives System Demo'),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16.0),
            child: LivesCounter(),
          ),
        ],
      ),
      body: LivesGuard(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Lives status card
              const LivesStatus(),
              
              const SizedBox(height: 24),
              
              // Demo section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Practice Session',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Try answering these questions. Wrong answers will consume a life!',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 16),
                      
                      // Score display
                      Row(
                        children: [
                          Icon(Icons.check_circle, color: Colors.green.shade600),
                          const SizedBox(width: 8),
                          Text('Correct: $correctAnswers'),
                          const SizedBox(width: 24),
                          Icon(Icons.quiz, color: Colors.blue.shade600),
                          const SizedBox(width: 8),
                          Text('Total: $totalQuestions'),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Practice questions
              _buildQuestionCard(
                'What is the past tense of "go"?',
                ['went', 'goed', 'gone', 'going'],
                0, // correct answer index
              ),
              
              const SizedBox(height: 16),
              
              _buildQuestionCard(
                'Which article should be used: "___ apple"?',
                ['a', 'an', 'the', 'none'],
                1, // correct answer index
              ),
              
              const SizedBox(height: 16),
              
              _buildQuestionCard(
                'What is the plural of "child"?',
                ['childs', 'children', 'childes', 'child'],
                1, // correct answer index
              ),
              
              const SizedBox(height: 24),
              
              // Action buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: hasLives ? _resetScore : null,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Reset Practice'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => context.showNoLivesDialog(),
                      icon: const Icon(Icons.info),
                      label: const Text('About Lives'),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Lives actions for testing
              Card(
                color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Lives System Testing',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'For testing purposes only:',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        children: [
                          ElevatedButton(
                            onPressed: _simulateError,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.orange,
                              foregroundColor: Colors.white,
                            ),
                            child: const Text('Simulate Error'),
                          ),
                          Consumer<LivesProvider>(
                            builder: (context, livesProvider, child) {
                              return ElevatedButton(
                                onPressed: livesProvider.fetchLivesStatus,
                                child: const Text('Refresh Lives'),
                              );
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuestionCard(String question, List<String> options, int correctIndex) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              question,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            ...options.asMap().entries.map((entry) {
              final index = entry.key;
              final option = entry.value;
              final isCorrect = index == correctIndex;
              
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: hasLives 
                        ? () => _answerQuestion(isCorrect, option)
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
                      foregroundColor: Theme.of(context).colorScheme.onSurface,
                    ),
                    child: Text(option),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  void _answerQuestion(bool isCorrect, String answer) async {
    setState(() {
      totalQuestions++;
      if (isCorrect) {
        correctAnswers++;
      }
    });

    if (isCorrect) {
      // Show success feedback
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Correct! "$answer" is the right answer.'),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 2),
        ),
      );
    } else {
      // Wrong answer - consume a life
      final success = await consumeLife(
        errorMessage: 'Wrong answer! The correct answer was different.',
      );
      
      if (!success && isBlocked) {
        // The dialog will be shown automatically by consumeLife
        // You can add additional logic here if needed
      }
    }
  }

  void _simulateError() async {
    await consumeLife(
      errorMessage: 'This is a simulated error for testing!',
    );
  }

  void _resetScore() {
    setState(() {
      correctAnswers = 0;
      totalQuestions = 0;
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Practice session reset!'),
        duration: Duration(seconds: 1),
      ),
    );
  }
}