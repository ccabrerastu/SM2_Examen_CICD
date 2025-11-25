import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/feedback_provider.dart';
import 'particle_effect.dart';

class PronunciationFeedbackWidget extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPronunciationCorrect;
  final VoidCallback? onPronunciationIncorrect;
  final VoidCallback? onPronunciationImproved;
  final bool showAccuracyIndicator;
  final String? exerciseTitle;
  final double? currentAccuracy;
  final double? targetAccuracy;

  const PronunciationFeedbackWidget({
    super.key,
    required this.child,
    this.onPronunciationCorrect,
    this.onPronunciationIncorrect,
    this.onPronunciationImproved,
    this.showAccuracyIndicator = true,
    this.exerciseTitle,
    this.currentAccuracy,
    this.targetAccuracy = 0.8, // 80% accuracy target
  });

  @override
  State<PronunciationFeedbackWidget> createState() =>
      _PronunciationFeedbackWidgetState();
}

class _PronunciationFeedbackWidgetState
    extends State<PronunciationFeedbackWidget>
    with TickerProviderStateMixin {
  bool _showParticles = false;
  late AnimationController _waveController;
  late Animation<double> _waveAnimation;
  bool _isRecording = false;
  double _previousAccuracy = 0.0;

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _waveAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _waveController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _waveController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<FeedbackProvider>(
      builder: (context, feedbackProvider, child) {
        return Stack(
          children: [
            // Main content
            Column(
              children: [
                // Accuracy indicator
                if (widget.showAccuracyIndicator &&
                    widget.currentAccuracy != null)
                  Container(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        if (widget.exerciseTitle != null)
                          Text(
                            widget.exerciseTitle!,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        const SizedBox(height: 12),

                        // Circular accuracy indicator
                        SizedBox(
                          width: 120,
                          height: 120,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              CircularProgressIndicator(
                                value: widget.currentAccuracy!,
                                strokeWidth: 8,
                                backgroundColor: Colors.grey[300],
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  _getAccuracyColor(widget.currentAccuracy!),
                                ),
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    '${(widget.currentAccuracy! * 100).toInt()}%',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    'Precisión',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Target accuracy indicator
                        if (widget.targetAccuracy != null)
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                widget.currentAccuracy! >=
                                        widget.targetAccuracy!
                                    ? Icons.check_circle
                                    : Icons.track_changes,
                                color:
                                    widget.currentAccuracy! >=
                                        widget.targetAccuracy!
                                    ? Colors.green
                                    : Colors.orange,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Objetivo: ${(widget.targetAccuracy! * 100).round()}%',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey[600],
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                      ],
                    ),
                  ),

                // Recording indicator
                if (_isRecording)
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: AnimatedBuilder(
                      animation: _waveAnimation,
                      builder: (context, child) {
                        return Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.mic,
                              color: Colors.red,
                              size: 20 + (_waveAnimation.value * 4),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Grabando...',
                              style: TextStyle(
                                color: Colors.red,
                                fontWeight: FontWeight.w600,
                                fontSize: 14 + (_waveAnimation.value * 2),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),

                // Exercise content
                Expanded(child: widget.child),
              ],
            ),

            // Feedback overlay - handled by FeedbackProvider internally

            // Particle effects for celebrations
            if (_showParticles)
              Positioned.fill(
                child: IgnorePointer(
                  child: ParticleEffect(
                    type: ParticleType.stars,
                    particleCount: 30,
                    duration: const Duration(seconds: 2),
                    primaryColor: Colors.blue,
                    secondaryColor: Colors.purple,
                    onComplete: () {
                      setState(() {
                        _showParticles = false;
                      });
                    },
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Color _getAccuracyColor(double accuracy) {
    if (accuracy >= 0.8) {
      return Colors.green[600]!;
    } else if (accuracy >= 0.6) {
      return Colors.orange[600]!;
    } else {
      return Colors.red[600]!;
    }
  }

  // Method to start recording indication
  void startRecording() {
    setState(() {
      _isRecording = true;
    });
    _waveController.repeat();
  }

  // Method to stop recording indication
  void stopRecording() {
    setState(() {
      _isRecording = false;
    });
    _waveController.stop();
  }

  // Method to show pronunciation feedback
  void showPronunciationFeedback({
    required double accuracy,
    String? word,
    String? feedback,
    List<String>? improvements,
  }) {
    final feedbackProvider = Provider.of<FeedbackProvider>(
      context,
      listen: false,
    );
    final isCorrect = accuracy >= (widget.targetAccuracy ?? 0.8);
    final hasImproved = accuracy > _previousAccuracy;

    if (isCorrect) {
      feedbackProvider.showCorrectAnswer(
        customMessage: feedback ?? '¡Excelente pronunciación!',
      );

      setState(() {
        _showParticles = true;
      });

      _showMotivationalMessage(
        '¡Pronunciación perfecta!',
        Icons.record_voice_over,
        Colors.green[600]!,
      );

      widget.onPronunciationCorrect?.call();
    } else {
      String message = feedback ?? 'Sigue practicando';

      feedbackProvider.showIncorrectAnswer(customMessage: message);

      if (hasImproved) {
        _showMotivationalMessage(
          '¡Estás mejorando!',
          Icons.trending_up,
          Colors.blue[600]!,
        );
        widget.onPronunciationImproved?.call();
      } else {
        _showMotivationalMessage(
          '¡Sigue intentando!',
          Icons.lightbulb_outline,
          Colors.orange[600]!,
        );
      }

      widget.onPronunciationIncorrect?.call();
    }

    _previousAccuracy = accuracy;
  }

  // Method to show achievement for pronunciation milestone
  void showPronunciationAchievement({
    required String achievement,
    String? description,
  }) {
    final feedbackProvider = Provider.of<FeedbackProvider>(
      context,
      listen: false,
    );

    feedbackProvider.showCorrectAnswer(
      customMessage: achievement,
    );

    setState(() {
      _showParticles = true;
    });
  }

  void _showMotivationalMessage(String message, IconData icon, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white),
            SizedBox(width: 8),
            Text(message),
          ],
        ),
        backgroundColor: color,
        duration: const Duration(seconds: 2),
      ),
    );
  }
}

// Extension methods for easy access
extension PronunciationFeedbackExtension on State {
  PronunciationFeedbackWidget? get pronunciationFeedback {
    final context = this.context;
    return context.findAncestorWidgetOfExactType<PronunciationFeedbackWidget>();
  }

  void startPronunciationRecording() {
    final widget = pronunciationFeedback;
    if (widget != null) {
      final state = context
          .findAncestorStateOfType<_PronunciationFeedbackWidgetState>();
      state?.startRecording();
    }
  }

  void stopPronunciationRecording() {
    final widget = pronunciationFeedback;
    if (widget != null) {
      final state = context
          .findAncestorStateOfType<_PronunciationFeedbackWidgetState>();
      state?.stopRecording();
    }
  }

  void showPronunciationResult({
    required double accuracy,
    String? word,
    String? feedback,
    List<String>? improvements,
  }) {
    final widget = pronunciationFeedback;
    if (widget != null) {
      final state = context
          .findAncestorStateOfType<_PronunciationFeedbackWidgetState>();
      state?.showPronunciationFeedback(
        accuracy: accuracy,
        word: word,
        feedback: feedback,
        improvements: improvements,
      );
    }
  }

  void showPronunciationAchievement({
    required String achievement,
    String? description,
  }) {
    final widget = pronunciationFeedback;
    if (widget != null) {
      final state = context
          .findAncestorStateOfType<_PronunciationFeedbackWidgetState>();
      state?.showPronunciationAchievement(
        achievement: achievement,
        description: description,
      );
    }
  }
}

// Pronunciation exercise types
enum PronunciationExerciseType { word, sentence, conversation, phoneme }

// Pronunciation difficulty levels
enum PronunciationDifficulty { beginner, intermediate, advanced }

// Pronunciation feedback data
class PronunciationFeedbackData {
  final double accuracy;
  final String word;
  final String? phonetic;
  final List<String> improvements;
  final PronunciationExerciseType type;
  final PronunciationDifficulty difficulty;
  final DateTime timestamp;

  const PronunciationFeedbackData({
    required this.accuracy,
    required this.word,
    this.phonetic,
    required this.improvements,
    required this.type,
    required this.difficulty,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() {
    return {
      'accuracy': accuracy,
      'word': word,
      'phonetic': phonetic,
      'improvements': improvements,
      'type': type.name,
      'difficulty': difficulty.name,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory PronunciationFeedbackData.fromJson(Map<String, dynamic> json) {
    return PronunciationFeedbackData(
      accuracy: json['accuracy']?.toDouble() ?? 0.0,
      word: json['word'] ?? '',
      phonetic: json['phonetic'],
      improvements: List<String>.from(json['improvements'] ?? []),
      type: PronunciationExerciseType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => PronunciationExerciseType.word,
      ),
      difficulty: PronunciationDifficulty.values.firstWhere(
        (e) => e.name == json['difficulty'],
        orElse: () => PronunciationDifficulty.beginner,
      ),
      timestamp: DateTime.parse(json['timestamp']),
    );
  }
}
