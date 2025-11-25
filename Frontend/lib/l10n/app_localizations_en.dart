// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'TECHSPEAK';

  @override
  String get login => 'Login';

  @override
  String get email => 'Email';

  @override
  String get password => 'Password';

  @override
  String get loginButton => 'Sign In';

  @override
  String get loginWithGoogle => 'Sign in with Google';

  @override
  String get loginWithApple => 'Sign in with Apple';

  @override
  String get emailRequired => 'Email is required';

  @override
  String get emailInvalid => 'Please enter a valid email';

  @override
  String get passwordRequired => 'Password is required';

  @override
  String get passwordTooShort => 'Password must be at least 12 characters';

  @override
  String get hi => 'Hi';

  @override
  String get continueText => 'Continue';

  @override
  String get vocabulary => 'Vocabulary';

  @override
  String get reading => 'Reading';

  @override
  String get readingPracticeSubtitle => 'Practice the words';

  @override
  String get interview => 'Interview';

  @override
  String get chooseYourPreferredTopic => 'Choose your preferred topic';

  @override
  String get home => 'Home';

  @override
  String get documents => 'Documents';

  @override
  String get book => 'Book';

  @override
  String get help => 'Help';

  @override
  String get settings => 'Settings';

  @override
  String get theme => 'Theme';

  @override
  String get language => 'Language';

  @override
  String get lightTheme => 'Light';

  @override
  String get darkTheme => 'Dark';

  @override
  String get colorPalette => 'Color Palette';

  @override
  String get system => 'System';

  @override
  String get notifications => 'Notifications';

  @override
  String get notificationsEnabled => 'Notifications enabled';

  @override
  String get notificationsDisabled => 'Notifications disabled';

  @override
  String get logout => 'Logout';

  @override
  String get selectLanguage => 'Select Language';

  @override
  String get selectColorPalette => 'Select Color Palette';

  @override
  String get confirmLogout => 'Confirm Logout';

  @override
  String get logoutConfirmation => 'Are you sure you want to logout?';

  @override
  String get cancel => 'Cancel';

  @override
  String get welcomeBack => 'Welcome back!';

  @override
  String get yourLearningPath => 'Your Learning Path';

  @override
  String get learningSlogan => 'Learn • Practice • Master';

  @override
  String get signingYouIn => 'Signing you in...';

  @override
  String get connectingWithGoogle => 'Connecting with Google...';

  @override
  String get connectingWithApple => 'Connecting with Apple...';

  @override
  String get loadingExperience => 'Loading your learning experience...';

  @override
  String get initializingExperience =>
      'Initializing your learning experience...';

  @override
  String get or => 'OR';

  @override
  String get user => 'User';

  @override
  String get loading => 'Loading...';

  @override
  String livesRemaining(int lives) {
    return '$lives lives remaining';
  }

  @override
  String get chapterProgress => 'Chapter 4/5';

  @override
  String get software => 'Software';

  @override
  String get databases => 'Databases';

  @override
  String navigatingToSection(String section) {
    return 'Navigating to $section section...';
  }

  @override
  String get emailPasswordRequired => 'Email and password are required';

  @override
  String get invalidCredentials =>
      'Invalid credentials. Please check your email and password.';

  @override
  String get googleSignInFailed => 'Google sign in failed';

  @override
  String get appleSignInFailed => 'Apple sign in failed';

  @override
  String get errorDuringLogout => 'Error during logout';

  @override
  String get errorCheckingAuth => 'Error checking authentication status';

  @override
  String get errorInMockLogin => 'Error in mock login';

  @override
  String get comingSoon => 'Coming Soon';

  @override
  String sectionTitle(String title) {
    return '$title Section';
  }

  @override
  String get selectCustomColor => 'Select Custom Color';

  @override
  String get hue => 'Hue';

  @override
  String get saturation => 'Saturation';

  @override
  String get lightness => 'Lightness';

  @override
  String get quickColors => 'Quick Colors';

  @override
  String get selectColor => 'Select Color';

  @override
  String get quiz => 'Quiz';

  @override
  String get question => 'Question';

  @override
  String get submit => 'Submit';

  @override
  String get nextQuestion => 'Next Question';

  @override
  String get score => 'Score';

  @override
  String get points => 'points';

  @override
  String get completeePreviousEpisode =>
      'Complete the previous episode to unlock this one';

  @override
  String get episodeCompleted => 'Episode completed - Tap to replay';

  @override
  String get continueEpisode => 'Continue episode';

  @override
  String get completePreviousEpisode => 'Complete previous episode to unlock';

  @override
  String playingEpisode(String episodeTitle) {
    return 'Playing $episodeTitle';
  }

  @override
  String get dontHaveAccount => 'Don\'t have an account?';

  @override
  String get signUp => 'Sign Up';

  @override
  String get createAccount => 'Create Account';

  @override
  String get joinUsSlogan => 'Join us to start your technical English journey';

  @override
  String get fullName => 'Full Name';

  @override
  String get enterFullName => 'Enter your full name';

  @override
  String get confirmPassword => 'Confirm Password';

  @override
  String get enterConfirmPassword => 'Re-enter your password';

  @override
  String get acceptTerms => 'I accept the Terms of Service and Privacy Policy';

  @override
  String get pleaseEnterName => 'Please enter your name';

  @override
  String get nameTooShort => 'Name must be at least 2 characters';

  @override
  String get passwordsDontMatch => 'Passwords don\'t match';

  @override
  String get pleaseAcceptTerms => 'Please accept the terms and conditions';

  @override
  String get alreadyHaveAccount => 'Already have an account?';

  @override
  String get signIn => 'Sign In';

  @override
  String get creatingAccount => 'Creating your account...';

  @override
  String get register => 'Register';

  @override
  String get signUpWithGoogle => 'Sign up with Google';

  @override
  String get signUpWithApple => 'Sign up with Apple';

  @override
  String get creatingAccountWithGoogle => 'Creating account with Google...';

  @override
  String get creatingAccountWithApple => 'Creating account with Apple...';

  @override
  String get forgotPassword => 'Forgot Password?';

  @override
  String get checkYourEmail => 'Check Your Email';

  @override
  String get forgotPasswordSubtitle =>
      'Don\'t worry! Enter your email address and we\'ll send you a link to reset your password.';

  @override
  String get emailSentMessage =>
      'We\'ve sent a password reset link to your email address. Please check your inbox and follow the instructions.';

  @override
  String get emailAddress => 'Email Address';

  @override
  String get enterEmailAddress => 'Enter your email address';

  @override
  String get sendResetLink => 'Send Reset Link';

  @override
  String get backToLogin => 'Back to Login';

  @override
  String get emailSent => 'Email Sent';

  @override
  String get sendingResetLink => 'Sending reset link...';

  @override
  String get emailSentSuccessfully => 'Password reset email sent successfully!';

  @override
  String get resendEmail => 'Resend Email';

  @override
  String get openEmailApp => 'Open Email App';

  @override
  String get resetLinkSentAgain => 'Reset link sent again!';

  @override
  String get openingEmailApp => 'Opening email app...';

  @override
  String get forgotPasswordQuestion => 'Forgot your password?';

  @override
  String get rememberSession => 'Remember session';

  @override
  String get folders => 'Folders';

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
  String get progress => 'Progress';

  @override
  String get episodeContent => 'Episode Content';

  @override
  String get episodeContentPlaceholder =>
      'Episode content will be displayed here';

  @override
  String get replayEpisode => 'Replay Episode';

  @override
  String get startEpisode => 'Start Episode';

  @override
  String startingEpisode(String episodeTitle) {
    return 'Starting $episodeTitle...';
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
