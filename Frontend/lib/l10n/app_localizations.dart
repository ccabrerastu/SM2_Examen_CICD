import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_es.dart';
import 'app_localizations_pt.dart';
import 'app_localizations_qu.dart';
import 'app_localizations_ru.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('es'),
    Locale('pt'),
    Locale('qu'),
    Locale('ru'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'TECHSPEAK'**
  String get appTitle;

  /// No description provided for @login.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get login;

  /// No description provided for @email.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @loginButton.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get loginButton;

  /// No description provided for @loginWithGoogle.
  ///
  /// In en, this message translates to:
  /// **'Sign in with Google'**
  String get loginWithGoogle;

  /// No description provided for @loginWithApple.
  ///
  /// In en, this message translates to:
  /// **'Sign in with Apple'**
  String get loginWithApple;

  /// No description provided for @emailRequired.
  ///
  /// In en, this message translates to:
  /// **'Email is required'**
  String get emailRequired;

  /// No description provided for @emailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid email'**
  String get emailInvalid;

  /// No description provided for @passwordRequired.
  ///
  /// In en, this message translates to:
  /// **'Password is required'**
  String get passwordRequired;

  /// No description provided for @passwordTooShort.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 12 characters'**
  String get passwordTooShort;

  /// No description provided for @hi.
  ///
  /// In en, this message translates to:
  /// **'Hi'**
  String get hi;

  /// No description provided for @continueText.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get continueText;

  /// No description provided for @vocabulary.
  ///
  /// In en, this message translates to:
  /// **'Vocabulary'**
  String get vocabulary;

  /// No description provided for @reading.
  ///
  /// In en, this message translates to:
  /// **'Reading'**
  String get reading;

  /// No description provided for @readingPracticeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Practice the words'**
  String get readingPracticeSubtitle;

  /// No description provided for @interview.
  ///
  /// In en, this message translates to:
  /// **'Interview'**
  String get interview;

  /// No description provided for @chooseYourPreferredTopic.
  ///
  /// In en, this message translates to:
  /// **'Choose your preferred topic'**
  String get chooseYourPreferredTopic;

  /// No description provided for @home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// No description provided for @documents.
  ///
  /// In en, this message translates to:
  /// **'Documents'**
  String get documents;

  /// Book section title
  ///
  /// In en, this message translates to:
  /// **'Book'**
  String get book;

  /// No description provided for @help.
  ///
  /// In en, this message translates to:
  /// **'Help'**
  String get help;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @theme.
  ///
  /// In en, this message translates to:
  /// **'Theme'**
  String get theme;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @lightTheme.
  ///
  /// In en, this message translates to:
  /// **'Light'**
  String get lightTheme;

  /// No description provided for @darkTheme.
  ///
  /// In en, this message translates to:
  /// **'Dark'**
  String get darkTheme;

  /// No description provided for @colorPalette.
  ///
  /// In en, this message translates to:
  /// **'Color Palette'**
  String get colorPalette;

  /// No description provided for @system.
  ///
  /// In en, this message translates to:
  /// **'System'**
  String get system;

  /// No description provided for @notifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// No description provided for @notificationsEnabled.
  ///
  /// In en, this message translates to:
  /// **'Notifications enabled'**
  String get notificationsEnabled;

  /// No description provided for @notificationsDisabled.
  ///
  /// In en, this message translates to:
  /// **'Notifications disabled'**
  String get notificationsDisabled;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// No description provided for @selectLanguage.
  ///
  /// In en, this message translates to:
  /// **'Select Language'**
  String get selectLanguage;

  /// No description provided for @selectColorPalette.
  ///
  /// In en, this message translates to:
  /// **'Select Color Palette'**
  String get selectColorPalette;

  /// No description provided for @confirmLogout.
  ///
  /// In en, this message translates to:
  /// **'Confirm Logout'**
  String get confirmLogout;

  /// No description provided for @logoutConfirmation.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to logout?'**
  String get logoutConfirmation;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @welcomeBack.
  ///
  /// In en, this message translates to:
  /// **'Welcome back!'**
  String get welcomeBack;

  /// No description provided for @yourLearningPath.
  ///
  /// In en, this message translates to:
  /// **'Your Learning Path'**
  String get yourLearningPath;

  /// No description provided for @learningSlogan.
  ///
  /// In en, this message translates to:
  /// **'Learn • Practice • Master'**
  String get learningSlogan;

  /// No description provided for @signingYouIn.
  ///
  /// In en, this message translates to:
  /// **'Signing you in...'**
  String get signingYouIn;

  /// No description provided for @connectingWithGoogle.
  ///
  /// In en, this message translates to:
  /// **'Connecting with Google...'**
  String get connectingWithGoogle;

  /// No description provided for @connectingWithApple.
  ///
  /// In en, this message translates to:
  /// **'Connecting with Apple...'**
  String get connectingWithApple;

  /// No description provided for @loadingExperience.
  ///
  /// In en, this message translates to:
  /// **'Loading your learning experience...'**
  String get loadingExperience;

  /// No description provided for @initializingExperience.
  ///
  /// In en, this message translates to:
  /// **'Initializing your learning experience...'**
  String get initializingExperience;

  /// No description provided for @or.
  ///
  /// In en, this message translates to:
  /// **'OR'**
  String get or;

  /// No description provided for @user.
  ///
  /// In en, this message translates to:
  /// **'User'**
  String get user;

  /// No description provided for @loading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get loading;

  /// No description provided for @livesRemaining.
  ///
  /// In en, this message translates to:
  /// **'{lives} lives remaining'**
  String livesRemaining(int lives);

  /// No description provided for @chapterProgress.
  ///
  /// In en, this message translates to:
  /// **'Chapter 4/5'**
  String get chapterProgress;

  /// No description provided for @software.
  ///
  /// In en, this message translates to:
  /// **'Software'**
  String get software;

  /// No description provided for @databases.
  ///
  /// In en, this message translates to:
  /// **'Databases'**
  String get databases;

  /// No description provided for @navigatingToSection.
  ///
  /// In en, this message translates to:
  /// **'Navigating to {section} section...'**
  String navigatingToSection(String section);

  /// No description provided for @emailPasswordRequired.
  ///
  /// In en, this message translates to:
  /// **'Email and password are required'**
  String get emailPasswordRequired;

  /// No description provided for @invalidCredentials.
  ///
  /// In en, this message translates to:
  /// **'Invalid credentials. Please check your email and password.'**
  String get invalidCredentials;

  /// No description provided for @googleSignInFailed.
  ///
  /// In en, this message translates to:
  /// **'Google sign in failed'**
  String get googleSignInFailed;

  /// No description provided for @appleSignInFailed.
  ///
  /// In en, this message translates to:
  /// **'Apple sign in failed'**
  String get appleSignInFailed;

  /// No description provided for @errorDuringLogout.
  ///
  /// In en, this message translates to:
  /// **'Error during logout'**
  String get errorDuringLogout;

  /// No description provided for @errorCheckingAuth.
  ///
  /// In en, this message translates to:
  /// **'Error checking authentication status'**
  String get errorCheckingAuth;

  /// No description provided for @errorInMockLogin.
  ///
  /// In en, this message translates to:
  /// **'Error in mock login'**
  String get errorInMockLogin;

  /// No description provided for @comingSoon.
  ///
  /// In en, this message translates to:
  /// **'Coming Soon'**
  String get comingSoon;

  /// No description provided for @sectionTitle.
  ///
  /// In en, this message translates to:
  /// **'{title} Section'**
  String sectionTitle(String title);

  /// No description provided for @selectCustomColor.
  ///
  /// In en, this message translates to:
  /// **'Select Custom Color'**
  String get selectCustomColor;

  /// No description provided for @hue.
  ///
  /// In en, this message translates to:
  /// **'Hue'**
  String get hue;

  /// No description provided for @saturation.
  ///
  /// In en, this message translates to:
  /// **'Saturation'**
  String get saturation;

  /// No description provided for @lightness.
  ///
  /// In en, this message translates to:
  /// **'Lightness'**
  String get lightness;

  /// No description provided for @quickColors.
  ///
  /// In en, this message translates to:
  /// **'Quick Colors'**
  String get quickColors;

  /// No description provided for @selectColor.
  ///
  /// In en, this message translates to:
  /// **'Select Color'**
  String get selectColor;

  /// No description provided for @quiz.
  ///
  /// In en, this message translates to:
  /// **'Quiz'**
  String get quiz;

  /// No description provided for @question.
  ///
  /// In en, this message translates to:
  /// **'Question'**
  String get question;

  /// No description provided for @submit.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get submit;

  /// No description provided for @nextQuestion.
  ///
  /// In en, this message translates to:
  /// **'Next Question'**
  String get nextQuestion;

  /// No description provided for @score.
  ///
  /// In en, this message translates to:
  /// **'Score'**
  String get score;

  /// No description provided for @points.
  ///
  /// In en, this message translates to:
  /// **'points'**
  String get points;

  /// No description provided for @completeePreviousEpisode.
  ///
  /// In en, this message translates to:
  /// **'Complete the previous episode to unlock this one'**
  String get completeePreviousEpisode;

  /// No description provided for @episodeCompleted.
  ///
  /// In en, this message translates to:
  /// **'Episode completed - Tap to replay'**
  String get episodeCompleted;

  /// No description provided for @continueEpisode.
  ///
  /// In en, this message translates to:
  /// **'Continue episode'**
  String get continueEpisode;

  /// No description provided for @completePreviousEpisode.
  ///
  /// In en, this message translates to:
  /// **'Complete previous episode to unlock'**
  String get completePreviousEpisode;

  /// No description provided for @playingEpisode.
  ///
  /// In en, this message translates to:
  /// **'Playing {episodeTitle}'**
  String playingEpisode(String episodeTitle);

  /// No description provided for @dontHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account?'**
  String get dontHaveAccount;

  /// No description provided for @signUp.
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get signUp;

  /// No description provided for @createAccount.
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get createAccount;

  /// No description provided for @joinUsSlogan.
  ///
  /// In en, this message translates to:
  /// **'Join us to start your technical English journey'**
  String get joinUsSlogan;

  /// No description provided for @fullName.
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get fullName;

  /// No description provided for @enterFullName.
  ///
  /// In en, this message translates to:
  /// **'Enter your full name'**
  String get enterFullName;

  /// No description provided for @confirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get confirmPassword;

  /// No description provided for @enterConfirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Re-enter your password'**
  String get enterConfirmPassword;

  /// No description provided for @acceptTerms.
  ///
  /// In en, this message translates to:
  /// **'I accept the Terms of Service and Privacy Policy'**
  String get acceptTerms;

  /// No description provided for @pleaseEnterName.
  ///
  /// In en, this message translates to:
  /// **'Please enter your name'**
  String get pleaseEnterName;

  /// No description provided for @nameTooShort.
  ///
  /// In en, this message translates to:
  /// **'Name must be at least 2 characters'**
  String get nameTooShort;

  /// No description provided for @passwordsDontMatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords don\'t match'**
  String get passwordsDontMatch;

  /// No description provided for @pleaseAcceptTerms.
  ///
  /// In en, this message translates to:
  /// **'Please accept the terms and conditions'**
  String get pleaseAcceptTerms;

  /// No description provided for @alreadyHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get alreadyHaveAccount;

  /// No description provided for @signIn.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get signIn;

  /// No description provided for @creatingAccount.
  ///
  /// In en, this message translates to:
  /// **'Creating your account...'**
  String get creatingAccount;

  /// No description provided for @register.
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get register;

  /// No description provided for @signUpWithGoogle.
  ///
  /// In en, this message translates to:
  /// **'Sign up with Google'**
  String get signUpWithGoogle;

  /// No description provided for @signUpWithApple.
  ///
  /// In en, this message translates to:
  /// **'Sign up with Apple'**
  String get signUpWithApple;

  /// No description provided for @creatingAccountWithGoogle.
  ///
  /// In en, this message translates to:
  /// **'Creating account with Google...'**
  String get creatingAccountWithGoogle;

  /// No description provided for @creatingAccountWithApple.
  ///
  /// In en, this message translates to:
  /// **'Creating account with Apple...'**
  String get creatingAccountWithApple;

  /// No description provided for @forgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get forgotPassword;

  /// No description provided for @checkYourEmail.
  ///
  /// In en, this message translates to:
  /// **'Check Your Email'**
  String get checkYourEmail;

  /// No description provided for @forgotPasswordSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Don\'t worry! Enter your email address and we\'ll send you a link to reset your password.'**
  String get forgotPasswordSubtitle;

  /// No description provided for @emailSentMessage.
  ///
  /// In en, this message translates to:
  /// **'We\'ve sent a password reset link to your email address. Please check your inbox and follow the instructions.'**
  String get emailSentMessage;

  /// No description provided for @emailAddress.
  ///
  /// In en, this message translates to:
  /// **'Email Address'**
  String get emailAddress;

  /// No description provided for @enterEmailAddress.
  ///
  /// In en, this message translates to:
  /// **'Enter your email address'**
  String get enterEmailAddress;

  /// No description provided for @sendResetLink.
  ///
  /// In en, this message translates to:
  /// **'Send Reset Link'**
  String get sendResetLink;

  /// No description provided for @backToLogin.
  ///
  /// In en, this message translates to:
  /// **'Back to Login'**
  String get backToLogin;

  /// No description provided for @emailSent.
  ///
  /// In en, this message translates to:
  /// **'Email Sent'**
  String get emailSent;

  /// No description provided for @sendingResetLink.
  ///
  /// In en, this message translates to:
  /// **'Sending reset link...'**
  String get sendingResetLink;

  /// No description provided for @emailSentSuccessfully.
  ///
  /// In en, this message translates to:
  /// **'Password reset email sent successfully!'**
  String get emailSentSuccessfully;

  /// No description provided for @resendEmail.
  ///
  /// In en, this message translates to:
  /// **'Resend Email'**
  String get resendEmail;

  /// No description provided for @openEmailApp.
  ///
  /// In en, this message translates to:
  /// **'Open Email App'**
  String get openEmailApp;

  /// No description provided for @resetLinkSentAgain.
  ///
  /// In en, this message translates to:
  /// **'Reset link sent again!'**
  String get resetLinkSentAgain;

  /// No description provided for @openingEmailApp.
  ///
  /// In en, this message translates to:
  /// **'Opening email app...'**
  String get openingEmailApp;

  /// No description provided for @forgotPasswordQuestion.
  ///
  /// In en, this message translates to:
  /// **'Forgot your password?'**
  String get forgotPasswordQuestion;

  /// No description provided for @rememberSession.
  ///
  /// In en, this message translates to:
  /// **'Remember session'**
  String get rememberSession;

  /// Folders section title
  ///
  /// In en, this message translates to:
  /// **'Folders'**
  String get folders;

  /// No description provided for @errorLoadingLives.
  ///
  /// In en, this message translates to:
  /// **'Error loading lives'**
  String get errorLoadingLives;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @noLivesRemaining.
  ///
  /// In en, this message translates to:
  /// **'No lives remaining!'**
  String get noLivesRemaining;

  /// No description provided for @livesResetTomorrow.
  ///
  /// In en, this message translates to:
  /// **'Lives reset tomorrow'**
  String get livesResetTomorrow;

  /// No description provided for @nextResetTomorrow.
  ///
  /// In en, this message translates to:
  /// **'Next reset tomorrow'**
  String get nextResetTomorrow;

  /// No description provided for @refresh.
  ///
  /// In en, this message translates to:
  /// **'Refresh'**
  String get refresh;

  /// No description provided for @episodeRoadmap.
  ///
  /// In en, this message translates to:
  /// **'Episode Roadmap'**
  String get episodeRoadmap;

  /// No description provided for @repeatChapterTitle.
  ///
  /// In en, this message translates to:
  /// **'Repeat Chapter'**
  String get repeatChapterTitle;

  /// No description provided for @repeatChapterWarning.
  ///
  /// In en, this message translates to:
  /// **'You\'ve already completed this chapter. Repeating it won\'t affect your current score, but it\'s a great way to reinforce your learning.'**
  String get repeatChapterWarning;

  /// No description provided for @currentScore.
  ///
  /// In en, this message translates to:
  /// **'Current score: {score} points'**
  String currentScore(int score);

  /// No description provided for @repeatChapterBenefit.
  ///
  /// In en, this message translates to:
  /// **'Practice makes perfect! Use this opportunity to strengthen your knowledge.'**
  String get repeatChapterBenefit;

  /// No description provided for @repeatChapter.
  ///
  /// In en, this message translates to:
  /// **'Repeat Chapter'**
  String get repeatChapter;

  /// No description provided for @chapterResetForRepetition.
  ///
  /// In en, this message translates to:
  /// **'Chapter \'{chapterTitle}\' has been reset for repetition. Your original score is preserved!'**
  String chapterResetForRepetition(String chapterTitle);

  /// No description provided for @progress.
  ///
  /// In en, this message translates to:
  /// **'Progress'**
  String get progress;

  /// No description provided for @episodeContent.
  ///
  /// In en, this message translates to:
  /// **'Episode Content'**
  String get episodeContent;

  /// No description provided for @episodeContentPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Episode content will be displayed here'**
  String get episodeContentPlaceholder;

  /// No description provided for @replayEpisode.
  ///
  /// In en, this message translates to:
  /// **'Replay Episode'**
  String get replayEpisode;

  /// No description provided for @startEpisode.
  ///
  /// In en, this message translates to:
  /// **'Start Episode'**
  String get startEpisode;

  /// No description provided for @startingEpisode.
  ///
  /// In en, this message translates to:
  /// **'Starting {episodeTitle}...'**
  String startingEpisode(String episodeTitle);

  /// No description provided for @vocabularyChaptersTitle.
  ///
  /// In en, this message translates to:
  /// **'Vocabulary Chapters'**
  String get vocabularyChaptersTitle;

  /// No description provided for @loadingVocabularyChapters.
  ///
  /// In en, this message translates to:
  /// **'Loading vocabulary chapters...'**
  String get loadingVocabularyChapters;

  /// No description provided for @errorLoadingChapters.
  ///
  /// In en, this message translates to:
  /// **'Error loading chapters'**
  String get errorLoadingChapters;

  /// No description provided for @unknownError.
  ///
  /// In en, this message translates to:
  /// **'An unknown error occurred'**
  String get unknownError;

  /// No description provided for @dismiss.
  ///
  /// In en, this message translates to:
  /// **'Dismiss'**
  String get dismiss;

  /// No description provided for @tryAgain.
  ///
  /// In en, this message translates to:
  /// **'Try Again'**
  String get tryAgain;

  /// No description provided for @noChaptersAvailable.
  ///
  /// In en, this message translates to:
  /// **'No chapters available'**
  String get noChaptersAvailable;

  /// No description provided for @noChaptersDescription.
  ///
  /// In en, this message translates to:
  /// **'Check back later for new vocabulary chapters'**
  String get noChaptersDescription;

  /// No description provided for @yourProgress.
  ///
  /// In en, this message translates to:
  /// **'Your Progress'**
  String get yourProgress;

  /// No description provided for @chaptersCompleted.
  ///
  /// In en, this message translates to:
  /// **'Chapters Completed'**
  String get chaptersCompleted;

  /// No description provided for @unlocked.
  ///
  /// In en, this message translates to:
  /// **'Unlocked'**
  String get unlocked;

  /// No description provided for @locked.
  ///
  /// In en, this message translates to:
  /// **'Locked'**
  String get locked;

  /// No description provided for @completed.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get completed;

  /// No description provided for @continue_.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get continue_;

  /// No description provided for @start.
  ///
  /// In en, this message translates to:
  /// **'Start'**
  String get start;

  /// No description provided for @chapterLocked.
  ///
  /// In en, this message translates to:
  /// **'This chapter is locked. Complete the previous chapter first.'**
  String get chapterLocked;

  /// No description provided for @chapterLockedDescription.
  ///
  /// In en, this message translates to:
  /// **'Complete chapter {previousChapter} to unlock this chapter'**
  String chapterLockedDescription(int previousChapter);

  /// No description provided for @understood.
  ///
  /// In en, this message translates to:
  /// **'Understood'**
  String get understood;

  /// No description provided for @chapterCompleted.
  ///
  /// In en, this message translates to:
  /// **'You have completed this chapter!'**
  String get chapterCompleted;

  /// No description provided for @chapterCompletedDescription.
  ///
  /// In en, this message translates to:
  /// **'You have already completed this chapter. You can review it anytime.'**
  String get chapterCompletedDescription;

  /// No description provided for @completedOn.
  ///
  /// In en, this message translates to:
  /// **'Completed on {date}'**
  String completedOn(String date);

  /// No description provided for @close.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// No description provided for @reviewChapter.
  ///
  /// In en, this message translates to:
  /// **'Review Chapter'**
  String get reviewChapter;

  /// No description provided for @noLivesTitle.
  ///
  /// In en, this message translates to:
  /// **'No Lives Available'**
  String get noLivesTitle;

  /// No description provided for @noLivesMessage.
  ///
  /// In en, this message translates to:
  /// **'You have no lives remaining. Please wait for the next reset.'**
  String get noLivesMessage;

  /// No description provided for @nextResetAt.
  ///
  /// In en, this message translates to:
  /// **'Next reset at {time}'**
  String nextResetAt(String time);

  /// No description provided for @evaluationDetails.
  ///
  /// In en, this message translates to:
  /// **'Evaluation Details'**
  String get evaluationDetails;

  /// No description provided for @completedDate.
  ///
  /// In en, this message translates to:
  /// **'Completed Date'**
  String get completedDate;

  /// No description provided for @attempts.
  ///
  /// In en, this message translates to:
  /// **'Attempts'**
  String get attempts;

  /// No description provided for @timeSpent.
  ///
  /// In en, this message translates to:
  /// **'Time Spent'**
  String get timeSpent;

  /// No description provided for @skillBreakdown.
  ///
  /// In en, this message translates to:
  /// **'Skill Breakdown'**
  String get skillBreakdown;

  /// No description provided for @feedback.
  ///
  /// In en, this message translates to:
  /// **'Feedback'**
  String get feedback;

  /// No description provided for @featureComingSoon.
  ///
  /// In en, this message translates to:
  /// **'This feature is coming soon!'**
  String get featureComingSoon;

  /// No description provided for @chapter.
  ///
  /// In en, this message translates to:
  /// **'Chapter'**
  String get chapter;

  /// No description provided for @evaluationInfo.
  ///
  /// In en, this message translates to:
  /// **'Evaluation Information'**
  String get evaluationInfo;

  /// No description provided for @chapterResults.
  ///
  /// In en, this message translates to:
  /// **'Chapter Results'**
  String get chapterResults;

  /// No description provided for @allChapters.
  ///
  /// In en, this message translates to:
  /// **'All Chapters'**
  String get allChapters;

  /// No description provided for @noEvaluationsFound.
  ///
  /// In en, this message translates to:
  /// **'No evaluations found'**
  String get noEvaluationsFound;

  /// No description provided for @completeChaptersToSeeResults.
  ///
  /// In en, this message translates to:
  /// **'Complete chapters to see results'**
  String get completeChaptersToSeeResults;

  /// No description provided for @restart.
  ///
  /// In en, this message translates to:
  /// **'Restart'**
  String get restart;

  /// No description provided for @restartPracticeConfirm.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to restart? Your current progress will be lost.'**
  String get restartPracticeConfirm;

  /// No description provided for @error.
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get error;

  /// No description provided for @noVocabularyItems.
  ///
  /// In en, this message translates to:
  /// **'No vocabulary items available'**
  String get noVocabularyItems;

  /// No description provided for @showAnswer.
  ///
  /// In en, this message translates to:
  /// **'Show Answer'**
  String get showAnswer;

  /// No description provided for @dontKnow.
  ///
  /// In en, this message translates to:
  /// **'Don\'t Know'**
  String get dontKnow;

  /// No description provided for @iKnow.
  ///
  /// In en, this message translates to:
  /// **'I Know'**
  String get iKnow;

  /// No description provided for @practiceCompleted.
  ///
  /// In en, this message translates to:
  /// **'Practice Completed!'**
  String get practiceCompleted;

  /// No description provided for @correct.
  ///
  /// In en, this message translates to:
  /// **'Correct'**
  String get correct;

  /// No description provided for @incorrect.
  ///
  /// In en, this message translates to:
  /// **'Incorrect'**
  String get incorrect;

  /// No description provided for @practiceAgain.
  ///
  /// In en, this message translates to:
  /// **'Practice Again'**
  String get practiceAgain;

  /// No description provided for @backToChapters.
  ///
  /// In en, this message translates to:
  /// **'Back to Chapters'**
  String get backToChapters;

  /// No description provided for @readingChapters.
  ///
  /// In en, this message translates to:
  /// **'Reading Chapters'**
  String get readingChapters;

  /// No description provided for @page.
  ///
  /// In en, this message translates to:
  /// **'Page'**
  String get page;

  /// No description provided for @noLives.
  ///
  /// In en, this message translates to:
  /// **'No Lives'**
  String get noLives;

  /// No description provided for @nextReset.
  ///
  /// In en, this message translates to:
  /// **'Next Reset'**
  String get nextReset;

  /// No description provided for @ok.
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get ok;

  /// No description provided for @previous.
  ///
  /// In en, this message translates to:
  /// **'Previous'**
  String get previous;

  /// No description provided for @next.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// No description provided for @startQuiz.
  ///
  /// In en, this message translates to:
  /// **'Start Quiz'**
  String get startQuiz;

  /// No description provided for @congratulations.
  ///
  /// In en, this message translates to:
  /// **'Congratulations!'**
  String get congratulations;

  /// No description provided for @scoreNotEnough.
  ///
  /// In en, this message translates to:
  /// **'You need at least 7 correct answers to pass (70%).'**
  String get scoreNotEnough;

  /// No description provided for @exitQuiz.
  ///
  /// In en, this message translates to:
  /// **'Exit Quiz'**
  String get exitQuiz;

  /// No description provided for @exitQuizConfirmation.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to exit? Your progress will be lost.'**
  String get exitQuizConfirmation;

  /// No description provided for @exit.
  ///
  /// In en, this message translates to:
  /// **'Exit'**
  String get exit;

  /// No description provided for @outOfLives.
  ///
  /// In en, this message translates to:
  /// **'Out of Lives!'**
  String get outOfLives;

  /// No description provided for @outOfLivesMessage.
  ///
  /// In en, this message translates to:
  /// **'You\'ve used all your lives for today. Take a break and come back tomorrow for a fresh start!'**
  String get outOfLivesMessage;

  /// No description provided for @livesReset.
  ///
  /// In en, this message translates to:
  /// **'Lives Reset'**
  String get livesReset;

  /// No description provided for @nextResetIn.
  ///
  /// In en, this message translates to:
  /// **'Next reset of lives in {hours} hours'**
  String nextResetIn(int hours);

  /// No description provided for @reviewTime.
  ///
  /// In en, this message translates to:
  /// **'Use this time to review what you\'ve learned!'**
  String get reviewTime;

  /// No description provided for @iUnderstand.
  ///
  /// In en, this message translates to:
  /// **'I Understand'**
  String get iUnderstand;

  /// No description provided for @interviewTopicsTitle.
  ///
  /// In en, this message translates to:
  /// **'Interview Topics'**
  String get interviewTopicsTitle;

  /// No description provided for @loadingInterviewTopics.
  ///
  /// In en, this message translates to:
  /// **'Loading interview topics...'**
  String get loadingInterviewTopics;

  /// No description provided for @noTopicsAvailable.
  ///
  /// In en, this message translates to:
  /// **'No topics available'**
  String get noTopicsAvailable;

  /// No description provided for @startInterviewTitle.
  ///
  /// In en, this message translates to:
  /// **'Start {topicName} Interview?'**
  String startInterviewTitle(String topicName);

  /// No description provided for @questions.
  ///
  /// In en, this message translates to:
  /// **'Questions'**
  String get questions;

  /// No description provided for @duration.
  ///
  /// In en, this message translates to:
  /// **'Duration'**
  String get duration;

  /// No description provided for @difficulty.
  ///
  /// In en, this message translates to:
  /// **'Difficulty'**
  String get difficulty;

  /// No description provided for @questionsCount.
  ///
  /// In en, this message translates to:
  /// **'{count} questions'**
  String questionsCount(int count);

  /// No description provided for @durationMinutes.
  ///
  /// In en, this message translates to:
  /// **'{minutes} min'**
  String durationMinutes(int minutes);

  /// No description provided for @interviewDash.
  ///
  /// In en, this message translates to:
  /// **'Interview - {topicName}'**
  String interviewDash(String topicName);

  /// No description provided for @voiceRecordingComingSoon.
  ///
  /// In en, this message translates to:
  /// **'Voice Recording - Coming Soon'**
  String get voiceRecordingComingSoon;

  /// No description provided for @holdToRecord.
  ///
  /// In en, this message translates to:
  /// **'Hold to record'**
  String get holdToRecord;

  /// No description provided for @releaseToSend.
  ///
  /// In en, this message translates to:
  /// **'Release to send'**
  String get releaseToSend;

  /// No description provided for @recording.
  ///
  /// In en, this message translates to:
  /// **'Recording...'**
  String get recording;

  /// No description provided for @getResults.
  ///
  /// In en, this message translates to:
  /// **'Get Results'**
  String get getResults;

  /// No description provided for @sendingAudio.
  ///
  /// In en, this message translates to:
  /// **'Sending audio...'**
  String get sendingAudio;

  /// No description provided for @recordedSeconds.
  ///
  /// In en, this message translates to:
  /// **'Recorded: {seconds}s'**
  String recordedSeconds(int seconds);

  /// No description provided for @reRecord.
  ///
  /// In en, this message translates to:
  /// **'Record Again'**
  String get reRecord;

  /// No description provided for @yourAnswer.
  ///
  /// In en, this message translates to:
  /// **'Your Answer'**
  String get yourAnswer;

  /// No description provided for @typeYourAnswerHere.
  ///
  /// In en, this message translates to:
  /// **'Type your answer here...'**
  String get typeYourAnswerHere;

  /// No description provided for @minimumCharacters.
  ///
  /// In en, this message translates to:
  /// **'Minimum {count} characters'**
  String minimumCharacters(int count);

  /// No description provided for @pleaseEnterAnswer.
  ///
  /// In en, this message translates to:
  /// **'Please enter an answer'**
  String get pleaseEnterAnswer;

  /// No description provided for @submitAnswer.
  ///
  /// In en, this message translates to:
  /// **'Submit Answer'**
  String get submitAnswer;

  /// No description provided for @answerEvaluation.
  ///
  /// In en, this message translates to:
  /// **'Answer Evaluation'**
  String get answerEvaluation;

  /// No description provided for @scoreBreakdown.
  ///
  /// In en, this message translates to:
  /// **'Score Breakdown'**
  String get scoreBreakdown;

  /// No description provided for @viewFinalResults.
  ///
  /// In en, this message translates to:
  /// **'View Final Results'**
  String get viewFinalResults;

  /// No description provided for @interviewComplete.
  ///
  /// In en, this message translates to:
  /// **'Interview Complete'**
  String get interviewComplete;

  /// No description provided for @keepPracticing.
  ///
  /// In en, this message translates to:
  /// **'Keep Practicing!'**
  String get keepPracticing;

  /// No description provided for @overallScore.
  ///
  /// In en, this message translates to:
  /// **'Overall Score: {score}/100'**
  String overallScore(String score);

  /// No description provided for @backToTopics.
  ///
  /// In en, this message translates to:
  /// **'Back to Topics'**
  String get backToTopics;

  /// No description provided for @fluency.
  ///
  /// In en, this message translates to:
  /// **'Fluency'**
  String get fluency;

  /// No description provided for @grammar.
  ///
  /// In en, this message translates to:
  /// **'Grammar'**
  String get grammar;

  /// No description provided for @vocabulary_skill.
  ///
  /// In en, this message translates to:
  /// **'Vocabulary'**
  String get vocabulary_skill;

  /// No description provided for @pronunciation.
  ///
  /// In en, this message translates to:
  /// **'Pronunciation'**
  String get pronunciation;

  /// No description provided for @coherence.
  ///
  /// In en, this message translates to:
  /// **'Coherence'**
  String get coherence;

  /// No description provided for @beginner.
  ///
  /// In en, this message translates to:
  /// **'Beginner'**
  String get beginner;

  /// No description provided for @intermediate.
  ///
  /// In en, this message translates to:
  /// **'Intermediate'**
  String get intermediate;

  /// No description provided for @advanced.
  ///
  /// In en, this message translates to:
  /// **'Advanced'**
  String get advanced;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'es', 'pt', 'qu', 'ru'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'es':
      return AppLocalizationsEs();
    case 'pt':
      return AppLocalizationsPt();
    case 'qu':
      return AppLocalizationsQu();
    case 'ru':
      return AppLocalizationsRu();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
