import 'package:flutter_test/flutter_test.dart';

// Importar los archivos de prueba
import 'quiz_consistency_test.dart' as consistency;
import 'quiz_progress_integration_test.dart' as integration;

void main() {
  group('Quiz Bank Consistency Tests', () {
    // Ejecutar pruebas simplificadas
    consistency.main();
    integration.main();
  });
}