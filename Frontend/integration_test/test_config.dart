import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

/// Configuration class for E2E tests
class TestConfig {
  // Test timeouts
  static const Duration defaultTimeout = Duration(seconds: 30);
  static const Duration loadingTimeout = Duration(seconds: 5);
  static const Duration animationTimeout = Duration(milliseconds: 500);
  
  // Test data
  static const String validEmail = 'testuser9@example.com';
  static const String invalidEmail = 'invalid-email';
  static const String validPassword = 'password123456';
  static const String shortPassword = 'short';
  
  // Expected error messages
  static const String emailRequiredError = 'Please enter a valid email address';
  static const String passwordTooShortError = 'Password must be at least 6 characters';
  
  // Screen identifiers
  static const String loginScreenTitle = 'Welcome Back!';
  static const String loginScreenSubtitle = 'Sign in to continue your English learning journey';
  static const String homeScreenTitle = 'Home';
  static const String forgotPasswordTitle = 'Reset Password';
  
  // Widget keys
  static const String emailFieldKey = 'email_field';
  static const String passwordFieldKey = 'password_field';
  static const String loginButtonKey = 'login_button';
  static const String googleLoginButtonKey = 'google_login_button';
  static const String appleLoginButtonKey = 'apple_login_button';
  static const String rememberMeCheckboxKey = 'remember_me_checkbox';
}

/// Helper functions for E2E tests
class TestHelpers {
  /// Wait for loading to complete
  static Future<void> waitForLoading(WidgetTester tester, {Duration? timeout}) async {
    await tester.pumpAndSettle(timeout ?? TestConfig.loadingTimeout);
  }
  
  /// Wait for animations to complete
  static Future<void> waitForAnimations(WidgetTester tester) async {
    await tester.pumpAndSettle(TestConfig.animationTimeout);
  }
  
  /// Enter text in a field and wait for validation
  static Future<void> enterTextAndValidate(
    WidgetTester tester,
    String key,
    String text,
  ) async {
    final field = find.byKey(Key(key));
    expect(field, findsOneWidget);
    
    await tester.tap(field);
    await tester.enterText(field, text);
    await tester.pump();
  }
  
  /// Verify screen navigation
  static void verifyScreenNavigation(String expectedTitle) {
    expect(find.text(expectedTitle), findsOneWidget);
  }
  
  /// Verify error message appears
  static void verifyErrorMessage(String errorMessage) {
    expect(find.text(errorMessage), findsOneWidget);
  }
  
  /// Tap button and wait for response
  static Future<void> tapButtonAndWait(
    WidgetTester tester,
    String buttonKey, {
    Duration? waitTime,
  }) async {
    final button = find.byKey(Key(buttonKey));
    expect(button, findsOneWidget);
    
    await tester.tap(button);
    await tester.pumpAndSettle(waitTime ?? TestConfig.loadingTimeout);
  }
}