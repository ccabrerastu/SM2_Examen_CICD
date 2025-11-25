// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Spanish Castilian (`es`).
class AppLocalizationsEs extends AppLocalizations {
  AppLocalizationsEs([String locale = 'es']) : super(locale);

  @override
  String get appTitle => 'TECHSPEAK';

  @override
  String get login => 'Iniciar Sesión';

  @override
  String get email => 'Correo electrónico';

  @override
  String get password => 'Contraseña';

  @override
  String get loginButton => 'Entrar';

  @override
  String get loginWithGoogle => 'Iniciar con Google';

  @override
  String get loginWithApple => 'Iniciar con Apple';

  @override
  String get emailRequired => 'El correo es requerido';

  @override
  String get emailInvalid => 'Ingrese un correo válido';

  @override
  String get passwordRequired => 'La contraseña es requerida';

  @override
  String get passwordTooShort =>
      'La contraseña debe tener al menos 12 caracteres';

  @override
  String get hi => 'Hola';

  @override
  String get continueText => 'Continuar';

  @override
  String get vocabulary => 'Vocabulario';

  @override
  String get reading => 'Lectura';

  @override
  String get readingPracticeSubtitle => 'Practica las palabras';

  @override
  String get interview => 'Entrevista';

  @override
  String get chooseYourPreferredTopic => 'Elige tu tema preferido';

  @override
  String get home => 'Inicio';

  @override
  String get documents => 'Documentos';

  @override
  String get book => 'Libro';

  @override
  String get help => 'Ayuda';

  @override
  String get settings => 'Configuración';

  @override
  String get theme => 'Tema';

  @override
  String get language => 'Idioma';

  @override
  String get lightTheme => 'Claro';

  @override
  String get darkTheme => 'Oscuro';

  @override
  String get colorPalette => 'Paleta de Colores';

  @override
  String get system => 'Sistema';

  @override
  String get notifications => 'Notificaciones';

  @override
  String get notificationsEnabled => 'Notificaciones activadas';

  @override
  String get notificationsDisabled => 'Notificaciones desactivadas';

  @override
  String get logout => 'Cerrar Sesión';

  @override
  String get selectLanguage => 'Seleccionar Idioma';

  @override
  String get selectColorPalette => 'Seleccionar Paleta de Colores';

  @override
  String get confirmLogout => 'Confirmar Cerrar Sesión';

  @override
  String get logoutConfirmation =>
      '¿Estás seguro de que quieres cerrar sesión?';

  @override
  String get cancel => 'Cancelar';

  @override
  String get welcomeBack => '¡Bienvenido de vuelta!';

  @override
  String get yourLearningPath => 'Tu Ruta de Aprendizaje';

  @override
  String get learningSlogan => 'Aprende • Practica • Domina';

  @override
  String get signingYouIn => 'Iniciando sesión...';

  @override
  String get connectingWithGoogle => 'Conectando con Google...';

  @override
  String get connectingWithApple => 'Conectando con Apple...';

  @override
  String get loadingExperience => 'Cargando tu experiencia de aprendizaje...';

  @override
  String get initializingExperience =>
      'Inicializando tu experiencia de aprendizaje...';

  @override
  String get or => 'O';

  @override
  String get user => 'Usuario';

  @override
  String get loading => 'Cargando...';

  @override
  String livesRemaining(int lives) {
    return '$lives vidas restantes';
  }

  @override
  String get chapterProgress => 'Cap 4/5';

  @override
  String get software => 'Software';

  @override
  String get databases => 'Bases de Datos';

  @override
  String navigatingToSection(String section) {
    return 'Navegando a la sección $section...';
  }

  @override
  String get emailPasswordRequired =>
      'El correo y la contraseña son requeridos';

  @override
  String get invalidCredentials =>
      'Credenciales inválidas. Verifica tu correo y contraseña.';

  @override
  String get googleSignInFailed => 'Error al iniciar sesión con Google';

  @override
  String get appleSignInFailed => 'Error al iniciar sesión con Apple';

  @override
  String get errorDuringLogout => 'Error al cerrar sesión';

  @override
  String get errorCheckingAuth =>
      'Error al verificar el estado de autenticación';

  @override
  String get errorInMockLogin => 'Error en el inicio de sesión de prueba';

  @override
  String get comingSoon => 'Próximamente';

  @override
  String sectionTitle(String title) {
    return 'Sección $title';
  }

  @override
  String get selectCustomColor => 'Seleccionar Color Personalizado';

  @override
  String get hue => 'Matiz';

  @override
  String get saturation => 'Saturación';

