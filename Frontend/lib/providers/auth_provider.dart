import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../l10n/app_localizations.dart';
import '../utils/environment_config.dart';

enum AuthState {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}

class AuthProvider with ChangeNotifier {
  static const String _userKey = 'user_data';
  static const String _isLoggedInKey = 'is_logged_in';
  static const String _tokenKey = 'auth_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _refreshTokenCookieKey = 'refresh_token_cookie';

  AuthState _authState = AuthState.initial;
  UserModel? _user;
  String? _errorMessage;
  String? _accessToken;
  String? _refreshToken;
  String? _refreshTokenCookie; // Cookie string for HttpOnly refresh token
  
  AuthState get authState => _authState;
  UserModel? get user => _user;
  String? get errorMessage => _errorMessage;
  String? get token => _accessToken;
  bool get isAuthenticated => _authState == AuthState.authenticated;
  bool get isLoading => _authState == AuthState.loading;
  
  AuthProvider() {
    _checkAuthStatus();
  }
  
  Future<void> _checkAuthStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool(_isLoggedInKey) ?? false;
      
      if (isLoggedIn) {
        final userData = prefs.getString(_userKey);
        if (userData != null) {
          _user = UserModel.fromJson(userData);
          await _loadTokens(); // Load saved tokens
          _authState = AuthState.authenticated;
        } else {
          _authState = AuthState.unauthenticated;
        }
      } else {
        _authState = AuthState.unauthenticated;
      }
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      _errorMessage = 'Error checking authentication status';
      notifyListeners();
    }
  }
  
  Future<void> checkAuthStatus(BuildContext context) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool(_isLoggedInKey) ?? false;
      
      if (isLoggedIn) {
        final userData = prefs.getString(_userKey);
        if (userData != null) {
          _user = UserModel.fromJson(userData);
          _authState = AuthState.authenticated;
        } else {
          _authState = AuthState.unauthenticated;
        }
      } else {
        _authState = AuthState.unauthenticated;
      }
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      if (context.mounted) {
        _errorMessage = AppLocalizations.of(context)!.errorCheckingAuth;
      } else {
        _errorMessage = 'Error checking authentication status';
      }
      notifyListeners();
    }
  }
  
  Future<bool> login(BuildContext context, String email, String password) async {
    _setLoading(true);
    
    try {
      // Basic validation
      if (email.isEmpty || password.isEmpty) {
        final errorMsg = context.mounted 
            ? AppLocalizations.of(context)!.emailPasswordRequired
            : 'Email and password are required';
        throw Exception(errorMsg);
      }
      
      if (!_isValidEmail(email)) {
        final errorMsg = context.mounted 
            ? AppLocalizations.of(context)!.emailInvalid
            : 'Invalid email format';
        throw Exception(errorMsg);
      }
      
      if (password.length < 12) {
        final errorMsg = context.mounted 
            ? AppLocalizations.of(context)!.passwordTooShort
            : 'Password must be at least 12 characters';
        throw Exception(errorMsg);
      }
      
      // Prepare request body according to backend expectations
      final requestBody = {
        'email': email.trim().toLowerCase(),
        'password': password,
      };
      
      // Log configuration for debugging
      if (EnvironmentConfig.isDevelopment) {
        EnvironmentConfig.logConfiguration();
        debugPrint('🔄 Making login request to: ${EnvironmentConfig.loginEndpoint}');
        debugPrint('📤 Request body: $requestBody');
      }
      
      // Make API call to backend - use http directly to capture cookies
      final httpResponse = await http.post(
        Uri.parse(EnvironmentConfig.loginEndpoint),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': EnvironmentConfig.apiBaseUrl,
        },
        body: jsonEncode(requestBody),
      );

      if (EnvironmentConfig.isDevelopment) {
        debugPrint('📥 Login response: ${httpResponse.statusCode}');
        debugPrint('📊 Response data: ${httpResponse.body}');
        debugPrint('🍪 Cookies: ${httpResponse.headers['set-cookie']}');
      }

      if (httpResponse.statusCode >= 200 && httpResponse.statusCode < 300) {
        // Parse response data
        final responseData = jsonDecode(httpResponse.body) as Map<String, dynamic>?;

        if (responseData != null) {
          // Extract tokens from LoginResponseDto structure
          _accessToken = responseData['accessToken'] as String?;

          // Extract refresh token cookie from Set-Cookie header
          final setCookieHeader = httpResponse.headers['set-cookie'];
          if (setCookieHeader != null) {
            _refreshTokenCookie = _extractRefreshTokenCookie(setCookieHeader);
            if (EnvironmentConfig.isDevelopment) {
              debugPrint('🍪 Extracted refresh token cookie: $_refreshTokenCookie');
            }
          }
          // Note: refreshToken comes in HttpOnly cookie, not in response body as per backend security
          
          // Create user from LoginResponseDto fields
          _user = UserModel(
            id: responseData['userId'] ?? '',
            name: responseData['fullName'] ?? email.split('@').first,
            email: responseData['email'] ?? email,
            profileImage: null, // Profile image not included in login response
          );
          
          // Save user data and tokens
          await _saveUserData();
          if (_accessToken != null) {
            await _saveTokens();
          }
          
          _authState = AuthState.authenticated;
          _errorMessage = null;
          notifyListeners();
          
          return true;
        } else {
          throw Exception('Invalid response format');
        }
      } else {
        // Handle error response
        final errorData = jsonDecode(httpResponse.body) as Map<String, dynamic>?;
        final errorMessage = errorData?['message'] ?? 'Login failed';
        throw Exception(errorMessage);
      }
    } catch (e) {
      if (EnvironmentConfig.isDevelopment) {
        debugPrint('❌ Login error: $e');
      }
      _authState = AuthState.unauthenticated;
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      return false;
    } finally {
      _setLoading(false);
    }
  }
  
  Future<bool> loginWithGoogle(BuildContext context) async {
    _setLoading(true);
    
    try {
      await Future.delayed(const Duration(seconds: 2));
      
      _user = UserModel(
        id: '2',
        name: 'Ximena',
        email: 'ximena@gmail.com',
        profileImage: null,
      );
      
      await _saveUserData();
      _authState = AuthState.authenticated;
      _errorMessage = null;
      notifyListeners();
      
      return true;
    } catch (e) {
      _authState = AuthState.error;
      if (context.mounted) {
        _errorMessage = AppLocalizations.of(context)!.googleSignInFailed;
      } else {
        _errorMessage = 'Google sign in failed';
      }
      notifyListeners();
      return false;
    }
  }
  
  Future<bool> loginWithApple(BuildContext context) async {
    _setLoading(true);
    
    try {
      await Future.delayed(const Duration(seconds: 2));
      
      _user = UserModel(
        id: '3',
        name: 'Ximena',
        email: 'ximena@icloud.com',
        profileImage: null,
      );
      
      await _saveUserData();
      _authState = AuthState.authenticated;
      _errorMessage = null;
      notifyListeners();
      
      return true;
    } catch (e) {
      _authState = AuthState.error;
      if (context.mounted) {
        _errorMessage = AppLocalizations.of(context)!.appleSignInFailed;
      } else {
        _errorMessage = 'Apple sign in failed';
      }
      notifyListeners();
      return false;
    }
  }
  
  Future<void> logout(BuildContext context) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_userKey);
      await prefs.setBool(_isLoggedInKey, false);
      await _clearTokens(); // Clear stored tokens
      
      _user = null;
      _authState = AuthState.unauthenticated;
      _errorMessage = null;
      notifyListeners();
    } catch (e) {
      if (context.mounted) {
        _errorMessage = AppLocalizations.of(context)!.errorDuringLogout;
      } else {
        _errorMessage = 'Error during logout';
      }
      notifyListeners();
    }
  }
  
  void clearError() {
    _errorMessage = null;
    if (_authState == AuthState.error || _authState == AuthState.loading) {
      _authState = AuthState.unauthenticated;
    }
    notifyListeners();
  }

  // Real API registration method
  Future<bool> register(BuildContext context, String fullName, String email, String password, String confirmPassword) async {
    _setLoading(true);
    
    try {
      // Basic validation
      if (fullName.isEmpty || email.isEmpty || password.isEmpty || confirmPassword.isEmpty) {
        final errorMsg = context.mounted 
            ? AppLocalizations.of(context)!.emailPasswordRequired
            : 'All fields are required';
        throw Exception(errorMsg);
      }
      
      if (!_isValidEmail(email)) {
        final errorMsg = context.mounted 
            ? AppLocalizations.of(context)!.emailInvalid
            : 'Invalid email format';
        throw Exception(errorMsg);
      }
      
      if (password.length < 12) {
        final errorMsg = context.mounted 
            ? AppLocalizations.of(context)!.passwordTooShort
            : 'Password must be at least 12 characters';
        throw Exception(errorMsg);
      }
      
      if (password != confirmPassword) {
        final errorMsg = context.mounted 
            ? AppLocalizations.of(context)!.passwordTooShort
            : 'Passwords do not match';
        throw Exception(errorMsg);
      }
      
      // Prepare request body according to backend expectations
      final requestBody = {
        'fullName': fullName.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
        'confirmPassword': confirmPassword,
      };
      
      // Log configuration for debugging
      if (EnvironmentConfig.isDevelopment) {
        EnvironmentConfig.logConfiguration();
        debugPrint('🔄 Making register request to: ${EnvironmentConfig.registerEndpoint}');
        debugPrint('📤 Request body: $requestBody');
      }

      // Make API call - use http directly to capture cookies
      final httpResponse = await http.post(
        Uri.parse(EnvironmentConfig.registerEndpoint),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': EnvironmentConfig.apiBaseUrl,
        },
        body: jsonEncode(requestBody),
      );

      if (EnvironmentConfig.isDevelopment) {
        debugPrint('📥 Register response: ${httpResponse.statusCode}');
        debugPrint('📊 Response data: ${httpResponse.body}');
        debugPrint('🍪 Cookies: ${httpResponse.headers['set-cookie']}');
      }

      if (httpResponse.statusCode >= 200 && httpResponse.statusCode < 300) {
        // Parse response data
        final responseData = jsonDecode(httpResponse.body) as Map<String, dynamic>?;

        if (responseData != null) {
          // Extract tokens from RegisterResponseDto structure
          _accessToken = responseData['accessToken'] as String?;

          // Extract refresh token cookie from Set-Cookie header
          final setCookieHeader = httpResponse.headers['set-cookie'];
          if (setCookieHeader != null) {
            _refreshTokenCookie = _extractRefreshTokenCookie(setCookieHeader);
            if (EnvironmentConfig.isDevelopment) {
              debugPrint('🍪 Extracted refresh token cookie: $_refreshTokenCookie');
            }
          }
          // Note: refreshToken comes in HttpOnly cookie, not in response body as per backend security
          _refreshToken = null; // Set to null since it comes via cookie
          
          // Create user from RegisterResponseDto fields
          _user = UserModel(
            id: responseData['userId'] ?? '',
            name: responseData['fullName'] ?? fullName,
            email: responseData['email'] ?? email,
            profileImage: null, // Profile image not included in registration response
          );
          
          // Save user data and tokens
          await _saveUserData();
          await _saveTokens();
          
          _authState = AuthState.authenticated;
          _errorMessage = null;
          notifyListeners();
          
          return true;
        } else {
          throw Exception('Invalid response format');
        }
      } else {
        // Handle error response
        final errorData = jsonDecode(httpResponse.body) as Map<String, dynamic>?;
        final errorMessage = errorData?['message'] ?? 'Registration failed';
        throw Exception(errorMessage);
      }
    } catch (e) {
      if (EnvironmentConfig.isDevelopment) {
        debugPrint('❌ Register error: $e');
      }
      _authState = AuthState.unauthenticated;
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  // Mock login method - always successful
  Future<void> mockLogin(BuildContext context) async {
    try {
      _setLoading(true);
      
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Create mock user
      _user = UserModel(
        id: 'mock_user_123',
        name: 'Usuario Demo',
        email: 'demo@example.com',
      );
      
      _authState = AuthState.authenticated;
      _errorMessage = null;
      
      // Save user data
      await _saveUserData();
      
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      if (context.mounted) {
        _errorMessage = AppLocalizations.of(context)!.errorInMockLogin;
      } else {
        _errorMessage = 'Error in mock login';
      }
      notifyListeners();
    }
  }
  
  void _setLoading(bool loading) {
    if (loading) {
      _authState = AuthState.loading;
      _errorMessage = null;
    } else {
      // Reset to unauthenticated when loading stops (if not authenticated)
      if (_authState == AuthState.loading) {
        _authState = AuthState.unauthenticated;
      }
    }
    notifyListeners();
  }
  
  bool _isValidEmail(String email) {
    return RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$').hasMatch(email);
  }
  
  Future<void> _saveUserData() async {
    if (_user != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_userKey, _user!.toJson());
      await prefs.setBool(_isLoggedInKey, true);
    }
  }
  
  Future<void> _saveTokens() async {
    final prefs = await SharedPreferences.getInstance();
    if (_accessToken != null) {
      await prefs.setString(_tokenKey, _accessToken!);
    }
    if (_refreshToken != null) {
      await prefs.setString(_refreshTokenKey, _refreshToken!);
    }
    if (_refreshTokenCookie != null) {
      await prefs.setString(_refreshTokenCookieKey, _refreshTokenCookie!);
    }
  }

  Future<void> _loadTokens() async {
    final prefs = await SharedPreferences.getInstance();
    _accessToken = prefs.getString(_tokenKey);
    _refreshToken = prefs.getString(_refreshTokenKey);
    _refreshTokenCookie = prefs.getString(_refreshTokenCookieKey);
  }
  
  Future<void> _clearTokens() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_refreshTokenKey);
    await prefs.remove(_refreshTokenCookieKey);
    _accessToken = null;
    _refreshToken = null;
    _refreshTokenCookie = null;
  }

  /// Extract refresh token cookie from Set-Cookie header
  String? _extractRefreshTokenCookie(String setCookieHeader) {
    try {
      // The set-cookie header may contain multiple cookies separated by commas
      // We need to find the one named "refreshToken"
      final cookies = setCookieHeader.split(',');

      for (final cookie in cookies) {
        final trimmed = cookie.trim();
        if (trimmed.startsWith('refreshToken=')) {
          // Extract just the cookie name=value part (before any attributes like Path, HttpOnly, etc.)
          final parts = trimmed.split(';');
          if (parts.isNotEmpty) {
            return parts[0].trim(); // Returns "refreshToken=<value>"
          }
        }
      }
      return null;
    } catch (e) {
      debugPrint('Error extracting refresh token cookie: $e');
      return null;
    }
  }
  
  /// Intenta renovar el token de acceso
  /// Retorna true si la renovación fue exitosa, false en caso contrario
  Future<bool> refreshToken() async {
    if (_authState != AuthState.authenticated) {
      return false;
    }

    try {
      // Load tokens if not in memory
      if (_refreshTokenCookie == null) {
        await _loadTokens();
      }

      // Si no hay cookie de refresh token, intentar auto-login
      if (_refreshTokenCookie == null) {
        debugPrint('No refresh token cookie available, attempting auto-login');
        return await autoLogin();
      }

      if (EnvironmentConfig.isDevelopment) {
        debugPrint('🔄 Attempting token refresh with cookie: $_refreshTokenCookie');
      }

      // Intentar renovar el token usando el endpoint de refresh
      final response = await http.post(
        Uri.parse(EnvironmentConfig.refreshTokenEndpoint),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': _refreshTokenCookie!, // Send refresh token cookie
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': EnvironmentConfig.apiBaseUrl,
        },
      );

      if (EnvironmentConfig.isDevelopment) {
        debugPrint('📥 Refresh response: ${response.statusCode}');
        debugPrint('🍪 New cookies: ${response.headers['set-cookie']}');
      }

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        _accessToken = responseData['accessToken'] as String?;

        // Extract new refresh token cookie if provided (token rotation)
        final setCookieHeader = response.headers['set-cookie'];
        if (setCookieHeader != null) {
          _refreshTokenCookie = _extractRefreshTokenCookie(setCookieHeader);
          if (EnvironmentConfig.isDevelopment) {
            debugPrint('🍪 New refresh token cookie: $_refreshTokenCookie');
          }
        }

        if (_accessToken != null) {
          await _saveTokens();
          if (EnvironmentConfig.isDevelopment) {
            debugPrint('✅ Token refreshed successfully');
          }
          return true;
        }
      }

      // Si la renovación falla, intentar auto-login como fallback
      debugPrint('⚠️ Refresh failed with status ${response.statusCode}, attempting auto-login');
      return await autoLogin();
    } catch (e) {
      debugPrint('❌ Error al renovar token: $e');
      return false;
    }
  }
  
  /// Intenta iniciar sesión automáticamente usando los datos guardados
  /// Retorna true si el auto-login fue exitoso, false en caso contrario
  Future<bool> autoLogin() async {
    try {
      // Cargar tokens guardados
      await _loadTokens();
      
      // Si no hay token de acceso, no podemos hacer auto-login
      if (_accessToken == null) {
        return false;
      }
      
      // Verificar si el token es válido haciendo una petición al endpoint de verificación
      final response = await http.get(
        Uri.parse('${EnvironmentConfig.authEndpoint}/verify'),
        headers: {
          'Authorization': 'Bearer $_accessToken',
        },
      );
      
      if (response.statusCode == 200) {
        // Token válido, cargar datos del usuario
        final userData = await SharedPreferences.getInstance().then(
          (prefs) => prefs.getString(_userKey),
        );
        
        if (userData != null) {
          _user = UserModel.fromJson(userData);
          _authState = AuthState.authenticated;
          notifyListeners();
          return true;
        }
      }
      
      // Si el token no es válido o no hay datos de usuario, limpiar tokens
      await _clearTokens();
      return false;
    } catch (e) {
      debugPrint('Error en auto-login: $e');
      return false;
    }
  }
}