import 'package:flutter/foundation.dart';
import '../models/interview_topic.dart';
import '../models/interview_question.dart';
import '../models/interview_session.dart';
import '../services/interview_service.dart';
import '../utils/environment_config.dart';
import 'auth_provider.dart';
import 'progress_provider.dart';

enum InterviewState {
  idle,
  loadingTopics,
  topicsLoaded,
  startingSession,
  sessionActive,
  submittingAnswer,
  sessionCompleted,
  error,
}

class InterviewProvider with ChangeNotifier {
  final AuthProvider _authProvider;
  final ProgressProvider? _progressProvider;
  late final InterviewService _interviewService;

  // State
  InterviewState _state = InterviewState.idle;
  String? _errorMessage;

  // Data
  List<InterviewTopic> _topics = [];
  InterviewSession? _activeSession;
  int _currentQuestionIndex = 0;
  List<AnswerEvaluation> _evaluations = [];
  AnswerEvaluation? _latestEvaluation;
  SessionScore? _finalScore;
  DateTime? _questionStartTime;

  InterviewProvider(
    this._authProvider,
    this._progressProvider,
  ) {
    _interviewService = InterviewService(
      baseUrl: EnvironmentConfig.fullApiUrl,
      getAccessToken: () => _authProvider.token ?? '',
    );
  }
  
  // Getters
  InterviewState get state => _state;
  String? get errorMessage => _errorMessage;
  List<InterviewTopic> get topics => _topics;
  InterviewSession? get activeSession => _activeSession;
  int get currentQuestionIndex => _currentQuestionIndex;
  List<AnswerEvaluation> get evaluations => _evaluations;
  AnswerEvaluation? get latestEvaluation => _latestEvaluation;
  SessionScore? get finalScore => _finalScore;

  bool get hasActiveSession => _activeSession != null;
  bool get isSessionCompleted => _state == InterviewState.sessionCompleted;

  InterviewQuestion? get currentQuestion {
    if (_activeSession == null) return null;
    if (_currentQuestionIndex >= _activeSession!.questions.length) return null;
    return _activeSession!.questions[_currentQuestionIndex];
  }

  int get questionsAnswered => _evaluations.length;
  int get totalQuestions => _activeSession?.totalQuestions ?? 0;
  bool get isLastQuestion => _currentQuestionIndex >= totalQuestions - 1;
  double get progressPercentage {
    if (totalQuestions == 0) return 0;
    return (questionsAnswered / totalQuestions) * 100;
  }

  /// Load all available interview topics
  Future<void> loadTopics() async {
    _state = InterviewState.loadingTopics;
    _errorMessage = null;
    notifyListeners();

    try {
      _topics = await _interviewService.getTopics();
      _state = InterviewState.topicsLoaded;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _state = InterviewState.error;
      notifyListeners();
    }
  }

  /// Start a new interview session for a topic
  Future<void> startSession(String topicId) async {
    _state = InterviewState.startingSession;
    _errorMessage = null;
    notifyListeners();

    try {
      _activeSession = await _interviewService.startSession(topicId);
      _currentQuestionIndex = 0;
      _evaluations = [];
      _latestEvaluation = null;
      _finalScore = null;
      _questionStartTime = DateTime.now();
      _state = InterviewState.sessionActive;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _state = InterviewState.error;
      notifyListeners();
    }
  }

  /// Submit an answer for the current question
  Future<void> submitAnswer(String answerText) async {
    if (_activeSession == null || currentQuestion == null) {
      _errorMessage = 'No active session or question';
      _state = InterviewState.error;
      notifyListeners();
      return;
    }

    _state = InterviewState.submittingAnswer;
    _errorMessage = null;
    notifyListeners();

    try {
      // Calculate time spent
      int? timeSpent;
      if (_questionStartTime != null) {
        timeSpent = DateTime.now().difference(_questionStartTime!).inSeconds;
      }

      final response = await _interviewService.submitAnswer(
        sessionId: _activeSession!.sessionId,
        questionId: currentQuestion!.id,
        answerText: answerText,
        timeSpentSeconds: timeSpent,
      );

      // Store evaluation
      _latestEvaluation = response.evaluation;
      _evaluations.add(response.evaluation);
      _currentQuestionIndex = response.currentQuestionIndex;

      // Save progress automatically (if ProgressProvider is available)
      if (_progressProvider != null && _activeSession != null) {
        await _progressProvider.onInterviewAnswer(
          _activeSession!.topicId, // Use topicId as chapterId
          _currentQuestionIndex,
          answerText,
        );
      }

      if (response.isCompleted) {
        _state = InterviewState.sessionCompleted;
        // Load final score
        await _loadFinalScore(_activeSession!.sessionId);
      } else {
        _state = InterviewState.sessionActive;
        _questionStartTime = DateTime.now(); // Reset timer for next question
      }

      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _state = InterviewState.error;
      notifyListeners();
    }
  }

