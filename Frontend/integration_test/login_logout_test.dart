import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:english_app/main.dart' as app;
import 'test_config.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Login/Logout E2E Tests', () {
    setUp(() async {
      // Reset app state before each test
      app.main();
    });

    testWidgets('Login with valid credentials and logout', (WidgetTester tester) async {
      // Start the app
      app.main();
      await TestHelpers.waitForLoading(tester);

      // Verify we're on the login screen
      TestHelpers.verifyScreenNavigation(TestConfig.loginScreenTitle);
      expect(find.text(TestConfig.loginScreenSubtitle), findsOneWidget);

      // Enter valid email
      await TestHelpers.enterTextAndValidate(
        tester,
        TestConfig.emailFieldKey,
        TestConfig.validEmail,
      );

      // Enter valid password
      await TestHelpers.enterTextAndValidate(
        tester,
        TestConfig.passwordFieldKey,
        TestConfig.validPassword,
      );

      // Tap login button
      await TestHelpers.tapButtonAndWait(
        tester,
        TestConfig.loginButtonKey,
        waitTime: const Duration(seconds: 4),
      );

      // Verify successful login - should be on home screen
      TestHelpers.verifyScreenNavigation(TestConfig.homeScreenTitle);
      expect(find.text(TestConfig.loginScreenTitle), findsNothing);

      // Test logout functionality
      await _performLogout(tester);

      // Verify we're back to login screen
      TestHelpers.verifyScreenNavigation(TestConfig.loginScreenTitle);
    });

    testWidgets('Login form validation', (WidgetTester tester) async {
      // Start the app
      app.main();
      await TestHelpers.waitForLoading(tester);

      // Test invalid email validation
      await TestHelpers.enterTextAndValidate(
        tester,
        TestConfig.emailFieldKey,
        TestConfig.invalidEmail,
      );
      
      // Try to submit form to trigger validation
      await tester.tap(find.byKey(const Key(TestConfig.loginButtonKey)));
      await tester.pump();
      
      // Verify email validation error appears
      TestHelpers.verifyErrorMessage(TestConfig.emailRequiredError);

      // Test password validation
      await TestHelpers.enterTextAndValidate(
        tester,
        TestConfig.passwordFieldKey,
        TestConfig.shortPassword,
      );
      
      // Try to submit form to trigger validation
      await tester.tap(find.byKey(const Key(TestConfig.loginButtonKey)));
      await tester.pump();
      
      // Verify password validation error appears
      TestHelpers.verifyErrorMessage(TestConfig.passwordTooShortError);
    });

    testWidgets('Google login flow', (WidgetTester tester) async {
      // Start the app
      app.main();
      await TestHelpers.waitForLoading(tester);

      // Tap Google login button
      await TestHelpers.tapButtonAndWait(
        tester,
        TestConfig.googleLoginButtonKey,
        waitTime: const Duration(seconds: 4),
      );

      // Verify successful login
      TestHelpers.verifyScreenNavigation(TestConfig.homeScreenTitle);

      // Test logout
      await _performLogout(tester);
      TestHelpers.verifyScreenNavigation(TestConfig.loginScreenTitle);
    });

    testWidgets('Apple login flow', (WidgetTester tester) async {
      // Start the app
      app.main();
      await TestHelpers.waitForLoading(tester);

      // Tap Apple login button
      await TestHelpers.tapButtonAndWait(
        tester,
        TestConfig.appleLoginButtonKey,
        waitTime: const Duration(seconds: 4),
      );

      // Verify successful login
      TestHelpers.verifyScreenNavigation(TestConfig.homeScreenTitle);

      // Test logout
      await _performLogout(tester);
      TestHelpers.verifyScreenNavigation(TestConfig.loginScreenTitle);
    });

    testWidgets('Remember me functionality', (WidgetTester tester) async {
      // Start the app
      app.main();
      await TestHelpers.waitForLoading(tester);

      // Enter valid credentials
      await TestHelpers.enterTextAndValidate(
        tester,
        TestConfig.emailFieldKey,
        TestConfig.validEmail,
      );
      
      await TestHelpers.enterTextAndValidate(
        tester,
        TestConfig.passwordFieldKey,
        TestConfig.validPassword,
      );

      // Check remember me checkbox
      final rememberMeCheckbox = find.byKey(const Key(TestConfig.rememberMeCheckboxKey));
      if (rememberMeCheckbox.evaluate().isNotEmpty) {
        await tester.tap(rememberMeCheckbox);
        await tester.pump();
      }

      // Login
      await TestHelpers.tapButtonAndWait(
        tester,
        TestConfig.loginButtonKey,
        waitTime: const Duration(seconds: 4),
      );

      // Verify successful login
      TestHelpers.verifyScreenNavigation(TestConfig.homeScreenTitle);
    });

    testWidgets('Forgot password navigation', (WidgetTester tester) async {
      // Start the app
      app.main();
      await TestHelpers.waitForLoading(tester);

      // Find and tap forgot password link
      final forgotPasswordLink = find.text('Forgot Password?');
      if (forgotPasswordLink.evaluate().isNotEmpty) {
        await tester.tap(forgotPasswordLink);
        await TestHelpers.waitForLoading(tester);

        // Verify navigation to forgot password screen
        TestHelpers.verifyScreenNavigation(TestConfig.forgotPasswordTitle);

        // Navigate back
        await tester.pageBack();
        await TestHelpers.waitForLoading(tester);

        // Verify we're back to login screen
        TestHelpers.verifyScreenNavigation(TestConfig.loginScreenTitle);
      }
    });
  });
}

/// Helper function to perform logout
Future<void> _performLogout(WidgetTester tester) async {
  // Look for settings or profile button
  final settingsButton = find.byIcon(Icons.settings);
  final profileButton = find.byIcon(Icons.person);
  final menuButton = find.byIcon(Icons.menu);
  
  // Try different ways to access logout
  if (settingsButton.evaluate().isNotEmpty) {
    await tester.tap(settingsButton);
    await TestHelpers.waitForLoading(tester);
  } else if (profileButton.evaluate().isNotEmpty) {
    await tester.tap(profileButton);
    await TestHelpers.waitForLoading(tester);
  } else if (menuButton.evaluate().isNotEmpty) {
    await tester.tap(menuButton);
    await TestHelpers.waitForLoading(tester);
  }
  
  // Look for logout button
  final logoutButton = find.text('Logout');
  final signOutButton = find.text('Sign Out');
  final cerrarSesionButton = find.text('Cerrar Sesión');
  
  if (logoutButton.evaluate().isNotEmpty) {
    await tester.tap(logoutButton);
    await TestHelpers.waitForLoading(tester);
  } else if (signOutButton.evaluate().isNotEmpty) {
    await tester.tap(signOutButton);
    await TestHelpers.waitForLoading(tester);
  } else if (cerrarSesionButton.evaluate().isNotEmpty) {
    await tester.tap(cerrarSesionButton);
    await TestHelpers.waitForLoading(tester);
  }
}