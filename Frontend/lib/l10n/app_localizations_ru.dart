// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Russian (`ru`).
class AppLocalizationsRu extends AppLocalizations {
  AppLocalizationsRu([String locale = 'ru']) : super(locale);

  @override
  String get appTitle => 'TECHSPEAK';

  @override
  String get login => 'Вход';

  @override
  String get email => 'Электронная почта';

  @override
  String get password => 'Пароль';

  @override
  String get loginButton => 'Войти';

  @override
  String get loginWithGoogle => 'Войти через Google';

  @override
  String get loginWithApple => 'Войти через Apple';

  @override
  String get emailRequired => 'Требуется электронная почта';

  @override
  String get emailInvalid => 'Введите действительный адрес электронной почты';

  @override
  String get passwordRequired => 'Требуется пароль';

  @override
  String get passwordTooShort => 'Пароль должен содержать не менее 6 символов';

  @override
  String get hi => 'Привет';

  @override
  String get continueText => 'Продолжить';

  @override
  String get vocabulary => 'Словарь';

  @override
  String get reading => 'Чтение';

  @override
  String get readingPracticeSubtitle => 'Practice the words';

  @override
  String get interview => 'Интервью';

  @override
  String get chooseYourPreferredTopic => 'Choose your preferred topic';

  @override
  String get home => 'Главная';

  @override
  String get documents => 'Документы';

  @override
  String get book => 'Книга';

  @override
  String get help => 'Помощь';

  @override
  String get settings => 'Настройки';

  @override
  String get theme => 'Тема';

  @override
  String get language => 'Язык';

  @override
  String get lightTheme => 'Светлая';

  @override
  String get darkTheme => 'Темная';

  @override
  String get colorPalette => 'Цветовая палитра';

  @override
  String get system => 'Система';

  @override
  String get notifications => 'Уведомления';

  @override
  String get notificationsEnabled => 'Уведомления включены';

  @override
  String get notificationsDisabled => 'Уведомления отключены';

  @override
  String get logout => 'Выйти';

  @override
  String get selectLanguage => 'Выбрать язык';

  @override
  String get selectColorPalette => 'Выбрать цветовую палитру';

  @override
  String get confirmLogout => 'Подтвердить выход';

  @override
  String get logoutConfirmation => 'Вы уверены, что хотите выйти?';

  @override
  String get cancel => 'Отмена';

  @override
  String get welcomeBack => 'Добро пожаловать!';

  @override
  String get yourLearningPath => 'Ваш путь обучения';

  @override
  String get learningSlogan => 'Изучай • Практикуй • Овладевай';

  @override
  String get signingYouIn => 'Выполняется вход...';

  @override
  String get connectingWithGoogle => 'Подключение к Google...';

  @override
  String get connectingWithApple => 'Подключение к Apple...';

  @override
  String get loadingExperience => 'Загрузка вашего опыта обучения...';

  @override
  String get initializingExperience => 'Инициализация вашего опыта обучения...';

  @override
  String get or => 'ИЛИ';

  @override
  String get user => 'Пользователь';

  @override
  String get loading => 'Loading...';

  @override
  String livesRemaining(int lives) {
    return '$lives/5';
  }

  @override
  String get chapterProgress => 'Глава 4/5';

  @override
  String get software => 'Программное обеспечение';

  @override
  String get databases => 'Базы данных';

  @override
  String navigatingToSection(String section) {
    return 'Navigating to $section section...';
  }

  @override
  String get emailPasswordRequired => 'Требуется электронная почта и пароль';

  @override
  String get invalidCredentials =>
      'Invalid credentials. Please check your email and password.';

  @override
  String get googleSignInFailed => 'Ошибка входа через Google';

  @override
  String get appleSignInFailed => 'Ошибка входа через Apple';

  @override
  String get errorDuringLogout => 'Ошибка при выходе';

  @override
  String get errorCheckingAuth => 'Ошибка проверки статуса аутентификации';

  @override
  String get errorInMockLogin => 'Ошибка в тестовом входе';

  @override
  String get comingSoon => 'Скоро';

  @override
  String sectionTitle(String title) {
    return 'Раздел $title';
  }

  @override
  String get selectCustomColor => 'Выбрать пользовательский цвет';

  @override
  String get hue => 'Оттенок';

  @override
  String get saturation => 'Насыщенность';

  @override
  String get lightness => 'Яркость';

  @override
  String get quickColors => 'Быстрые цвета';