  /// Submit an answer with audio for the current question
  Future<void> submitAnswerWithAudio(List<int> audioBytes, String mimeType) async {
    if (_activeSession == null || currentQuestion == null) {
      _errorMessage = 'No active session or question';
      _state = InterviewState.error;
      notifyListeners();
      return;
    }

    _state = InterviewState.submittingAnswer;
    _errorMessage = null;
    notifyListeners();

    try {
      // Calculate time spent
      int? timeSpent;
      if (_questionStartTime != null) {
        timeSpent = DateTime.now().difference(_questionStartTime!).inSeconds;
      }

      final response = await _interviewService.submitAnswerWithAudio(
        sessionId: _activeSession!.sessionId,
        questionId: currentQuestion!.id,
        audioBytes: audioBytes,
        mimeType: mimeType,
        timeSpentSeconds: timeSpent,
      );

      // Store evaluation
      _latestEvaluation = response.evaluation;
      _evaluations.add(response.evaluation);
      _currentQuestionIndex = response.currentQuestionIndex;

      // Save progress automatically (if ProgressProvider is available)
      if (_progressProvider != null && _activeSession != null) {
        await _progressProvider.onInterviewAnswer(
          _activeSession!.topicId, // Use topicId as chapterId
          _currentQuestionIndex,
          'Audio answer', // Store placeholder text for audio answers
        );
      }

      if (response.isCompleted) {
        _state = InterviewState.sessionCompleted;
        // Load final score
        await _loadFinalScore(_activeSession!.sessionId);
      } else {
        _state = InterviewState.sessionActive;
        _questionStartTime = DateTime.now(); // Reset timer for next question
      }

      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _state = InterviewState.error;
      notifyListeners();
    }
  }

  /// Load final session score
  Future<void> _loadFinalScore(String sessionId) async {
    try {
      _finalScore = await _interviewService.getSessionScore(sessionId);
      notifyListeners();
    } catch (e) {
      // Don't change state, just log error
      _errorMessage = 'Failed to load final score: $e';
      if (kDebugMode) {
        debugPrint('Error loading final score: $e');
      }
    }
  }

  /// Get final score manually (if needed)
  Future<void> loadFinalScore(String sessionId) async {
    _state = InterviewState.loadingTopics; // Reuse loading state
    _errorMessage = null;
    notifyListeners();

    try {
      _finalScore = await _interviewService.getSessionScore(sessionId);
      _state = InterviewState.sessionCompleted;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _state = InterviewState.error;
      notifyListeners();
    }
  }

  /// Reset state and clear active session
  void reset() {
    _state = InterviewState.idle;
    _errorMessage = null;
    _activeSession = null;
    _currentQuestionIndex = 0;
    _evaluations = [];
    _latestEvaluation = null;
    _finalScore = null;
    _questionStartTime = null;
    notifyListeners();
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    if (_state == InterviewState.error) {
      _state = InterviewState.idle;
    }
    notifyListeners();
  }

  /// Get topic by ID
  InterviewTopic? getTopicById(String topicId) {
    try {
      return _topics.firstWhere((topic) => topic.id == topicId);
    } catch (e) {
      return null;
    }
  }

  /// Move to next question (after viewing evaluation)
  void moveToNextQuestion() {
    if (_state == InterviewState.sessionActive) {
      _latestEvaluation = null;
      _questionStartTime = DateTime.now();
      notifyListeners();
    }
  }

  /// Abandon/cancel the current active session
  Future<void> abandonSession() async {
    if (_activeSession == null) {
      _errorMessage = 'No active session to abandon';
      _state = InterviewState.error;
      notifyListeners();
      return;
    }

    _state = InterviewState.loadingTopics; // Reuse loading state
    _errorMessage = null;
    notifyListeners();

    try {
      await _interviewService.abandonSession(_activeSession!.sessionId);

      // Reset state after successful abandonment
      _activeSession = null;
      _currentQuestionIndex = 0;
      _evaluations = [];
      _latestEvaluation = null;
      _finalScore = null;
      _questionStartTime = null;
      _state = InterviewState.idle;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _state = InterviewState.error;
      notifyListeners();
    }
  }

  /// Resume an existing active session for a topic
  Future<void> resumeSession(String topicId) async {
    _state = InterviewState.startingSession;
    _errorMessage = null;
    notifyListeners();

    try {
      final existingSession = await _interviewService.getActiveSession(topicId);

      if (existingSession == null) {
        throw Exception('No active session found for this topic');
      }

      _activeSession = existingSession;
      _currentQuestionIndex = existingSession.currentQuestionIndex;
      _evaluations = [];
      _latestEvaluation = null;
      _finalScore = null;
      _questionStartTime = DateTime.now();
      _state = InterviewState.sessionActive;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _state = InterviewState.error;
      notifyListeners();
    }
  }

  /// Check if there's an active session for a topic (without changing state)
  Future<InterviewSession?> checkActiveSession(String topicId) async {
    try {
      return await _interviewService.getActiveSession(topicId);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Error checking active session: $e');
      }
      return null;
    }
  }

  /// Abandon active session and start a new one
  Future<void> abandonAndRestart(String topicId) async {
    try {
      // First check if there's an active session
      final activeSession = await _interviewService.getActiveSession(topicId);

      if (activeSession != null) {
        // Abandon the active session
        await _interviewService.abandonSession(activeSession.sessionId);

        // Reset local state
        _activeSession = null;
        _currentQuestionIndex = 0;
        _evaluations = [];
        _latestEvaluation = null;
        _finalScore = null;
        _questionStartTime = null;
      }

      // Now start a new session
      await startSession(topicId);
    } catch (e) {
      _errorMessage = e.toString();
      _state = InterviewState.error;
      notifyListeners();
    }
  }
}