  @override
  String get lightness => 'Luminosidad';

  @override
  String get quickColors => 'Colores Rápidos';

  @override
  String get selectColor => 'Seleccionar Color';

  @override
  String get quiz => 'Quiz';

  @override
  String get question => 'Pregunta';

  @override
  String get submit => 'Enviar';

  @override
  String get nextQuestion => 'Siguiente Pregunta';

  @override
  String get score => 'Puntuación';

  @override
  String get points => 'puntos';

  @override
  String get completeePreviousEpisode =>
      'Completa el episodio anterior para desbloquear este';

  @override
  String get episodeCompleted => 'Episodio completado - Toca para repetir';

  @override
  String get continueEpisode => 'Continuar episodio';

  @override
  String get completePreviousEpisode =>
      'Completa el episodio anterior para desbloquear';

  @override
  String playingEpisode(String episodeTitle) {
    return 'Reproduciendo $episodeTitle';
  }

  @override
  String get dontHaveAccount => '¿No tienes una cuenta?';

  @override
  String get signUp => 'Registrarse';

  @override
  String get createAccount => 'Crear Cuenta';

  @override
  String get joinUsSlogan =>
      'Únete para comenzar tu viaje con el inglés técnico';

  @override
  String get fullName => 'Nombre Completo';

  @override
  String get enterFullName => 'Ingresa tu nombre completo';

  @override
  String get confirmPassword => 'Confirmar Contraseña';

  @override
  String get enterConfirmPassword => 'Confirma tu contraseña';

  @override
  String get acceptTerms =>
      'Acepto los Términos de Servicio y Política de Privacidad';

  @override
  String get pleaseEnterName => 'Por favor ingresa tu nombre';

  @override
  String get nameTooShort => 'El nombre debe tener al menos 2 caracteres';

  @override
  String get passwordsDontMatch => 'Las contraseñas no coinciden';

  @override
  String get pleaseAcceptTerms => 'Por favor acepta los términos y condiciones';

  @override
  String get alreadyHaveAccount => '¿Ya tienes una cuenta?';

  @override
  String get signIn => 'Iniciar Sesión';

  @override
  String get creatingAccount => 'Creando tu cuenta...';

  @override
  String get register => 'Registrarse';

  @override
  String get signUpWithGoogle => 'Registrarse con Google';

  @override
  String get signUpWithApple => 'Registrarse con Apple';

  @override
  String get creatingAccountWithGoogle => 'Creando cuenta con Google...';

  @override
  String get creatingAccountWithApple => 'Creando cuenta con Apple...';

  @override
  String get forgotPassword => '¿Olvidaste tu contraseña?';

  @override
  String get checkYourEmail => 'Revisa tu correo';

  @override
  String get forgotPasswordSubtitle =>
      '¡No te preocupes! Ingresa tu dirección de correo y te enviaremos un enlace para restablecer tu contraseña.';

  @override
  String get emailSentMessage =>
      'Hemos enviado un enlace para restablecer tu contraseña a tu dirección de correo. Por favor revisa tu bandeja de entrada y sigue las instrucciones.';

  @override
  String get emailAddress => 'Dirección de correo';

  @override
  String get enterEmailAddress => 'Ingresa tu dirección de correo';

  @override
  String get sendResetLink => 'Enviar enlace de restablecimiento';

  @override
  String get backToLogin => 'Volver al inicio de sesión';

  @override
  String get emailSent => 'Correo enviado';

  @override
  String get sendingResetLink => 'Enviando enlace de restablecimiento...';

  @override
  String get emailSentSuccessfully =>
      '¡Correo de restablecimiento enviado exitosamente!';

  @override
  String get resendEmail => 'Reenviar correo';

  @override
  String get openEmailApp => 'Abrir aplicación de correo';

  @override
  String get resetLinkSentAgain =>
      '¡Enlace de restablecimiento enviado nuevamente!';

  @override
  String get openingEmailApp => 'Abriendo aplicación de correo...';

  @override
  String get forgotPasswordQuestion => '¿Olvidaste tu contraseña?';

  @override
  String get rememberSession => 'Recordar sesión';

  @override
  String get folders => 'Carpetas';

  @override
  String get errorLoadingLives => 'Error loading lives';

  @override
  String get retry => 'Reintentar';

  @override
  String get noLivesRemaining => 'No lives remaining!';

  @override
  String get livesResetTomorrow => 'Las vidas se reinician mañana';

  @override
  String get nextResetTomorrow => 'Próximo reinicio mañana';

  @override
  String get refresh => 'Actualizar';

