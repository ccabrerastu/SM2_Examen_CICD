// ignore: unused_import
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/translation.dart';
import '../utils/api_service.dart';
import '../utils/environment_config.dart';

class TranslationService {
  static final TranslationService _instance = TranslationService._internal();
  factory TranslationService() => _instance;
  TranslationService._internal();

  static Database? _database;
  final ApiService _apiService = ApiService();

  // Initialize the local database
  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final databasesPath = await getDatabasesPath();
    final path = join(databasesPath, 'translations.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE translation_cache (
            id TEXT PRIMARY KEY,
            text_hash TEXT UNIQUE NOT NULL,
            original_text TEXT NOT NULL,
            translated_text TEXT NOT NULL,
            source_language TEXT NOT NULL,
            target_language TEXT NOT NULL,
            pronunciation TEXT,
            examples TEXT,
            audio_url TEXT,
            created_at INTEGER NOT NULL,
            expires_at INTEGER
          )
        ''');

        await db.execute('''
          CREATE INDEX idx_translation_cache_hash ON translation_cache(text_hash)
        ''');

        await db.execute('''
          CREATE INDEX idx_translation_cache_languages ON translation_cache(source_language, target_language)
        ''');

        await db.execute('''
          CREATE INDEX idx_translation_cache_expires ON translation_cache(expires_at)
        ''');
      },
    );
  }

  // Generate a hash for caching purposes
  String _generateTextHash(
    String text,
    String sourceLanguage,
    String targetLanguage,
  ) {
    return '$text-$sourceLanguage-$targetLanguage'.hashCode.toString();
  }

  // Get translation from cache
  Future<Translation?> _getFromCache(
    String text,
    String sourceLanguage,
    String targetLanguage,
  ) async {
    try {
      final db = await database;
      final textHash = _generateTextHash(text, sourceLanguage, targetLanguage);

      final List<Map<String, dynamic>> maps = await db.query(
        'translation_cache',
        where: 'text_hash = ? AND expires_at > ?',
        whereArgs: [textHash, DateTime.now().millisecondsSinceEpoch],
        limit: 1,
      );

      if (maps.isNotEmpty) {
        return Translation.fromLocalDb(maps.first);
      }
    } catch (e) {
      if (EnvironmentConfig.enableLogging && EnvironmentConfig.isDevelopment) {
        debugPrint('❌ Cache read error: $e');
      }
    }
    return null;
  }

  // Save translation to cache
  Future<void> _saveToCache(Translation translation) async {
    try {
      final db = await database;
      await db.insert(
        'translation_cache',
        translation.toLocalDb(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    } catch (e) {
      if (EnvironmentConfig.enableLogging && EnvironmentConfig.isDevelopment) {
        debugPrint('❌ Cache write error: $e');
      }
    }
  }

  // Clean expired cache entries
  Future<void> cleanExpiredCache() async {
    try {
      final db = await database;
      await db.delete(
        'translation_cache',
        where: 'expires_at < ?',
        whereArgs: [DateTime.now().millisecondsSinceEpoch],
      );
    } catch (e) {
      if (EnvironmentConfig.enableLogging && EnvironmentConfig.isDevelopment) {
        debugPrint('❌ Cache cleanup error: $e');
      }
    }
  }

  // Main translation method
  Future<TranslationResult> translate({
    required String text,
    required String sourceLanguage,
    required String targetLanguage,
    String? context,
    String? token,
  }) async {
    try {
      // Clean expired cache periodically
      await cleanExpiredCache();

      // Check cache first
      final cachedTranslation = await _getFromCache(
        text,
        sourceLanguage,
        targetLanguage,
      );
      if (cachedTranslation != null) {
        return TranslationResult(
          translation: cachedTranslation,
          fromCache: true,
          success: true,
        );
      }

      // If not in cache, call API
      // CORREGIDO: no duplicar /api porque fullApiUrl ya lo contiene (p.ej. .../api/v1)
      final endpoint = '${EnvironmentConfig.fullApiUrl}/translation/translate';

      final body = {
        'text': text,
        'sourceLanguage': sourceLanguage,
        'targetLanguage': targetLanguage,
        if (context != null) 'context': context,
      };

      final response = await _apiService.post(
        endpoint,
        body: body,
        token: token,
      );

      if (response.success && response.data != null) {
        final translation = Translation.fromJson(response.data);

        // Save to cache with 30-day expiration
        final cachedTranslation = translation.copyWith(
          expiresAt: DateTime.now().add(const Duration(days: 30)),
        );
        await _saveToCache(cachedTranslation);

        return TranslationResult(
          translation: translation,
          fromCache: false,
          success: true,
        );
      } else {
        return TranslationResult(
          translation: null,
          fromCache: false,
          success: false,
          error: response.message,
        );
      }
    } catch (e) {
      return TranslationResult(
        translation: null,
        fromCache: false,
        success: false,
        error: 'Translation failed: $e',
      );
    }
  }

  // Get translation history from cache
  Future<List<Translation>> getTranslationHistory({
    String? sourceLanguage,
    String? targetLanguage,
    int limit = 50,
  }) async {
    try {
      final db = await database;

      String whereClause = 'expires_at > ?';
      List<dynamic> whereArgs = [DateTime.now().millisecondsSinceEpoch];

      if (sourceLanguage != null) {
        whereClause += ' AND source_language = ?';
        whereArgs.add(sourceLanguage);
      }

      if (targetLanguage != null) {
        whereClause += ' AND target_language = ?';
        whereArgs.add(targetLanguage);
      }

      final List<Map<String, dynamic>> maps = await db.query(
        'translation_cache',
        where: whereClause,
        whereArgs: whereArgs,
        orderBy: 'created_at DESC',
        limit: limit,
      );

      return maps.map((map) => Translation.fromLocalDb(map)).toList();
    } catch (e) {
      if (EnvironmentConfig.enableLogging && EnvironmentConfig.isDevelopment) {
        debugPrint('❌ History fetch error: $e');
      }
      return [];
    }
  }

  // Clear all cache
  Future<void> clearCache() async {
    try {
      final db = await database;
      await db.delete('translation_cache');
    } catch (e) {
      if (EnvironmentConfig.enableLogging && EnvironmentConfig.isDevelopment) {
        debugPrint('❌ Cache clear error: $e');
      }
    }
  }

  // Get cache statistics
  Future<CacheStats> getCacheStats() async {
    try {
      final db = await database;

      final totalResult = await db.rawQuery(
        'SELECT COUNT(*) as count FROM translation_cache',
      );
      final total = (totalResult.first['count'] as int?) ?? 0;

      final expiredResult = await db.rawQuery(
        'SELECT COUNT(*) as count FROM translation_cache WHERE expires_at < ?',
        [DateTime.now().millisecondsSinceEpoch],
      );
      final expired = (expiredResult.first['count'] as int?) ?? 0;

      return CacheStats(
        totalEntries: total,
        expiredEntries: expired,
        validEntries: total - expired,
      );
    } catch (_) {
      return CacheStats(totalEntries: 0, expiredEntries: 0, validEntries: 0);
    }
  }
}

// Result wrapper for translation operations
class TranslationResult {
  final Translation? translation;
  final bool fromCache;
  final bool success;
  final String? error;

  TranslationResult({
    required this.translation,
    required this.fromCache,
    required this.success,
    this.error,
  });

  @override
  String toString() {
    return 'TranslationResult{success: $success, fromCache: $fromCache, error: $error}';
  }
}

// Cache statistics
class CacheStats {
  final int totalEntries;
  final int expiredEntries;
  final int validEntries;

  CacheStats({
    required this.totalEntries,
    required this.expiredEntries,
    required this.validEntries,
  });

  @override
  String toString() {
    return 'CacheStats{total: $totalEntries, expired: $expiredEntries, valid: $validEntries}';
  }
}
