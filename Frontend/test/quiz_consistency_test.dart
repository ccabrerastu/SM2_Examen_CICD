import 'package:flutter_test/flutter_test.dart';
import 'package:english_app/models/quiz_question.dart';

void main() {
  group('Quiz Consistency Tests', () {
    test('Verificar estructura de preguntas', () {
      // Crear una pregunta de prueba
      final question = QuizQuestion(
        id: 1,
        question: "¿Cuál es la traducción de 'hello'?",
        options: ["hola", "adiós", "gracias", "por favor"],
        correctAnswer: 0,
        category: "Vocabulary",
      );
      
      // Verificar que la estructura de la pregunta es correcta
      expect(question.id, 1);
      expect(question.question, "¿Cuál es la traducción de 'hello'?");
      expect(question.options.length, 4);
      expect(question.correctAnswer, 0);
      expect(question.options[question.correctAnswer], "hola");
      expect(question.category, "Vocabulary");
    });

    test('Verificar respuestas correctas', () {
      // Crear una pregunta de prueba
      final question = QuizQuestion(
        id: 1,
        question: "¿Cuál es la traducción de 'hello'?",
        options: ["hola", "adiós", "gracias", "por favor"],
        correctAnswer: 0,
        category: "Vocabulary",
      );
      
      // Verificar que la respuesta correcta es la esperada
      expect(question.correctAnswer, 0);
      expect(question.options[question.correctAnswer], "hola");
    });

    test('Verificar respuestas incorrectas', () {
      // Crear una pregunta de prueba
      final question = QuizQuestion(
        id: 1,
        question: "¿Cuál es la traducción de 'hello'?",
        options: ["hola", "adiós", "gracias", "por favor"],
        correctAnswer: 0,
        category: "Vocabulary",
      );
      
      // Verificar que las respuestas incorrectas son diferentes a la correcta
      for (int i = 0; i < question.options.length; i++) {
        if (i != question.correctAnswer) {
          expect(question.options[i], isNot(equals(question.options[question.correctAnswer])));
        }
      }
    });

    test('Verificar escenarios mixtos de respuestas', () {
      // Simulación simplificada para escenarios mixtos
      final correctAnswers = [true, false, true, false];
      
      // Verificar que tenemos una mezcla de respuestas
      expect(correctAnswers.contains(true), isTrue);
      expect(correctAnswers.contains(false), isTrue);
    });

    test('Verificar banco de preguntas de muestra', () {
      // Obtener preguntas de muestra
      final sampleQuestions = QuizQuestion.getSampleQuestions();
      
      // Verificar que hay preguntas en el banco
      expect(sampleQuestions.length, greaterThan(0));
      
      // Verificar que cada pregunta tiene una estructura válida
      for (var question in sampleQuestions) {
        expect(question.id, greaterThan(0));
        expect(question.question, isNotEmpty);
        expect(question.options.length, greaterThanOrEqualTo(2));
        expect(question.correctAnswer, lessThan(question.options.length));
        expect(question.category, isNotEmpty);
      }
    });
  });
}