  @override
  String get episodeRoadmap => 'Mapa de Episodios';

  @override
  String get repeatChapterTitle => 'Repetir Capítulo';

  @override
  String get repeatChapterWarning =>
      'Ya has completado este capítulo. Repetirlo no afectará tu puntuación actual, ¡pero es una excelente manera de reforzar tu aprendizaje!';

  @override
  String currentScore(int score) {
    return 'Puntuación actual: $score puntos';
  }

  @override
  String get repeatChapterBenefit =>
      '¡La práctica lleva a la perfección! Aprovecha esta oportunidad para fortalecer tu conocimiento.';

  @override
  String get repeatChapter => 'Repetir Capítulo';

  @override
  String chapterResetForRepetition(String chapterTitle) {
    return 'El capítulo \'$chapterTitle\' ha sido reiniciado para repetición. ¡Tu puntuación original se mantiene!';
  }

  @override
  String get progress => 'Progreso';

  @override
  String get episodeContent => 'Contenido del Episodio';

  @override
  String get episodeContentPlaceholder =>
      'El contenido del episodio se mostrará aquí';

  @override
  String get replayEpisode => 'Repetir Episodio';

  @override
  String get startEpisode => 'Iniciar Episodio';

  @override
  String startingEpisode(String episodeTitle) {
    return 'Iniciando $episodeTitle...';
  }

  @override
  String get vocabularyChaptersTitle => 'Capítulos de Vocabulario';

  @override
  String get loadingVocabularyChapters =>
      'Cargando capítulos de vocabulario...';

  @override
  String get errorLoadingChapters => 'Error al cargar capítulos';

  @override
  String get unknownError => 'Ocurrió un error desconocido';

  @override
  String get dismiss => 'Descartar';

  @override
  String get tryAgain => 'Intentar de Nuevo';

  @override
  String get noChaptersAvailable => 'No hay capítulos disponibles';

  @override
  String get noChaptersDescription =>
      'Vuelve más tarde para ver nuevos capítulos de vocabulario';

  @override
  String get yourProgress => 'Tu Progreso';

  @override
  String get chaptersCompleted => 'Capítulos Completados';

  @override
  String get unlocked => 'Desbloqueado';

  @override
  String get locked => 'Bloqueado';

  @override
  String get completed => 'Completado';

  @override
  String get continue_ => 'Continuar';

  @override
  String get start => 'Comenzar';

  @override
  String get chapterLocked =>
      'Este capítulo está bloqueado. Completa el capítulo anterior primero.';

  @override
  String chapterLockedDescription(int previousChapter) {
    return 'Completa el capítulo $previousChapter para desbloquear este capítulo';
  }

  @override
  String get understood => 'Entendido';

  @override
  String get chapterCompleted => '¡Has completado este capítulo!';

  @override
  String get chapterCompletedDescription =>
      'Ya completaste este capítulo. Puedes repasarlo cuando quieras.';

  @override
  String completedOn(String date) {
    return 'Completado el $date';
  }

  @override
  String get close => 'Cerrar';

  @override
  String get reviewChapter => 'Repasar Capítulo';

  @override
  String get noLivesTitle => 'Sin Vidas Disponibles';

  @override
  String get noLivesMessage =>
      'No te quedan vidas. Por favor espera al siguiente reinicio.';

  @override
  String nextResetAt(String time) {
    return 'Próximo reinicio a las $time';
  }

  @override
  String get evaluationDetails => 'Detalles de la Evaluación';

  @override
  String get completedDate => 'Fecha de Finalización';

  @override
  String get attempts => 'Intentos';

  @override
  String get timeSpent => 'Tiempo Empleado';

  @override
  String get skillBreakdown => 'Desglose por Habilidades';

  @override
  String get feedback => 'Retroalimentación';

  @override
  String get featureComingSoon => 'Función próximamente disponible';

  @override
  String get chapter => 'Capítulo';

  @override
  String get evaluationInfo => 'Información de la Evaluación';

  @override
  String get chapterResults => 'Resultados por Capítulo';

  @override
  String get allChapters => 'Todos los Capítulos';

  @override
  String get noEvaluationsFound => 'No se encontraron evaluaciones';

  @override
  String get completeChaptersToSeeResults =>
      'Completa capítulos para ver resultados';

  @override
  String get restart => 'Reiniciar';

  @override
  String get restartPracticeConfirm =>
      '¿Estás seguro de que quieres reiniciar? Tu progreso actual se perderá.';

  @override
  String get error => 'Error';

  @override
  String get noVocabularyItems => 'No hay elementos de vocabulario disponibles';

