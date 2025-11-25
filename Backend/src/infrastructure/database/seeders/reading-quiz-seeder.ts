import { DataSource } from 'typeorm';
import { ReadingContent } from '../../../domain/entities/reading-content.entity';
import {
  ReadingQuiz,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
} from '../../../domain/entities/reading-quiz.entity';
import { v4 as uuidv4 } from 'uuid';

export async function seedReadingQuizzes(dataSource: DataSource): Promise<void> {
  const readingContentRepository = dataSource.getRepository(ReadingContent);
  const readingQuizRepository = dataSource.getRepository(ReadingQuiz);

  // Obtener todos los contenidos de lectura
  const readingContents = await readingContentRepository.find();

  if (readingContents.length === 0) {
    console.log('No hay contenidos de lectura para asociar quizzes');
    return;
  }

  // Crear quizzes para cada contenido de lectura
  for (const content of readingContents) {
    const quiz = new ReadingQuiz();
    quiz.readingContentId = content.id;
    quiz.title = `Quiz sobre ${content.title}`;
    quiz.description = `Comprueba tu comprensión de la lectura "${content.title}"`;
    quiz.passingScore = 70;
    quiz.timeLimit = 300; // 5 minutos

    // Crear preguntas de opción múltiple
    const multipleChoiceQuestions = [
      new MultipleChoiceQuestion({
        id: uuidv4(),
        questionText: '¿Cuál es el tema principal de esta lectura?',
        options: [
          'Desarrollo de software',
          'Inteligencia artificial',
          'Aprendizaje de inglés',
          'Tecnologías web',
        ],
        correctAnswer: 2,
        explanation:
          'El tema principal es el aprendizaje de inglés como se menciona en el primer párrafo.',
        points: 10,
      }),
      new MultipleChoiceQuestion({
        id: uuidv4(),
        questionText: '¿Qué concepto se explica en el segundo párrafo?',
        options: [
          'Gramática avanzada',
          'Vocabulario técnico',
          'Pronunciación correcta',
          'Comprensión lectora',
        ],
        correctAnswer: 1,
        explanation: 'El segundo párrafo se enfoca en explicar el vocabulario técnico.',
        points: 10,
      }),
    ];

    // Crear preguntas de verdadero/falso
    const trueFalseQuestions = [
      new TrueFalseQuestion({
        id: uuidv4(),
        questionText: 'La lectura menciona que el inglés es el idioma más hablado del mundo.',
        correctAnswer: false,
        explanation: 'La lectura no hace esta afirmación específica.',
        points: 5,
      }),
      new TrueFalseQuestion({
        id: uuidv4(),
        questionText: 'El texto recomienda practicar inglés diariamente.',
        correctAnswer: true,
        explanation: 'El texto menciona la importancia de la práctica diaria para mejorar.',
        points: 5,
      }),
    ];

    // Combinar todas las preguntas
    quiz.questions = [...multipleChoiceQuestions, ...trueFalseQuestions];
    quiz.totalQuestions = quiz.questions.length;

    // Guardar el quiz
    await readingQuizRepository.save(quiz);
    console.log(`Quiz creado para la lectura: ${content.title}`);
  }

  console.log('Seeding de ReadingQuiz completado');
}
