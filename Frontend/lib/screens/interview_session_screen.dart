import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:ui';
import 'dart:io';
import '../providers/interview_provider.dart';
import '../l10n/app_localizations.dart';
import '../widgets/interview_robot_head.dart';

class InterviewSessionScreen extends StatefulWidget {
  const InterviewSessionScreen({super.key});

  @override
  State<InterviewSessionScreen> createState() => _InterviewSessionScreenState();
}

class _InterviewSessionScreenState extends State<InterviewSessionScreen> {
  final TextEditingController _answerController = TextEditingController();
  final GlobalKey<InterviewRobotHeadState> _robotHeadKey = GlobalKey<InterviewRobotHeadState>();
  final FlutterTts _flutterTts = FlutterTts();
  final AudioRecorder _audioRecorder = AudioRecorder();

  bool _isInitialized = false;
  bool _hasSpeakingStarted = false;
  bool _modelLoaded = false;
  bool _microphonePermissionGranted = false;
  int _questionTapCount = 0;
  bool _questionRevealed = false;
  bool _wakeUpComplete = false; // Track if wakeUp animation has finished

  // Audio recording state
  bool _isRecording = false;
  String? _audioFilePath;
  bool _isSendingAudio = false;
  int _recordingDurationSeconds = 0;
  DateTime? _recordingStartTime;

  @override
  void initState() {
    super.initState();
    _initializeTTS();
    _checkMicrophonePermission();
  }

  @override
  void dispose() {
    _answerController.dispose();
    _flutterTts.stop();
    _audioRecorder.dispose();
    super.dispose();
  }