  @override
  String get showAnswer => 'Mostrar Respuesta';

  @override
  String get dontKnow => 'No Sé';

  @override
  String get iKnow => 'Sí Sé';

  @override
  String get practiceCompleted => '¡Práctica Completada!';

  @override
  String get correct => 'Correcto';

  @override
  String get incorrect => 'Incorrecto';

  @override
  String get practiceAgain => 'Practicar de Nuevo';

  @override
  String get backToChapters => 'Volver a Capítulos';

  @override
  String get readingChapters => 'Capítulos de Lectura';

  @override
  String get page => 'Página';

  @override
  String get noLives => 'Sin Vidas';

  @override
  String get nextReset => 'Próximo Reinicio';

  @override
  String get ok => 'OK';

  @override
  String get previous => 'Anterior';

  @override
  String get next => 'Siguiente';

  @override
  String get startQuiz => 'Iniciar Quiz';

  @override
  String get congratulations => '¡Felicitaciones!';

  @override
  String get scoreNotEnough =>
      'Necesitas al menos 7 respuestas correctas para aprobar (70%).';

  @override
  String get exitQuiz => 'Salir del Quiz';

  @override
  String get exitQuizConfirmation =>
      '¿Estás seguro de que quieres salir? Tu progreso se perderá.';

  @override
  String get exit => 'Salir';

  @override
  String get outOfLives => '¡Sin Vidas!';

  @override
  String get outOfLivesMessage =>
      'Has usado todas tus vidas por hoy. ¡Tómate un descanso y vuelve mañana para empezar de nuevo!';

  @override
  String get livesReset => 'Reinicio de Vidas';

  @override
  String nextResetIn(int hours) {
    return 'Próximo reinicio de vidas en $hours horas';
  }

  @override
  String get reviewTime =>
      '¡Usa este tiempo para repasar lo que has aprendido!';

  @override
  String get iUnderstand => 'Entendido';

  @override
  String get interviewTopicsTitle => 'Temas de Entrevista';

  @override
  String get loadingInterviewTopics => 'Cargando temas de entrevista...';

  @override
  String get noTopicsAvailable => 'No hay temas disponibles';

  @override
  String startInterviewTitle(String topicName) {
    return '¿Iniciar Entrevista de $topicName?';
  }

  @override
  String get questions => 'Preguntas';

  @override
  String get duration => 'Duración';

  @override
  String get difficulty => 'Dificultad';

  @override
  String questionsCount(int count) {
    return '$count preguntas';
  }

  @override
  String durationMinutes(int minutes) {
    return '$minutes min';
  }

  @override
  String interviewDash(String topicName) {
    return 'Entrevista - $topicName';
  }

  @override
  String get voiceRecordingComingSoon => 'Grabación de Voz - Próximamente';

  @override
  String get holdToRecord => 'Mantén presionado para grabar';

  @override
  String get releaseToSend => 'Suelta para enviar';

  @override
  String get recording => 'Grabando...';

  @override
  String get getResults => 'Obtener Resultados';

  @override
  String get sendingAudio => 'Enviando audio...';

  @override
  String recordedSeconds(int seconds) {
    return 'Grabado: ${seconds}s';
  }

  @override
  String get reRecord => 'Grabar de Nuevo';

  @override
  String get yourAnswer => 'Tu Respuesta';

  @override
  String get typeYourAnswerHere => 'Escribe tu respuesta aquí...';

  @override
  String minimumCharacters(int count) {
    return 'Mínimo $count caracteres';
  }

  @override
  String get pleaseEnterAnswer => 'Por favor ingresa una respuesta';

  @override
  String get submitAnswer => 'Enviar Respuesta';

  @override
  String get answerEvaluation => 'Evaluación de la Respuesta';

  @override
  String get scoreBreakdown => 'Desglose de Puntuación';

  @override
  String get viewFinalResults => 'Ver Resultados Finales';

  @override
  String get interviewComplete => 'Entrevista Completada';

  @override
  String get keepPracticing => '¡Sigue Practicando!';

  @override
  String overallScore(String score) {
    return 'Puntuación General: $score/100';
  }

  @override
  String get backToTopics => 'Volver a Temas';

  @override
  String get fluency => 'Fluidez';

  @override
  String get grammar => 'Gramática';

  @override
  String get vocabulary_skill => 'Vocabulario';

  @override
  String get pronunciation => 'Pronunciación';

  @override
  String get coherence => 'Coherencia';

  @override
  String get beginner => 'Principiante';

  @override
  String get intermediate => 'Intermedio';

  @override
  String get advanced => 'Avanzado';
}
