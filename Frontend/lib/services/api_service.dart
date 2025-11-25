import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:3000'; // Dirección para el emulador Android

  // Método para procesar mensajes de entrevista
  static Future<String> processInterviewMessage(String message, String chapterId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/practices/interview/process'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'message': message,
          'chapterId': chapterId,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['response'] ?? 'No response from server';
      } else {
        debugPrint('Error: ${response.statusCode}');
        debugPrint('Response: ${response.body}');
        return 'Error processing message. Please try again.';
      }
    } catch (e) {
      debugPrint('Exception: $e');
      return 'Network error. Please check your connection.';
    }
  }
}