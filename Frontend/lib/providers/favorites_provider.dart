import 'package:flutter/foundation.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/favorite_word.dart';
import '../models/favorites_response.dart';
import '../utils/api_service.dart';
import '../utils/environment_config.dart';

class FavoritesProvider with ChangeNotifier {
  static Database? _database;
  final ApiService _apiService = ApiService();

  List<FavoriteWord> _favorites = [];
  bool _isLoading = false;
  String? _error;
  DateTime? _lastSyncTime;

  // Getters
  List<FavoriteWord> get favorites => List.unmodifiable(_favorites);
  bool get isLoading => _isLoading;
  String? get error => _error;
  DateTime? get lastSyncTime => _lastSyncTime;
  bool get hasError => _error != null;
  int get favoritesCount => _favorites.length;

  // Initialize the local database
  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final databasesPath = await getDatabasesPath();
    final path = join(databasesPath, 'favorites.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE favorite_words (
            id TEXT PRIMARY KEY,
            word TEXT NOT NULL,
            translation TEXT NOT NULL,
            language TEXT NOT NULL,
            pronunciation TEXT,
            definition TEXT,
            examples TEXT,
            audio_url TEXT,
            category TEXT,
            difficulty_level TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            is_synced INTEGER DEFAULT 0,
            server_id TEXT
          )
        ''');

        await db.execute('CREATE INDEX idx_favorite_words_word ON favorite_words(word)');
        await db.execute('CREATE INDEX idx_favorite_words_language ON favorite_words(language)');
        await db.execute('CREATE INDEX idx_favorite_words_category ON favorite_words(category)');
        await db.execute('CREATE INDEX idx_favorite_words_sync ON favorite_words(is_synced)');
      },
    );
  }

  // Load favorites from local database
  Future<void> loadFavorites() async {
    try {
      _setLoading(true);
      _clearError();

      final db = await database;
      final List<Map<String, dynamic>> maps = await db.query(
        'favorite_words',
        orderBy: 'created_at DESC',
      );

      _favorites = maps.map((map) => FavoriteWord.fromLocalDb(map)).toList();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load favorites: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Add a word to favorites
  Future<bool> addToFavorites(
    FavoriteWord favoriteWord, {
    String? token,
  }) async {
    try {
      _setLoading(true);
      _clearError();

      // Check if word already exists
      final wordToCheck = favoriteWord.word ?? favoriteWord.originalWord ?? '';
      if (wordToCheck.isNotEmpty && isFavorite(wordToCheck)) {
        _setError('Word is already in favorites');
        return false;
      }

      // Save to local database first
      final db = await database;
      await db.insert(
        'favorite_words',
        favoriteWord.toLocalDb(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );

      // Add to local list
      _favorites.insert(0, favoriteWord);
      notifyListeners();

      // Try to sync with server (fire & forget)
      _syncToServer(favoriteWord, token);

      return true;
    } catch (e) {
      _setError('Failed to add favorite: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Remove a word from favorites
  Future<bool> removeFromFavorites(String wordId, {String? token}) async {
    try {
      _setLoading(true);
      _clearError();

      final favoriteWord = _favorites.firstWhere(
        (f) => f.id == wordId,
        orElse: () => throw Exception('Favorite not found'),
      );

      // Remove from local database
      final db = await database;
      await db.delete('favorite_words', where: 'id = ?', whereArgs: [wordId]);

      // Remove from local list
      _favorites.removeWhere((f) => f.id == wordId);
      notifyListeners();

      // Try to sync with server
      if (favoriteWord.serverId != null) {
        _removeFromServer(favoriteWord.serverId!, token);
      }

      return true;
    } catch (e) {
      _setError('Failed to remove favorite: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Check if a word is in favorites
  bool isFavorite(String word) {
    return _favorites.any((f) => 
      (f.word?.toLowerCase() ?? f.originalWord?.toLowerCase() ?? '') == word.toLowerCase());
  }

  // Get favorite by word
  FavoriteWord? getFavoriteByWord(String word) {
    try {
      return _favorites.firstWhere(
        (f) => (f.word?.toLowerCase() ?? f.originalWord?.toLowerCase() ?? '') == word.toLowerCase(),
      );
    } catch (_) {
      return null;
    }
  }

  // Get favorites by category
  List<FavoriteWord> getFavoritesByCategory(String category) {
    return _favorites.where((f) => f.category == category).toList();
  }

  // Get favorites by language
  List<String> getLanguages() {
    final languages = _favorites
        .map((f) => f.language ?? f.sourceLanguage ?? 'Unknown')
        .where((lang) => lang.isNotEmpty)
        .toSet()
        .toList();
    languages.sort();
    return languages;
  }

  // Search favorites
  List<FavoriteWord> searchFavorites(String query) {
    final lowercaseQuery = query.toLowerCase();
    return _favorites
        .where(
          (f) =>
              (f.word?.toLowerCase() ?? f.originalWord?.toLowerCase() ?? '').contains(lowercaseQuery) ||
              f.translation.toLowerCase().contains(lowercaseQuery) ||
              (f.definition?.toLowerCase().contains(lowercaseQuery) ?? false),
        )
        .toList();
  }

  // Sync with server
  Future<void> syncWithServer({String? token}) async {
    try {
      _setLoading(true);
      _clearError();

      // Get favorites from server
      final endpoint = '${EnvironmentConfig.fullApiUrl}/api/favorites';
      final response = await _apiService.get(endpoint, token: token);

      if (response.success && response.data != null) {
        final favoritesResponse = FavoritesResponse.fromJson(response.data);
        final serverFavorites = favoritesResponse.favorites;

        // Merge with local favorites
        await _mergeFavorites(serverFavorites);

        // Sync unsynced local favorites to server
        await _syncUnsyncedToServer(token);

        _lastSyncTime = DateTime.now();
        notifyListeners();
      } else {
        _setError('Failed to sync with server: ${response.message}');
      }
    } catch (e) {
      _setError('Sync failed: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Merge server favorites with local ones
  Future<void> _mergeFavorites(List<FavoriteWord> serverFavorites) async {
    final db = await database;

    for (final serverFavorite in serverFavorites) {
      // Check if we have this favorite locally
      final existingIndex = _favorites.indexWhere(
        (f) => f.serverId == serverFavorite.serverId,
      );

      if (existingIndex >= 0) {
        // Update existing favorite if server version is newer
        final localFavorite = _favorites[existingIndex];
        final serverUpdatedAt = serverFavorite.updatedAt;
        final localUpdatedAt = localFavorite.updatedAt;
        
        // Update if server has updatedAt and (local doesn't have updatedAt or server is newer)
        if (serverUpdatedAt != null && 
            (localUpdatedAt == null || serverUpdatedAt.isAfter(localUpdatedAt))) {
          _favorites[existingIndex] = serverFavorite.copyWith(isSynced: true);
          await db.update(
            'favorite_words',
            serverFavorite.copyWith(isSynced: true).toLocalDb(),
            where: 'id = ?',
            whereArgs: [localFavorite.id],
          );
        }
      } else {
        // Add new favorite from server
        final newFavorite = serverFavorite.copyWith(isSynced: true);
        _favorites.add(newFavorite);
        await db.insert(
          'favorite_words',
          newFavorite.toLocalDb(),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      }
    }

    // Sort favorites by creation date (newest first)
    _favorites.sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  // Sync unsynced local favorites to server
  Future<void> _syncUnsyncedToServer(String? token) async {
    final unsyncedFavorites = _favorites.where((f) => !f.isSynced).toList();
    for (final favorite in unsyncedFavorites) {
      await _syncToServer(favorite, token);
    }
  }

  // Sync individual favorite to server
  Future<void> _syncToServer(FavoriteWord favoriteWord, String? token) async {
    try {
      final endpoint = '${EnvironmentConfig.fullApiUrl}/api/favorites';
      final response = await _apiService.post(
        endpoint,
        body: favoriteWord.toJson(),
        token: token,
      );

      if (response.success && response.data != null) {
        // Update local favorite with server ID
        final serverFavorite = FavoriteWord.fromJson(response.data);
        final index = _favorites.indexWhere((f) => f.id == favoriteWord.id);

        if (index >= 0) {
          _favorites[index] = _favorites[index].copyWith(
            serverId: serverFavorite.serverId,
            isSynced: true,
            updatedAt: serverFavorite.updatedAt,
          );

          // Update in database
          final db = await database;
          await db.update(
            'favorite_words',
            _favorites[index].toLocalDb(),
            where: 'id = ?',
            whereArgs: [favoriteWord.id],
          );
        }
      }
    } catch (e) {
      if (EnvironmentConfig.enableLogging && EnvironmentConfig.isDevelopment) {
        debugPrint('❌ Failed to sync favorite to server: $e');
      }
    }
  }

  // Remove favorite from server
  Future<void> _removeFromServer(String serverId, String? token) async {
    try {
      final endpoint =
          '${EnvironmentConfig.fullApiUrl}/api/favorites/$serverId';
      await _apiService.delete(endpoint, token: token);
    } catch (e) {
      if (EnvironmentConfig.enableLogging && EnvironmentConfig.isDevelopment) {
        debugPrint('❌ Failed to remove favorite from server: $e');
      }
    }
  }

  // Clear all favorites
  Future<void> clearAllFavorites({String? token}) async {
    try {
      _setLoading(true);
      _clearError();

      // Clear local database
      final db = await database;
      await db.delete('favorite_words');

      // Clear local list
      _favorites.clear();
      notifyListeners();

      // Clear on server if token provided
      if (token != null) {
        final endpoint = '${EnvironmentConfig.fullApiUrl}/api/favorites/clear';
        await _apiService.delete(endpoint, token: token);
      }
    } catch (e) {
      _setError('Failed to clear favorites: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Get categories
  List<String> getCategories() {
    final categories = _favorites
        .where((f) => f.category != null)
        .map((f) => f.category!)
        .toSet()
        .toList();
    categories.sort();
    return categories;
  }

  // Helper methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }

  // Dispose
  @override
  void dispose() {
    _database?.close();
    super.dispose();
  }
}
