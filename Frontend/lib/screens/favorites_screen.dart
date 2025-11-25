import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/favorites_provider.dart';
import '../providers/auth_provider.dart';
import '../models/favorite_word.dart';
import '../utils/audio_service.dart';
import '../l10n/app_localizations.dart';
import '../widgets/translation_panel_widget.dart';
import '../models/translation.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  final AudioService _audioService = AudioService();
  String _searchQuery = '';
  String _selectedCategory = 'all';
  String _selectedLanguage = 'all';
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadFavorites();
    });
  }

  Future<void> _loadFavorites() async {
    final favoritesProvider = Provider.of<FavoritesProvider>(context, listen: false);
    await favoritesProvider.loadFavorites();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    
    return Scaffold(
      backgroundColor: theme.colorScheme.surface,
      appBar: AppBar(
        title: const Text('Favorites'),
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: theme.colorScheme.onPrimary,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: _showSearchDialog,
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: Consumer<FavoritesProvider>(
        builder: (context, favoritesProvider, child) {
          if (favoritesProvider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (favoritesProvider.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64,
                    color: theme.colorScheme.error,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    favoritesProvider.error!,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.colorScheme.error,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadFavorites,
                    child: Text(l10n.retry),
                  ),
                ],
              ),
            );
          }

          final filteredFavorites = _getFilteredFavorites(favoritesProvider.favorites);

          if (filteredFavorites.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.favorite_border,
                    size: 64,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _searchQuery.isNotEmpty || _selectedCategory != 'all' || _selectedLanguage != 'all'
                        ? 'No favorites found matching your filters'
                        : 'No favorite words yet',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  if (_searchQuery.isNotEmpty || _selectedCategory != 'all' || _selectedLanguage != 'all') ...[
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _clearFilters,
                      child: const Text('Clear Filters'),
                    ),
                  ],
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              await _loadFavorites();
              // TODO: Sync with server
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: filteredFavorites.length,
              itemBuilder: (context, index) {
                final favorite = filteredFavorites[index];
                return _buildFavoriteCard(favorite, favoritesProvider);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildFavoriteCard(FavoriteWord favorite, FavoritesProvider favoritesProvider) {
    final theme = Theme.of(context);
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _showTranslationPanel(favorite),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          favorite.word ?? '',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          favorite.translation,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurface.withValues(alpha: 0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (favorite.pronunciation != null || favorite.audioUrl != null)
                        IconButton(
                          icon: const Icon(Icons.volume_up, size: 20),
                          onPressed: () => _playAudio(favorite),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(
                            minWidth: 32,
                            minHeight: 32,
                          ),
                        ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, size: 20),
                        onPressed: () => _confirmDelete(favorite, favoritesProvider),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(
                          minWidth: 32,
                          minHeight: 32,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              if (favorite.pronunciation != null) ...[
                const SizedBox(height: 8),
                Text(
                  '/${favorite.pronunciation}/',
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontStyle: FontStyle.italic,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              ],
              if (favorite.category != null) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    favorite.category!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onPrimaryContainer,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  List<FavoriteWord> _getFilteredFavorites(List<FavoriteWord> favorites) {
    return favorites.where((favorite) {
      // Search filter
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        if (!(favorite.word?.toLowerCase().contains(query) ?? false) &&
            !favorite.translation.toLowerCase().contains(query)) {
          if (favorite.category != null && favorite.category!.toLowerCase().contains(query)) return true;
          return false;
        }
      }

      // Category filter
      if (_selectedCategory != 'all') {
        if (favorite.category != _selectedCategory) {
          return false;
        }
      }

      // Language filter
      if (_selectedLanguage != 'all') {
        if (favorite.language != _selectedLanguage) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  void _showSearchDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Search Favorites'),
        content: TextField(
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Enter word or translation...',
            border: OutlineInputBorder(),
          ),
          onChanged: (value) {
            setState(() {
              _searchQuery = value;
            });
          },
        ),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                _searchQuery = '';
              });
              Navigator.of(context).pop();
            },
            child: const Text('Clear'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  void _showFilterDialog() {
    final favoritesProvider = Provider.of<FavoritesProvider>(context, listen: false);
    final categories = favoritesProvider.favorites
        .map((f) => f.category)
        .where((c) => c != null)
        .cast<String>()
        .toSet()
        .toList();
    final languages = favoritesProvider.favorites
        .map((f) => f.language)
        .toSet()
        .toList();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter Favorites'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Category:'),
            DropdownButton<String>(
              value: _selectedCategory,
              isExpanded: true,
              items: [
                const DropdownMenuItem(value: 'all', child: Text('All Categories')),
                ...categories.map((category) => DropdownMenuItem(
                  value: category,
                  child: Text(category),
                )),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedCategory = value ?? 'all';
                });
              },
            ),
            const SizedBox(height: 16),
            const Text('Language:'),
            DropdownButton<String>(
              value: _selectedLanguage,
              isExpanded: true,
              items: [
                const DropdownMenuItem(value: 'all', child: Text('All Languages')),
                ...languages.map((language) => DropdownMenuItem(
                  value: language,
                  child: Text(language?.toUpperCase() ?? ''),
                )),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedLanguage = value ?? 'all';
                });
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: _clearFilters,
            child: const Text('Clear All'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  void _clearFilters() {
    setState(() {
      _searchQuery = '';
      _selectedCategory = 'all';
      _selectedLanguage = 'all';
    });
    Navigator.of(context).pop();
  }

  Future<void> _playAudio(FavoriteWord favorite) async {
    try {
      if (favorite.audioUrl != null && favorite.audioUrl!.isNotEmpty) {
        await _audioService.playAudioFromUrl(favorite.audioUrl!);
      } else {
        final success = await _audioService.speakText(
          favorite.word ?? '',
          language: _audioService.getSupportedLanguage(favorite.language ?? 'en'),
        );
        
        if (!success && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Audio playback failed'),
              duration: Duration(seconds: 2),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Audio error: $e'),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  void _confirmDelete(FavoriteWord favorite, FavoritesProvider favoritesProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Favorite'),
        content: Text('Remove "${favorite.word}" from favorites?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.of(context).pop();
              
              final scaffoldMessenger = ScaffoldMessenger.of(context);
              final authProvider = Provider.of<AuthProvider>(context, listen: false);
              final success = await favoritesProvider.removeFromFavorites(
                favorite.id,
                token: authProvider.token,
              );
              
              if (!success && mounted) {
                scaffoldMessenger.showSnackBar(
                  const SnackBar(
                    content: Text('Failed to remove favorite'),
                    duration: Duration(seconds: 2),
                  ),
                );
              }
            },
            child: const Text('Remove'),
          ),
        ],
      ),
    );
  }

  void _showTranslationPanel(FavoriteWord favorite) {
    final translation = Translation(
      id: favorite.id,
      originalText: favorite.word ?? '',
      translatedText: favorite.translation,
      sourceLanguage: favorite.language ?? 'en',
      targetLanguage: 'es', // Default target language
      pronunciation: favorite.pronunciation,
      examples: favorite.examples,
      audioUrl: favorite.audioUrl,
      createdAt: favorite.createdAt,
      expiresAt: null,
    );

    showDialog(
      context: context,
      builder: (context) => TranslationPanelWidget(
        translation: translation,
        originalText: favorite.word ?? '',
        sourceLanguage: favorite.language ?? 'en',
        targetLanguage: 'es',
      ),
    );
  }
}