import 'package:flutter/material.dart';
import 'package:flutter_3d_controller/flutter_3d_controller.dart';
import 'dart:math';
import 'dart:async';

/// 3D animated donkey widget for interview screens
///
/// Animation flow:
/// 1. WakeUp (7.6s) - Only on first question
/// 2. Speaking (random, loops until TTS ends)
/// 3. Idle (random loop while waiting for answer)
/// 4. Result: Happy (good score) / Sad (bad score)

// Animation constants with durations
class DonkeyAnimations {
  // Intro animation
  static const String wakeUp = 'm_Donkey_wakeUp';
  static const Duration wakeUpDuration = Duration(milliseconds: 7600);

  // Idle animations (mantener tranquilo)
  static const List<String> idle = [
    'm_Donkey_breathe8',
    'm_Donkey_stopWatch_StrechLoop',
    'm_Donkey_wthr_wind',
    'm_Donkey_idle5',
    'm_Donkey_idle6',
    'm_Donkey_breathe1',
  ];
  static const List<Duration> idleDurations = [
    Duration(milliseconds: 2530),
    Duration(milliseconds: 1530),
    Duration(milliseconds: 5800),
    Duration(milliseconds: 10030),
    Duration(milliseconds: 4900),
    Duration(milliseconds: 6030),
  ];

  // Speaking animations
  static const List<String> speaking = [
    'm_Donkey_gift_flute',
    'm_Donkey_StopPoking2',
    'm_Donkey_int_footTap2',
  ];
  static const List<Duration> speakingDurations = [
    Duration(milliseconds: 4660),
    Duration(milliseconds: 5360),
    Duration(milliseconds: 6230),
  ];

  // Result animations
  static const String sad = 'm_Donkey_food_hungry_loop';
  static const Duration sadDuration = Duration(milliseconds: 1330);

  static const String happy = 'm_Donkey_wakeAlarm5';
  static const Duration happyDuration = Duration(milliseconds: 3030);

  // Random selection helpers
  static String getRandomIdle() {
    return idle[Random().nextInt(idle.length)];
  }

  static Duration getIdleDuration(String animation) {
    final index = idle.indexOf(animation);
    return index >= 0 ? idleDurations[index] : Duration(seconds: 3);
  }

  static String getRandomSpeaking() {
    return speaking[Random().nextInt(speaking.length)];
  }

  static Duration getSpeakingDuration(String animation) {
    final index = speaking.indexOf(animation);
    return index >= 0 ? speakingDurations[index] : Duration(seconds: 5);
  }
}

class InterviewRobotHead extends StatefulWidget {
  /// Callback when the 3D model is loaded and ready
  final VoidCallback? onModelLoaded;

  /// Callback when wakeUp animation completes
  final VoidCallback? onWakeUpComplete;

  const InterviewRobotHead({
    super.key,
    this.onModelLoaded,
    this.onWakeUpComplete,
  });

  @override
  State<InterviewRobotHead> createState() => InterviewRobotHeadState();
}

class InterviewRobotHeadState extends State<InterviewRobotHead> {
  late Flutter3DController _controller;

  static bool _hasPlayedWakeUp = false; // Track if wakeUp has been played

  Timer? _animationTimer;
  bool _isSpeaking = false;
  bool _isIdling = false;
  bool _isModelLoaded = false;

  @override
  void initState() {
    super.initState();

    // Initialize the 3D controller
    _controller = Flutter3DController();

    // Listen to model loaded event
    _controller.onModelLoaded.addListener(_onModelLoadedListener);
  }

  void _onModelLoadedListener() {
    if (_controller.onModelLoaded.value && !_isModelLoaded) {
      _isModelLoaded = true;

      // Wait for model to fully render before setting camera
      Future.delayed(const Duration(milliseconds: 500), () {
        if (!mounted) return;

        // Set initial camera position
        // Target: center of model
        _controller.setCameraTarget(0, 0, 0);

        // Camera orbit: theta=193°, phi=90°, radius=6.80
        _controller.setCameraOrbit(193, 90, 6.80);
      });

      // Notify parent that model is ready
      widget.onModelLoaded?.call();

      // Start wakeUp animation after model loads (only on first question)
      if (!_hasPlayedWakeUp) {
        _playWakeUpAnimation();
      }
    }
  }

  @override
  void dispose() {
    _animationTimer?.cancel();
    _controller.onModelLoaded.removeListener(_onModelLoadedListener);
    super.dispose();
  }