  /// Initialize TTS service
  Future<void> _initializeTTS() async {
    try {
      await _flutterTts.setLanguage("en-US");
      await _flutterTts.setSpeechRate(0.35); // Slower speed (0.35 = 65% slower than normal)
      await _flutterTts.setPitch(0.6); // Much lower pitch for male voice (0.6 = deep male)
      await _flutterTts.setVolume(1.0);

      // Try to set a male voice if available
      try {
        final voices = await _flutterTts.getVoices;
        debugPrint('📢 Available TTS voices: $voices');

        // Try to find a male English voice
        final maleVoice = voices.firstWhere(
          (voice) {
            final name = voice['name'].toString().toLowerCase();
            final locale = voice['locale'].toString().toLowerCase();
            return locale.contains('en') &&
                   (name.contains('male') || name.contains('man') || name.contains('david') ||
                    name.contains('james') || name.contains('rishi'));
          },
          orElse: () => voices.first,
        );

        if (maleVoice != null) {
          await _flutterTts.setVoice({"name": maleVoice['name'], "locale": maleVoice['locale']});
          debugPrint('✅ Selected male voice: ${maleVoice['name']}');
        }
      } catch (e) {
        debugPrint('⚠️ Could not set specific voice, using default: $e');
      }

      // Set completion handler to detect when TTS finishes
      _flutterTts.setCompletionHandler(() {
        debugPrint('✅ TTS completed - stopping speaking animation');
        if (mounted) {
          _robotHeadKey.currentState?.stopSpeaking();
        }
      });

      setState(() {
        _isInitialized = true;
      });
      debugPrint('✅ Flutter TTS initialized with deep male voice');
    } catch (e) {
      debugPrint('❌ Error initializing TTS: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('TTS initialization failed: ${e.toString()}'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    }
  }

  /// Check and request microphone permission
  Future<void> _checkMicrophonePermission() async {
    final status = await Permission.microphone.status;
    if (status.isGranted) {
      setState(() {
        _microphonePermissionGranted = true;
      });
    } else {
      setState(() {
        _microphonePermissionGranted = false;
      });
    }
  }

  /// Request microphone permission
  Future<void> _requestMicrophonePermission() async {
    final status = await Permission.microphone.request();
    if (status.isGranted) {
      setState(() {
        _microphonePermissionGranted = true;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Microphone permission granted!'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } else if (status.isPermanentlyDenied) {
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Microphone Permission Required'),
            content: const Text(
              'Please enable microphone permission in your device settings to use voice recording.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  openAppSettings();
                },
                child: const Text('Open Settings'),
              ),
            ],
          ),
        );
      }
    }
  }

  /// Callback when 3D model is loaded
  void _onModelLoaded() {
    if (!mounted) return;

    debugPrint('✅ 3D Model loaded callback received');

    // For first question: Wait additional 3 seconds after model loads to ensure it's fully rendered
    // For subsequent questions: Model is already rendered, so less wait time
    final waitTime = _modelLoaded ? Duration(milliseconds: 500) : Duration(seconds: 3);

    Future.delayed(waitTime, () {
      if (!mounted) return;

      debugPrint('✅ 3D Model fully rendered - Ready to speak');
      setState(() {
        _modelLoaded = true;
      });
    });
  }

  /// Callback when wakeUp animation completes
  void _onWakeUpComplete() {
    if (!mounted) return;

    debugPrint('✅ WakeUp animation complete - Now can start speaking');
    setState(() {
      _wakeUpComplete = true;
    });

    // Now that wakeUp is done, trigger speaking if we haven't started yet
    final provider = context.read<InterviewProvider>();
    final question = provider.currentQuestion;
    if (question != null && !_hasSpeakingStarted && _isInitialized && _modelLoaded) {
      _speakQuestion(question.question);
    }
  }

  /// Speak the question text and trigger robot animation
  Future<void> _speakQuestion(String questionText) async {
    debugPrint('🎬 _speakQuestion called');
    debugPrint('   - _isInitialized: $_isInitialized');
    debugPrint('   - _modelLoaded: $_modelLoaded');
    debugPrint('   - _wakeUpComplete: $_wakeUpComplete');
    debugPrint('   - _hasSpeakingStarted: $_hasSpeakingStarted');

    if (!_isInitialized) {
      debugPrint('⚠️ TTS not initialized yet');
      return;
    }

    if (!_modelLoaded) {
      debugPrint('⚠️ 3D Model not loaded yet, waiting...');
      return;
    }

    if (!_wakeUpComplete) {
      debugPrint('⚠️ WakeUp not complete yet, waiting...');
      return;
    }

    if (_hasSpeakingStarted) {
      debugPrint('⚠️ Already speaking, skipping...');
      return;
    }

    setState(() {
      _hasSpeakingStarted = true;
    });

    try {
      debugPrint('🎙️ Starting to speak question: $questionText');

      // Start robot speaking animation
      _robotHeadKey.currentState?.playSpeakingAnimation();

      // Speak the question using Flutter TTS
      await _flutterTts.speak(questionText);

      debugPrint('✅ Finished speaking');
    } catch (e) {
      debugPrint('❌ Error speaking question: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to speak question: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  /// Repeat the question reading
  Future<void> _repeatQuestion(String questionText) async {
    // Stop any current speech
    await _flutterTts.stop();

    // Reset and speak again
    _robotHeadKey.currentState?.playSpeakingAnimation();
    await _flutterTts.speak(questionText);
    debugPrint('🔄 Repeating question');
  }

  /// Handle question text tap (reveal after 2 taps)
  void _handleQuestionTap() {
    setState(() {
      _questionTapCount++;
      if (_questionTapCount >= 2) {
        _questionRevealed = true;
      }
    });
  }


  /// Start recording audio (called when button is pressed down)
  Future<void> _startRecording() async {
    if (!_microphonePermissionGranted) {
      await _requestMicrophonePermission();
      if (!_microphonePermissionGranted) return;
    }

    try {
      // Stop idle animations while recording
      _robotHeadKey.currentState?.stopIdle();

      // Check if microphone is available
      if (!await _audioRecorder.hasPermission()) {
        debugPrint('❌ Microphone permission not granted');
        return;
      }

      // Get temporary directory for audio file
      final tempDir = await getTemporaryDirectory();
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final filePath = '${tempDir.path}/interview_answer_$timestamp.m4a';

      // Configure recording with compression (AAC codec, lower bitrate)
      const config = RecordConfig(
        encoder: AudioEncoder.aacLc, // AAC-LC codec for compression
        bitRate: 64000, // 64 kbps for good quality with small size
        sampleRate: 44100, // Standard sample rate
        numChannels: 1, // Mono for smaller file size
      );

      // Start recording
      await _audioRecorder.start(config, path: filePath);

      setState(() {
        _isRecording = true;
        _audioFilePath = filePath;
        _recordingStartTime = DateTime.now();
      });

      debugPrint('🎙️ Started recording to: $filePath');
    } catch (e) {
      debugPrint('❌ Error starting recording: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to start recording: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// Stop recording audio (called when button is released)
  Future<void> _stopRecording() async {
    if (!_isRecording) return;

    try {
      // Stop recording
      final path = await _audioRecorder.stop();

      // Calculate duration
      int duration = 0;
      if (_recordingStartTime != null) {
        duration = DateTime.now().difference(_recordingStartTime!).inSeconds;
      }

      setState(() {
        _isRecording = false;
        _audioFilePath = path;
        _recordingDurationSeconds = duration;
      });

      debugPrint('✅ Stopped recording, file saved at: $path (${duration}s)');
    } catch (e) {
      debugPrint('❌ Error stopping recording: $e');
      setState(() {
        _isRecording = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to stop recording: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// Discard recorded audio and allow re-recording
  void _discardRecording() async {
    // Delete the audio file if it exists
    if (_audioFilePath != null) {
      try {
        final file = File(_audioFilePath!);
        if (await file.exists()) {
          await file.delete();
          debugPrint('🗑️ Audio file deleted: $_audioFilePath');
        }
      } catch (e) {
        debugPrint('⚠️ Error deleting audio file: $e');
      }
    }

    setState(() {
      _audioFilePath = null;
      _recordingDurationSeconds = 0;
      _recordingStartTime = null;
    });
    debugPrint('🗑️ Recording discarded');
  }

  /// Send audio file to endpoint with AI evaluation
  Future<void> _sendAudioToEndpoint(String filePath) async {
    setState(() {
      _isSendingAudio = true;
    });

    try {
      final file = File(filePath);
      final fileSize = await file.length();
      debugPrint('📤 Sending audio file: ${fileSize / 1024} KB');
      final audioBytes = await file.readAsBytes();

      if (!mounted) return;
      // Read audio bytes and send to backend with AI evaluation
      final provider = context.read<InterviewProvider>();
      await provider.submitAnswerWithAudio(audioBytes, 'audio/m4a');

      debugPrint('✅ Audio submitted and evaluated by AI successfully');

      // Delete temporary file
      await file.delete();
      debugPrint('🗑️ Temporary audio file deleted');
    } catch (e) {
      debugPrint('❌ Error processing audio: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to process audio: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSendingAudio = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<InterviewProvider>(
      builder: (context, provider, child) {
        if (provider.state == InterviewState.sessionCompleted && provider.finalScore != null) {
          return _buildFinalScoreScreen(context, provider);
        }

        final l10n = AppLocalizations.of(context)!;

        return Scaffold(
          appBar: AppBar(
            title: Text(l10n.interviewDash(provider.activeSession?.topicName ?? "")),
            actions: [
              // Question counter only (no lives counter in interview)
              Center(
                child: Padding(
                  padding: const EdgeInsets.only(right: 16),
                  child: Text(
                    '${provider.questionsAnswered}/${provider.totalQuestions}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
          body: provider.currentQuestion == null
              ? const Center(child: CircularProgressIndicator())
              : provider.latestEvaluation != null
                  ? _buildEvaluationView(context, provider)
                  : _buildQuestionView(context, provider),
        );
      },
    );
  }

  Widget _buildQuestionView(BuildContext context, InterviewProvider provider) {
    final question = provider.currentQuestion!;
    final l10n = AppLocalizations.of(context)!;

    // Trigger TTS when question loads AND model is fully rendered AND wakeUp is complete
    // (only once per question)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_hasSpeakingStarted && _isInitialized && _modelLoaded && _wakeUpComplete) {
        _speakQuestion(question.question);
      }
    });

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      child: Column(
        key: ValueKey(question.id),
        children: [
          // Progress bar at top (only shown when model is loaded)
          // Shows immediately without animation to avoid loading appearance
          LinearProgressIndicator(
            value: provider.progressPercentage / 100,
          ),

          // 3D Robot Head - Expanded to take maximum space
          Expanded(
            child: Center(
              child: InterviewRobotHead(
                key: _robotHeadKey,
                onModelLoaded: _onModelLoaded, // Notify when model is ready
                onWakeUpComplete: _onWakeUpComplete, // Notify when wakeUp animation completes
              ),
            ),
          ),

          // Bottom controls section - Fixed at bottom
          Container(
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  offset: const Offset(0, -2),
                  blurRadius: 8,
                ),
              ],
            ),
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Category badge
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0.0, end: 1.0),
                  duration: const Duration(milliseconds: 400),
                  curve: Curves.easeOutBack,
                  builder: (context, value, child) {
                    return Transform.scale(
                      scale: value,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Theme.of(context).colorScheme.primary,
                              Theme.of(context).colorScheme.primary.withValues(alpha: 0.8),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Text(
                          question.categoryLabel,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 12),

                // Repeat question button
                IconButton(
                  onPressed: () => _repeatQuestion(question.question),
                  icon: const Icon(Icons.refresh, size: 28),
                  color: Theme.of(context).colorScheme.primary,
                  tooltip: 'Repeat question',
                ),
                const SizedBox(height: 8),

                // Question text with blur (requires 2 taps to reveal)
                GestureDetector(
                  onTap: _handleQuestionTap,
                  child: TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0.0, end: 1.0),
                    duration: const Duration(milliseconds: 500),
                    curve: Curves.easeIn,
                    builder: (context, value, child) {
                      return Opacity(
                        opacity: value,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            // Blurred text
                            if (!_questionRevealed)
                              ImageFiltered(
                                imageFilter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                                child: Text(
                                  question.question,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                    height: 1.3,
                                  ),
                                  maxLines: 3,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            // Clear text (shown after 2 taps)
                            if (_questionRevealed)
                              Text(
                                question.question,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                  height: 1.3,
                                ),
                                maxLines: 3,
                                overflow: TextOverflow.ellipsis,
                              ),
                            // Tap hint overlay
                            if (!_questionRevealed)
                              Positioned(
                                bottom: 0,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.6),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    'Tap ${2 - _questionTapCount} more time${_questionTapCount == 1 ? '' : 's'} to reveal',
                                    style: const TextStyle(
                                      fontSize: 10,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),

                // Audio recording section
                Column(
                  children: [
                    // Recording indicator or recorded audio info
                    if (_audioFilePath != null && !_isRecording)
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.blue.shade300),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.check_circle, color: Colors.blue.shade700, size: 24),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                l10n.recordedSeconds(_recordingDurationSeconds),
                                style: TextStyle(
                                  color: Colors.blue.shade700,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            IconButton(
                              icon: Icon(Icons.delete_outline, color: Colors.red.shade400),
                              onPressed: _discardRecording,
                              tooltip: l10n.reRecord,
                            ),
                          ],
                        ),
                      ),

                    if (_audioFilePath != null && !_isRecording) const SizedBox(height: 12),

                    // WhatsApp-style Voice recording button
                    GestureDetector(
                      onLongPressStart: _microphonePermissionGranted
                          ? (_) => _startRecording()
                          : null,
                      onLongPressEnd: _microphonePermissionGranted
                          ? (_) => _stopRecording()
                          : null,
                      onTap: _microphonePermissionGranted
                          ? null
                          : _requestMicrophonePermission,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
                        decoration: BoxDecoration(
                          color: _isRecording
                              ? Colors.red.shade500
                              : (_microphonePermissionGranted
                                  ? Colors.green.shade500
                                  : Colors.orange.shade500),
                          borderRadius: BorderRadius.circular(30),
                          boxShadow: [
                            BoxShadow(
                              color: (_isRecording
                                      ? Colors.red
                                      : (_microphonePermissionGranted ? Colors.green : Colors.orange))
                                  .withValues(alpha: 0.3),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              _isRecording
                                  ? Icons.mic
                                  : (_microphonePermissionGranted ? Icons.mic : Icons.mic_off),
                              size: 28,
                              color: Colors.white,
                            ),
                            const SizedBox(width: 12),
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 200),
                              child: Text(
                                _isRecording
                                    ? l10n.recording
                                    : (_audioFilePath != null
                                        ? l10n.reRecord
                                        : (_microphonePermissionGranted
                                            ? l10n.holdToRecord
                                            : 'Tap to enable microphone')),
                                key: ValueKey('$_isRecording-$_audioFilePath'),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Submit button or Get Results button (for last question)
                if (_isSendingAudio)
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      onPressed: null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        foregroundColor: Colors.white,
                        elevation: 3,
                        disabledBackgroundColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.6),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                            height: 24,
                            width: 24,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2.5,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            l10n.sendingAudio,
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      onPressed: provider.state == InterviewState.submittingAnswer
                          ? null
                          : () async {
                              // Stop idle animations when submitting answer
                              _robotHeadKey.currentState?.stopIdle();

                              // If there's audio recorded, send it
                              if (_audioFilePath != null) {
                                await _sendAudioToEndpoint(_audioFilePath!);
                                // Clear recording state after sending
                                _discardRecording();
                              }
                              // If there's text answer, send it
                              else if (_answerController.text.trim().isNotEmpty) {
                                provider.submitAnswer(_answerController.text.trim());
                                _answerController.clear();
                              }
                              // Otherwise show text input dialog
                              else {
                                _showTemporaryTextInputDialog(context, provider, l10n);
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _audioFilePath != null
                            ? Colors.blue.shade600
                            : Theme.of(context).colorScheme.primary,
                        foregroundColor: Colors.white,
                        elevation: 3,
                        shadowColor: (_audioFilePath != null
                            ? Colors.blue
                            : Theme.of(context).colorScheme.primary).withValues(alpha: 0.5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: provider.state == InterviewState.submittingAnswer
                          ? const SizedBox(
                              height: 24,
                              width: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2.5,
                              ),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  provider.isLastQuestion
                                      ? Icons.emoji_events
                                      : (_audioFilePath != null
                                          ? Icons.arrow_forward_rounded
                                          : Icons.send_rounded),
                                  size: 22,
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  provider.isLastQuestion
                                      ? l10n.getResults
                                      : (_audioFilePath != null
                                          ? l10n.nextQuestion
                                          : l10n.submitAnswer),
                                  style: const TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Temporary method to show text input dialog (until voice recording is implemented)
  void _showTemporaryTextInputDialog(BuildContext context, InterviewProvider provider, dynamic l10n) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(l10n.yourAnswer),
        content: TextField(
          controller: _answerController,
          maxLines: 8,
          decoration: InputDecoration(
            hintText: l10n.typeYourAnswerHere,
            border: const OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text(l10n.cancel),
          ),
          ElevatedButton(
            onPressed: () {
              if (_answerController.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(l10n.pleaseEnterAnswer)),
                );
                return;
              }
              Navigator.pop(dialogContext);
              provider.submitAnswer(_answerController.text.trim());
              _answerController.clear();
            },
            child: Text(l10n.submitAnswer),
          ),
        ],
      ),
    );
  }

  Widget _buildEvaluationView(BuildContext context, InterviewProvider provider) {
    final eval = provider.latestEvaluation!;
    final l10n = AppLocalizations.of(context)!;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(l10n.answerEvaluation, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          // Overall score
          if (eval.overallQuestionScore != null) ...[
            Card(
              color: _getScoreColor(eval.overallQuestionScore!),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    const Icon(Icons.star, size: 40, color: Colors.white),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(l10n.score, style: const TextStyle(color: Colors.white70)),
                          Text(
                            '${eval.overallQuestionScore!.toStringAsFixed(1)}/100',
                            style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
          // Feedback
          if (eval.aiFeedback != null) ...[
            _buildSection(l10n.feedback, eval.aiFeedback!),
            const SizedBox(height: 16),
          ],
          // Score breakdown
          _buildScoreBreakdown(context, eval),
          const SizedBox(height: 24),
          // Continue button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                // Reset flags for next question (keep _modelLoaded and _wakeUpComplete as true)
                setState(() {
                  _hasSpeakingStarted = false;
                  _questionTapCount = 0;
                  _questionRevealed = false;
                  // Reset audio recording state
                  _audioFilePath = null;
                  _recordingDurationSeconds = 0;
                  _recordingStartTime = null;
                  // wakeUpComplete stays true - only plays once
                });
                provider.moveToNextQuestion();
              },
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
              child: Text(provider.currentQuestionIndex < provider.totalQuestions - 1
                  ? l10n.nextQuestion
                  : l10n.viewFinalResults),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinalScoreScreen(BuildContext context, InterviewProvider provider) {
    final score = provider.finalScore!;
    final l10n = AppLocalizations.of(context)!;
    final highScore = score.scores.overallScore >= 85;

    // Play result animation
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (score.passed) {
        _robotHeadKey.currentState?.playHappyAnimation();
      } else {
        _robotHeadKey.currentState?.playSadAnimation();
      }
    });

    return Scaffold(
      appBar: AppBar(title: Text(l10n.interviewComplete)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Animated icon with scale effect
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: 1.0),
              duration: const Duration(milliseconds: 800),
              curve: Curves.elasticOut,
              builder: (context, value, child) {
                return Transform.scale(
                  scale: value,
                  child: Icon(
                    score.passed ? Icons.check_circle : Icons.cancel,
                    size: 80,
                    color: score.passed ? Colors.green : Colors.red,
                  ),
                );
              },
            ),
            const SizedBox(height: 16),
            // Animated text
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: 1.0),
              duration: const Duration(milliseconds: 600),
              curve: Curves.easeIn,
              builder: (context, value, child) {
                return Opacity(
                  opacity: value,
                  child: Text(
                    score.passed ? l10n.congratulations : l10n.keepPracticing,
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                );
              },
            ),
            const SizedBox(height: 8),
            // Animated score with count-up effect
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: score.scores.overallScore),
              duration: const Duration(milliseconds: 1500),
              curve: Curves.easeOutCubic,
              builder: (context, value, child) {
                return Text(
                  l10n.overallScore(value.toStringAsFixed(1)),
                  style: TextStyle(
                    fontSize: 24,
                    color: highScore ? Colors.green.shade700 : null,
                    fontWeight: highScore ? FontWeight.bold : FontWeight.normal,
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
            // Confetti effect for high scores
            if (highScore)
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.0, end: 1.0),
                duration: const Duration(milliseconds: 1000),
                builder: (context, value, child) {
                  return Opacity(
                    opacity: value,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.amber.shade100, Colors.orange.shade100],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.orange.withValues(alpha: 0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.emoji_events, color: Colors.amber, size: 32),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Excellent performance! 🎉',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.amber.shade900,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            if (highScore) const SizedBox(height: 24),
            // Feedback with fade-in
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: 1.0),
              duration: const Duration(milliseconds: 800),
              builder: (context, value, child) {
                return Opacity(
                  opacity: value,
                  child: Text(score.finalFeedback, textAlign: TextAlign.center),
                );
              },
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                provider.reset();
                Navigator.popUntil(context, (route) => route.isFirst);
              },
              child: Text(l10n.backToTopics),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, String content) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text(content),
      ],
    );
  }

  Widget _buildScoreBreakdown(BuildContext context, eval) {
    final l10n = AppLocalizations.of(context)!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.scoreBreakdown, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            if (eval.fluencyScore != null) _buildScoreRow(l10n.fluency, eval.fluencyScore!),
            if (eval.grammarScore != null) _buildScoreRow(l10n.grammar, eval.grammarScore!),
            if (eval.vocabularyScore != null) _buildScoreRow(l10n.vocabulary_skill, eval.vocabularyScore!),
            if (eval.pronunciationScore != null) _buildScoreRow(l10n.pronunciation, eval.pronunciationScore!),
            if (eval.coherenceScore != null) _buildScoreRow(l10n.coherence, eval.coherenceScore!),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreRow(String label, double score) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(width: 120, child: Text(label)),
          Expanded(
            child: LinearProgressIndicator(value: score / 100, minHeight: 8),
          ),
          const SizedBox(width: 8),
          Text(score.toStringAsFixed(1)),
        ],
      ),
    );
  }

  Color _getScoreColor(double score) {
    if (score >= 90) return Colors.green;
    if (score >= 80) return Colors.lightGreen;
    if (score >= 70) return Colors.orange;
    if (score >= 60) return Colors.deepOrange;
    return Colors.red;
  }
}

