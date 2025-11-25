import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/locale_provider.dart';
import 'providers/progress_provider.dart';
import 'providers/lives_provider.dart';
import 'providers/evaluation_provider.dart';
import 'providers/episode_provider.dart';
import 'providers/approval_provider.dart';
import 'providers/favorites_provider.dart';
import 'providers/vocabulary_chapters_provider.dart';
import 'providers/vocabulary_practice_provider.dart';
import 'providers/reading_chapters_provider.dart';
import 'providers/reading_content_provider.dart';
import 'providers/interview_provider.dart';

import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/loading_screen.dart';
import 'l10n/app_localizations.dart';
import 'utils/environment_config.dart';

Future<void> main() async {
  // Ensure Flutter bindings are initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Log environment configuration in development mode
  EnvironmentConfig.logConfiguration();

  runApp(const EnglishApp());
}

class EnglishApp extends StatelessWidget {
  const EnglishApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => LocaleProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ProgressProvider()),
        ChangeNotifierProxyProvider<AuthProvider, LivesProvider>(
          create: (context) => LivesProvider(
            Provider.of<AuthProvider>(context, listen: false),
          ),
          update: (context, auth, previous) => previous ?? LivesProvider(auth),
        ),
        ChangeNotifierProxyProvider<AuthProvider, EvaluationProvider>(
          create: (context) => EvaluationProvider(
            Provider.of<AuthProvider>(context, listen: false),
          ),
          update: (context, auth, previous) =>
              previous ?? EvaluationProvider(auth),
        ),
        ChangeNotifierProvider(create: (_) => EpisodeProvider()),
        ChangeNotifierProvider(create: (_) => ApprovalProvider()),
        ChangeNotifierProvider(create: (_) => FavoritesProvider()),
        ChangeNotifierProxyProvider<AuthProvider, VocabularyChaptersProvider>(
          create: (context) => VocabularyChaptersProvider(
            Provider.of<AuthProvider>(context, listen: false),
          ),
          update: (context, auth, previous) =>
              previous ?? VocabularyChaptersProvider(auth),
        ),
        ChangeNotifierProxyProvider<AuthProvider, VocabularyPracticeProvider>(
          create: (context) => VocabularyPracticeProvider(
            Provider.of<AuthProvider>(context, listen: false),
          ),
          update: (context, auth, previous) =>
              previous ?? VocabularyPracticeProvider(auth),
        ),
        ChangeNotifierProxyProvider<AuthProvider, ReadingChaptersProvider>(
          create: (context) => ReadingChaptersProvider(
            Provider.of<AuthProvider>(context, listen: false),
          ),
          update: (context, auth, previous) =>
              previous ?? ReadingChaptersProvider(auth),
        ),
        ChangeNotifierProxyProvider<AuthProvider, ReadingContentProvider>(
          create: (context) => ReadingContentProvider(
            Provider.of<AuthProvider>(context, listen: false),
          ),
          update: (context, auth, previous) =>
              previous ?? ReadingContentProvider(auth),
        ),
        ChangeNotifierProxyProvider2<AuthProvider, ProgressProvider, InterviewProvider>(
          create: (context) => InterviewProvider(
            Provider.of<AuthProvider>(context, listen: false),
            Provider.of<ProgressProvider>(context, listen: false),
          ),
          update: (context, auth, progress, previous) =>
              previous ?? InterviewProvider(auth, progress),
        ),
      ],
      child: Consumer2<ThemeProvider, LocaleProvider>(
        builder: (context, themeProvider, localeProvider, child) {
          // Show loading screen while theme is being initialized
          if (!themeProvider.isInitialized) {
            return MaterialApp(
              title: 'EnglishApp',
              theme: ThemeData.light(),
              darkTheme: ThemeData.dark(),
              home: const Scaffold(
                body: Center(
                  child: CircularProgressIndicator(),
                ),
              ),
            );
          }

          return MaterialApp(
            title: 'EnglishApp',
            debugShowCheckedModeBanner: false,

            // Theme Configuration
            theme: themeProvider.lightTheme,
            darkTheme: themeProvider.darkTheme,
            themeMode: themeProvider.themeMode,

            // Localization Configuration
            locale: localeProvider.locale,
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: AppLocalizations.supportedLocales,

            // Initial Route
            home: Consumer<AuthProvider>(
              builder: (context, authProvider, child) {
                switch (authProvider.authState) {
                  case AuthState.initial:
                  case AuthState.loading:
                    return const LoadingScreen(
                      duration: Duration(seconds: 3),
                    );
                  case AuthState.authenticated:
                    return const HomeScreen();
                  case AuthState.unauthenticated:
                  case AuthState.error:
                    return const LoginScreen();
                }
              },
            ),
          );
        },
      ),
    );
  }
}