  @override
  String get selectColor => 'Выбрать цвет';

  @override
  String get quiz => 'Quiz';

  @override
  String get question => 'Вопрос';

  @override
  String get submit => 'Отправить';

  @override
  String get nextQuestion => 'Следующий вопрос';

  @override
  String get score => 'Score';

  @override
  String get points => 'очков';

  @override
  String get completeePreviousEpisode =>
      'Complete the previous episode to unlock this one';

  @override
  String get episodeCompleted => 'Эпизод завершен - Нажмите для повтора';

  @override
  String get continueEpisode => 'Продолжить эпизод';

  @override
  String get completePreviousEpisode =>
      'Завершите предыдущий эпизод, чтобы разблокировать этот';

  @override
  String playingEpisode(String episodeTitle) {
    return 'Воспроизводится $episodeTitle';
  }

  @override
  String get dontHaveAccount => 'Нет аккаунта?';

  @override
  String get signUp => 'Регистрация';

  @override
  String get createAccount => 'Создать аккаунт';

  @override
  String get joinUsSlogan =>
      'Присоединяйтесь к нам, чтобы начать изучение технического английского';

  @override
  String get fullName => 'Полное имя';

  @override
  String get enterFullName => 'Введите ваше полное имя';

  @override
  String get confirmPassword => 'Подтвердить пароль';

  @override
  String get enterConfirmPassword => 'Подтвердите ваш пароль';

  @override
  String get acceptTerms =>
      'Я принимаю Условия обслуживания и Политику конфиденциальности';

  @override
  String get pleaseEnterName => 'Пожалуйста, введите ваше имя';

  @override
  String get nameTooShort => 'Имя должно содержать не менее 2 символов';

  @override
  String get passwordsDontMatch => 'Пароли не совпадают';

  @override
  String get pleaseAcceptTerms => 'Пожалуйста, примите условия и положения';

  @override
  String get alreadyHaveAccount => 'Уже есть аккаунт? ';

  @override
  String get signIn => 'Войти';

  @override
  String get creatingAccount => 'Создание вашего аккаунта...';

  @override
  String get register => 'Зарегистрироваться';

  @override
  String get signUpWithGoogle => 'Зарегистрироваться через Google';

  @override
  String get signUpWithApple => 'Зарегистрироваться через Apple';

  @override
  String get creatingAccountWithGoogle => 'Создание аккаунта через Google...';

  @override
  String get creatingAccountWithApple => 'Создание аккаунта через Apple...';

  @override
  String get forgotPassword => 'Забыли пароль?';

  @override
  String get checkYourEmail => 'Проверьте вашу электронную почту';

  @override
  String get forgotPasswordSubtitle =>
      'Не волнуйтесь! Введите ваш адрес электронной почты, и мы отправим вам ссылку для сброса пароля.';

  @override
  String get emailSentMessage =>
      'Мы отправили ссылку для сброса пароля на ваш адрес электронной почты. Пожалуйста, проверьте входящие сообщения и следуйте инструкциям.';

  @override
  String get emailAddress => 'Адрес электронной почты';

  @override
  String get enterEmailAddress => 'Введите ваш адрес электронной почты';

  @override
  String get sendResetLink => 'Отправить ссылку для сброса';

  @override
  String get backToLogin => 'Вернуться к входу';

  @override
  String get emailSent => 'Письмо отправлено';

  @override
  String get sendingResetLink => 'Отправка ссылки для сброса...';

  @override
  String get emailSentSuccessfully =>
      'Письмо для сброса пароля успешно отправлено!';

  @override
  String get resendEmail => 'Отправить письмо повторно';

  @override
  String get openEmailApp => 'Открыть почтовое приложение';

  @override
  String get resetLinkSentAgain => 'Ссылка для сброса отправлена снова!';

  @override
  String get openingEmailApp => 'Открытие почтового приложения...';

  @override
  String get forgotPasswordQuestion => 'Забыли пароль?';

  @override
  String get rememberSession => 'Запомнить сессию';

  @override
  String get folders => 'Папки';

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
  String get progress => 'Прогресс';

  @override
  String get episodeContent => 'Содержание эпизода';

  @override
  String get episodeContentPlaceholder =>
      'Содержание эпизода будет отображено здесь';

  @override
  String get replayEpisode => 'Повторить эпизод';

  @override
  String get startEpisode => 'Начать эпизод';

  @override
  String startingEpisode(String episodeTitle) {
    return 'Запуск $episodeTitle...';
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