  /// Play wakeUp animation (only once at start of interview)
  void _playWakeUpAnimation() {
    if (!mounted) return;

    debugPrint('🎬 Playing wakeUp animation (7.6s)...');

    // Play animation without looping (loopCount: 1)
    _controller.playAnimation(
      animationName: DonkeyAnimations.wakeUp,
      loopCount: 1,
    );

    // After wakeUp completes, notify parent
    Future.delayed(DonkeyAnimations.wakeUpDuration, () {
      if (mounted) {
        _hasPlayedWakeUp = true;
        debugPrint('✅ WakeUp animation complete!');
        widget.onWakeUpComplete?.call();
      }
    });
  }

  /// Start speaking animation with TTS
  /// Will loop speaking animations until stopSpeaking() is called
  void playSpeakingAnimation() {
    if (!mounted || !_isModelLoaded) return;

    _animationTimer?.cancel();
    _isSpeaking = true;
    _isIdling = false;

    debugPrint('🎙️ Starting speaking animation loop...');
    _playNextSpeakingAnimation();
  }

  void _playNextSpeakingAnimation() {
    if (!mounted || !_isSpeaking) return;

    final animation = DonkeyAnimations.getRandomSpeaking();
    final duration = DonkeyAnimations.getSpeakingDuration(animation);

    debugPrint('🎙️ Playing speaking animation: $animation (${duration.inMilliseconds}ms)');

    // Play animation once (loopCount: 1)
    _controller.playAnimation(
      animationName: animation,
      loopCount: 1,
    );

    // Schedule next speaking animation
    _animationTimer = Timer(duration, () {
      if (mounted && _isSpeaking) {
        _playNextSpeakingAnimation();
      }
    });
  }

  /// Stop speaking and start idle animations
  void stopSpeaking() {
    if (!mounted) return;

    _animationTimer?.cancel();
    _isSpeaking = false;
    _isIdling = true;

    debugPrint('🛑 Stopped speaking, starting idle loop...');
    _playNextIdleAnimation();
  }

  void _playNextIdleAnimation() {
    if (!mounted || !_isIdling) return;

    final animation = DonkeyAnimations.getRandomIdle();
    final duration = DonkeyAnimations.getIdleDuration(animation);

    debugPrint('😐 Playing idle animation: $animation (${duration.inMilliseconds}ms)');

    // Play animation once (loopCount: 1)
    _controller.playAnimation(
      animationName: animation,
      loopCount: 1,
    );

    // Schedule next idle animation
    _animationTimer = Timer(duration, () {
      if (mounted && _isIdling) {
        _playNextIdleAnimation();
      }
    });
  }

  /// Stop idle animations (when user submits answer)
  void stopIdle() {
    if (!mounted) return;

    _animationTimer?.cancel();
    _isIdling = false;
    debugPrint('⏸️ Stopped idle animations');
  }

  /// Play happy animation (good score)
  void playHappyAnimation() {
    if (!mounted || !_isModelLoaded) return;

    _animationTimer?.cancel();
    _isSpeaking = false;
    _isIdling = false;

    debugPrint('😄 Playing happy animation!');

    // Play happy animation once
    _controller.playAnimation(
      animationName: DonkeyAnimations.happy,
      loopCount: 1,
    );

    // Loop happy animation
    _animationTimer = Timer(DonkeyAnimations.happyDuration, () {
      if (mounted) {
        playHappyAnimation(); // Loop
      }
    });
  }

  /// Play sad animation (bad score)
  void playSadAnimation() {
    if (!mounted || !_isModelLoaded) return;

    _animationTimer?.cancel();
    _isSpeaking = false;
    _isIdling = false;

    debugPrint('😢 Playing sad animation...');

    // Play sad animation once
    _controller.playAnimation(
      animationName: DonkeyAnimations.sad,
      loopCount: 1,
    );

    // Loop sad animation
    _animationTimer = Timer(DonkeyAnimations.sadDuration, () {
      if (mounted) {
        playSadAnimation(); // Loop
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final height = constraints.maxHeight;

        return Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.blue.shade50.withValues(alpha: 0.2),
                Colors.purple.shade50.withValues(alpha: 0.2),
              ],
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Flutter3DViewer(
              controller: _controller,
              src: 'assets/models/talking_donkey.glb',

              // Enable touch so user can rotate model
              enableTouch: true,

              // Prevent gesture issues
              activeGestureInterceptor: true,

              // Loading indicator
              progressBarColor: Colors.blue,

              // Callbacks
              onProgress: (double progress) {
                debugPrint('⏳ Model loading: ${(progress * 100).toStringAsFixed(1)}%');
              },
              onLoad: (String modelAddress) {
                debugPrint('✅ Model viewer loaded: $modelAddress');
              },
              onError: (String error) {
                debugPrint('❌ Model viewer error: $error');
              },
            ),
          ),
        );
      },
    );
  }
}

