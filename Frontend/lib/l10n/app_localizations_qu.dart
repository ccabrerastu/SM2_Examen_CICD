// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Quechua (`qu`).
class AppLocalizationsQu extends AppLocalizations {
  AppLocalizationsQu([String locale = 'qu']) : super(locale);

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
      'La contraseña debe tener al menos 6 caracteres';

  @override
  String get hi => 'Hola';

  @override
  String get continueText => 'Continuar';

  @override
  String get vocabulary => 'Vocabulario';

  @override
  String get reading => 'Lectura';

  @override
  String get readingPracticeSubtitle => 'Practice the words';

  @override
  String get interview => 'Entrevista';

  @override
  String get chooseYourPreferredTopic => 'Choose your preferred topic';

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
  String get loading => 'Loading...';

  @override
  String livesRemaining(int lives) {
    return '$lives/5';
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
      'Invalid credentials. Please check your email and password.';

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
  String get retry => 'Retry';

  @override
  String get noLivesRemaining => 'No lives remaining!';

  @override
  String get livesResetTomorrow => 'Lives reset tomorrow';

  @override
  String get nextResetTomorrow => 'Next reset tomorrow';

  @override
  String get refresh => 'Refresh';

  @override
  String get episodeRoadmap => 'Episode Roadmap';

  @override
  String get repeatChapterTitle => 'Repeat Chapter';

  @override
  String get repeatChapterWarning =>
      'You\'ve already completed this chapter. Repeating it won\'t affect your current score, but it\'s a great way to reinforce your learning.';

  @override
  String currentScore(int score) {
    return 'Current score: $score points';
  }

  @override
  String get repeatChapterBenefit =>
      'Practice makes perfect! Use this opportunity to strengthen your knowledge.';

  @override
  String get repeatChapter => 'Repeat Chapter';

  @override
  String chapterResetForRepetition(String chapterTitle) {
    return 'Chapter \'$chapterTitle\' has been reset for repetition. Your original score is preserved!';
  }

  @override
  String get progress => 'Ñawpaqman';

  @override
  String get episodeContent => 'Episodio Contenido';

  @override
  String get episodeContentPlaceholder => 'Episodio contenido kaypi rikukunqa';

  @override
  String get replayEpisode => 'Episodio Kutichiy';

  @override
  String get startEpisode => 'Episodio Qallariy';

  @override
  String startingEpisode(String episodeTitle) {
    return '$episodeTitle qallarikuspa...';
  }

  @override
  String get vocabularyChaptersTitle => 'Vocabulary Chapters';

  @override
  String get loadingVocabularyChapters => 'Loading vocabulary chapters...';

  @override
  String get errorLoadingChapters => 'Error loading chapters';

  @override
  String get unknownError => 'An unknown error occurred';

  @override
  String get dismiss => 'Dismiss';

  @override
  String get tryAgain => 'Try Again';

  @override
  String get noChaptersAvailable => 'No chapters available';

  @override
  String get noChaptersDescription =>
      'Check back later for new vocabulary chapters';

  @override
  String get yourProgress => 'Your Progress';

  @override
  String get chaptersCompleted => 'Chapters Completed';

  @override
  String get unlocked => 'Unlocked';

  @override
  String get locked => 'Locked';

  @override
  String get completed => 'Completed';

  @override
  String get continue_ => 'Continue';

  @override
  String get start => 'Start';

  @override
  String get chapterLocked =>
      'This chapter is locked. Complete the previous chapter first.';

  @override
  String chapterLockedDescription(int previousChapter) {
    return 'Complete chapter $previousChapter to unlock this chapter';
  }

  @override
  String get understood => 'Understood';

  @override
  String get chapterCompleted => 'You have completed this chapter!';

  @override
  String get chapterCompletedDescription =>
      'You have already completed this chapter. You can review it anytime.';

  @override
  String completedOn(String date) {
    return 'Completed on $date';
  }

  @override
  String get close => 'Close';

  @override
  String get reviewChapter => 'Review Chapter';

  @override
  String get noLivesTitle => 'No Lives Available';

  @override
  String get noLivesMessage =>
      'You have no lives remaining. Please wait for the next reset.';

  @override
  String nextResetAt(String time) {
    return 'Next reset at $time';
  }

  @override
  String get evaluationDetails => 'Evaluation Details';

  @override
  String get completedDate => 'Completed Date';

  @override
  String get attempts => 'Attempts';

  @override
  String get timeSpent => 'Time Spent';

  @override
  String get skillBreakdown => 'Skill Breakdown';

  @override
  String get feedback => 'Feedback';

  @override
  String get featureComingSoon => 'This feature is coming soon!';

  @override
  String get chapter => 'Chapter';

  @override
  String get evaluationInfo => 'Evaluation Information';

  @override
  String get chapterResults => 'Chapter Results';

  @override
  String get allChapters => 'All Chapters';

  @override
  String get noEvaluationsFound => 'No evaluations found';

  @override
  String get completeChaptersToSeeResults => 'Complete chapters to see results';

  @override
  String get restart => 'Restart';

  @override
  String get restartPracticeConfirm =>
      'Are you sure you want to restart? Your current progress will be lost.';

  @override
  String get error => 'Error';

  @override
  String get noVocabularyItems => 'No vocabulary items available';

  @override
  String get showAnswer => 'Show Answer';

  @override
  String get dontKnow => 'Don\'t Know';

  @override
  String get iKnow => 'I Know';

  @override
  String get practiceCompleted => 'Practice Completed!';

  @override
  String get correct => 'Correct';

  @override
  String get incorrect => 'Incorrect';

  @override
  String get practiceAgain => 'Practice Again';

  @override
  String get backToChapters => 'Back to Chapters';

  @override
  String get readingChapters => 'Reading Chapters';

  @override
  String get page => 'Page';

  @override
  String get noLives => 'No Lives';

  @override
  String get nextReset => 'Next Reset';

  @override
  String get ok => 'OK';

  @override
  String get previous => 'Previous';

  @override
  String get next => 'Next';

  @override
  String get startQuiz => 'Start Quiz';

  @override
  String get congratulations => 'Congratulations!';

  @override
  String get scoreNotEnough =>
      'You need at least 7 correct answers to pass (70%).';

  @override
  String get exitQuiz => 'Exit Quiz';

  @override
  String get exitQuizConfirmation =>
      'Are you sure you want to exit? Your progress will be lost.';

  @override
  String get exit => 'Exit';

  @override
  String get outOfLives => 'Out of Lives!';

  @override
  String get outOfLivesMessage =>
      'You\'ve used all your lives for today. Take a break and come back tomorrow for a fresh start!';

  @override
  String get livesReset => 'Lives Reset';

  @override
  String nextResetIn(int hours) {
    return 'Next reset of lives in $hours hours';
  }

  @override
  String get reviewTime => 'Use this time to review what you\'ve learned!';

  @override
  String get iUnderstand => 'I Understand';

  @override
  String get interviewTopicsTitle => 'Interview Topics';

  @override
  String get loadingInterviewTopics => 'Loading interview topics...';

  @override
  String get noTopicsAvailable => 'No topics available';

  @override
  String startInterviewTitle(String topicName) {
    return 'Start $topicName Interview?';
  }

  @override
  String get questions => 'Questions';

  @override
  String get duration => 'Duration';

  @override
  String get difficulty => 'Difficulty';

  @override
  String questionsCount(int count) {
    return '$count questions';
  }

  @override
  String durationMinutes(int minutes) {
    return '$minutes min';
  }

  @override
  String interviewDash(String topicName) {
    return 'Interview - $topicName';
  }

  @override
  String get voiceRecordingComingSoon => 'Voice Recording - Coming Soon';

  @override
  String get holdToRecord => 'Hold to record';

  @override
  String get releaseToSend => 'Release to send';

  @override
  String get recording => 'Recording...';

  @override
  String get getResults => 'Get Results';

  @override
  String get sendingAudio => 'Sending audio...';

  @override
  String recordedSeconds(int seconds) {
    return 'Recorded: ${seconds}s';
  }

  @override
  String get reRecord => 'Record Again';

  @override
  String get yourAnswer => 'Your Answer';

  @override
  String get typeYourAnswerHere => 'Type your answer here...';

  @override
  String minimumCharacters(int count) {
    return 'Minimum $count characters';
  }

  @override
  String get pleaseEnterAnswer => 'Please enter an answer';

  @override
  String get submitAnswer => 'Submit Answer';

  @override
  String get answerEvaluation => 'Answer Evaluation';

  @override
  String get scoreBreakdown => 'Score Breakdown';

  @override
  String get viewFinalResults => 'View Final Results';

  @override
  String get interviewComplete => 'Interview Complete';

  @override
  String get keepPracticing => 'Keep Practicing!';

  @override
  String overallScore(String score) {
    return 'Overall Score: $score/100';
  }

  @override
  String get backToTopics => 'Back to Topics';

  @override
  String get fluency => 'Fluency';

  @override
  String get grammar => 'Grammar';

  @override
  String get vocabulary_skill => 'Vocabulary';

  @override
  String get pronunciation => 'Pronunciation';

  @override
  String get coherence => 'Coherence';

  @override
  String get beginner => 'Beginner';

  @override
  String get intermediate => 'Intermediate';

  @override
  String get advanced => 'Advanced';
}
