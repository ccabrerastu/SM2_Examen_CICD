import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/interview_topic.dart';
import '../models/interview_session.dart';
import '../utils/environment_config.dart';

class InterviewService {
  final String baseUrl;
  final String Function() getAccessToken;

  InterviewService({
    required this.baseUrl,
    required this.getAccessToken,
  });

  Map<String, String> _getHeaders() {
    final token = getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
      'Origin': EnvironmentConfig.apiBaseUrl,
      'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    };
  }

  /// Get all available interview topics
  Future<List<InterviewTopic>> getTopics() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/interview/topics'),
        headers: _getHeaders(),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        final topics = (data['topics'] as List)
            .map((topic) => InterviewTopic.fromJson(topic as Map<String, dynamic>))
            .toList();
        return topics;
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized - Please login again');
      } else {
        throw Exception('Failed to load topics: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching topics: $e');
    }
  }

  /// Start a new interview session
  Future<InterviewSession> startSession(String topicId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/interview/sessions/start'),
        headers: _getHeaders(),
        body: json.encode({'topicId': topicId}),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        return InterviewSession.fromJson(data);
      } else if (response.statusCode == 400) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        throw Exception(data['message'] ?? 'Bad request - Cannot start session');
      } else if (response.statusCode == 404) {
        throw Exception('Topic not found or inactive');
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized - Please login again');
      } else {
        throw Exception('Failed to start session: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error starting session: $e');
    }
  }

  /// Submit an answer for evaluation
  Future<SubmitAnswerResponse> submitAnswer({
    required String sessionId,
    required String questionId,
    required String answerText,
    int? timeSpentSeconds,
  }) async {
    try {
      final body = {
        'sessionId': sessionId,
        'questionId': questionId,
        'answerText': answerText,
        if (timeSpentSeconds != null) 'timeSpentSeconds': timeSpentSeconds,
      };

      final response = await http.post(
        Uri.parse('$baseUrl/interview/sessions/submit-answer'),
        headers: _getHeaders(),
        body: json.encode(body),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        return SubmitAnswerResponse.fromJson(data);
      } else if (response.statusCode == 400) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        throw Exception(data['message'] ?? 'Invalid session or question');
      } else if (response.statusCode == 404) {
        throw Exception('Session or question not found');
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized - Please login again');
      } else {
        throw Exception('Failed to submit answer: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error submitting answer: $e');
    }
  }

  /// Submit an answer with audio for evaluation
  Future<SubmitAnswerResponse> submitAnswerWithAudio({
    required String sessionId,
    required String questionId,
    required List<int> audioBytes,
    required String mimeType,
    int? timeSpentSeconds,
  }) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/interview/sessions/submit-answer-audio'),
      );

      // Add headers
      request.headers.addAll(_getHeaders());

      // Add form fields
      request.fields['sessionId'] = sessionId;
      request.fields['questionId'] = questionId;
      if (timeSpentSeconds != null) {
        request.fields['timeSpentSeconds'] = timeSpentSeconds.toString();
      }

      // Add audio file
      request.files.add(
        http.MultipartFile.fromBytes(
          'audio',
          audioBytes,
          filename: 'answer_${DateTime.now().millisecondsSinceEpoch}.m4a',
        ),
      );

      // Send request
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        return SubmitAnswerResponse.fromJson(data);
      } else if (response.statusCode == 400) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        throw Exception(data['message'] ?? 'Invalid session or audio format');
      } else if (response.statusCode == 404) {
        throw Exception('Session or question not found');
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized - Please login again');
      } else if (response.statusCode == 413) {
        throw Exception('Audio file too large');
      } else {
        throw Exception('Failed to submit audio: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error submitting audio answer: $e');
    }
  }

  /// Get final session score and feedback
  Future<SessionScore> getSessionScore(String sessionId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/interview/sessions/$sessionId/score'),
        headers: _getHeaders(),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        return SessionScore.fromJson(data);
      } else if (response.statusCode == 400) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        throw Exception(data['message'] ?? 'Session not completed yet');
      } else if (response.statusCode == 404) {
        throw Exception('Session not found');
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized - Please login again');
      } else {
        throw Exception('Failed to get session score: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting session score: $e');
    }
  }

  /// Abandon/cancel an active session
  Future<void> abandonSession(String sessionId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/interview/sessions/$sessionId/abandon'),
        headers: _getHeaders(),
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        // Session abandoned successfully
        return;
      } else if (response.statusCode == 404) {
        throw Exception('Session not found');
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized - Please login again');
      } else {
        throw Exception('Failed to abandon session: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error abandoning session: $e');
    }
  }

  /// Get active session for a topic (if exists)
  Future<InterviewSession?> getActiveSession(String topicId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/interview/sessions/active?topicId=$topicId'),
        headers: _getHeaders(),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        return InterviewSession.fromJson(data);
      } else if (response.statusCode == 404) {
        // No active session found
        return null;
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized - Please login again');
      } else {
        return null;
      }
    } catch (e) {
      // If there's an error, return null (no active session)
      return null;
    }
  }
}
