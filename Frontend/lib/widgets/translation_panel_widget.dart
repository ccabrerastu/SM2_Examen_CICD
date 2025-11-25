import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../models/translation.dart';
import '../models/favorite_word.dart';
import '../providers/favorites_provider.dart';
import '../providers/auth_provider.dart';
import '../utils/translation_service.dart';
import '../utils/audio_service.dart';

class TranslationPanelWidget extends StatefulWidget {
  final Translation translation;
  final String originalText;
  final String sourceLanguage;
  final String targetLanguage;
  final String? context;
  final bool showRelatedTranslations;
  final bool enableEditing;

  const TranslationPanelWidget({
    super.key,
    required this.translation,
    required this.originalText,
    required this.sourceLanguage,
    required this.targetLanguage,
    this.context,
    this.showRelatedTranslations = true,
    this.enableEditing = false,
  });

  @override
  State<TranslationPanelWidget> createState() => _TranslationPanelWidgetState();
}

class _TranslationPanelWidgetState extends State<TranslationPanelWidget>
    with TickerProviderStateMixin {
  final TranslationService _translationService = TranslationService();
  late TabController _tabController;

  List<Translation> _relatedTranslations = [];
  bool _isLoadingRelated = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _checkFavoriteStatus();
    if (widget.showRelatedTranslations) {
      _loadRelatedTranslations();
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _checkFavoriteStatus() {
    Provider.of<FavoritesProvider>(context, listen: false);
    setState(() {
    });
  }

  Future<void> _loadRelatedTranslations() async {
    setState(() {
      _isLoadingRelated = true;
      _error = null;
    });

    try {
      final history = await _translationService.getTranslationHistory(
        sourceLanguage: widget.sourceLanguage,
        targetLanguage: widget.targetLanguage,
        limit: 10,
      );

      setState(() {
        _relatedTranslations = history
            .where((t) => t.originalText != widget.originalText)
            .take(5)
            .toList();
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load related translations: $e';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingRelated = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        width: MediaQuery.of(context).size.width * 0.9,
        height: MediaQuery.of(context).size.height * 0.8,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildHeader(),
            const SizedBox(height: 16),
            _buildTabBar(),
            const SizedBox(height: 16),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildTranslationTab(),
                  _buildDetailsTab(),
                  _buildHistoryTab(),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _buildActionButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Translation Details',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                '${widget.sourceLanguage.toUpperCase()} → ${widget.targetLanguage.toUpperCase()}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context)
                          .colorScheme
                          .onSurface
                          .withValues(alpha: 0.7),
                    ),
              ),
            ],
          ),
        ),
        Consumer<FavoritesProvider>(
          builder: (context, favoritesProvider, child) {
            final isFavorite =
                favoritesProvider.isFavorite(widget.originalText);
            return IconButton(
              icon: Icon(
                isFavorite ? Icons.favorite : Icons.favorite_border,
                color: isFavorite ? Colors.red : null,
              ),
              onPressed: () => _toggleFavorite(favoritesProvider),
            );
          },
        ),
        IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ],
    );
  }

  Widget _buildTabBar() {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context)
            .colorScheme
            .surfaceContainerHighest
            .withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(8),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          color: Theme.of(context).colorScheme.primary,
          borderRadius: BorderRadius.circular(6),
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        labelColor: Theme.of(context).colorScheme.onPrimary,
        unselectedLabelColor: Theme.of(context).colorScheme.onSurface,
        tabs: const [
          Tab(
            icon: Icon(Icons.translate, size: 20),
            text: 'Translation',
          ),
          Tab(
            icon: Icon(Icons.info_outline, size: 20),
            text: 'Details',
          ),
          Tab(
            icon: Icon(Icons.history, size: 20),
            text: 'History',
          ),
        ],
      ),
    );
  }

  Widget _buildTranslationTab() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTranslationCard(
            title: 'Original Text',
            content: widget.originalText,
            language: widget.sourceLanguage,
            isOriginal: true,
          ),
          const SizedBox(height: 16),
          _buildTranslationCard(
            title: 'Translation',
            content: widget.translation.translatedText,
            language: widget.targetLanguage,
            pronunciation: widget.translation.pronunciation,
          ),
          if (widget.translation.examples.isNotEmpty) ...[
            const SizedBox(height: 16),
            _buildExamplesSection(),
          ],
        ],
      ),
    );
  }

  Widget _buildTranslationCard({
    required String title,
    required String content,
    required String language,
    String? pronunciation,
    bool isOriginal = false,
  }) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const Spacer(),
                Chip(
                  label: Text(
                    language.toUpperCase(),
                    style: const TextStyle(fontSize: 12),
                  ),
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ],
            ),
            const SizedBox(height: 12),
            SelectableText(
              content,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            if (pronunciation != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.record_voice_over,
                    size: 16,
                    color: Theme.of(context)
                        .colorScheme
                        .onSurface
                        .withValues(alpha: 0.7),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '/$pronunciation/',
                    style:
                        Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontStyle: FontStyle.italic,
                              color: Theme.of(context)
                                  .colorScheme
                                  .onSurface
                                  .withValues(alpha: 0.7),
                            ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.volume_up, size: 20),
                    onPressed: () => _playPronunciation(content, language),
                    tooltip: 'Play pronunciation',
                  ),
                ],
              ),
            ],
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  icon: const Icon(Icons.copy, size: 16),
                  label: const Text('Copy'),
                  onPressed: () => _copyToClipboard(content),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExamplesSection() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Examples',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 12),
            ...widget.translation.examples.map(
              (example) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 4,
                      height: 4,
                      margin:
                          const EdgeInsets.only(top: 8, right: 8),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                    Expanded(
                      child: SelectableText(
                        example,
                        style:
                            Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailsTab() {
    return SingleChildScrollView(
      child: Column(
        children: [
          _buildDetailCard(
            'Translation Information',
            [
              _buildDetailRow('Source Language',
                  widget.sourceLanguage.toUpperCase()),
              _buildDetailRow('Target Language',
                  widget.targetLanguage.toUpperCase()),
              if (widget.context != null)
                _buildDetailRow('Context', widget.context!),
              _buildDetailRow(
                  'Created',
                  _formatDateTime(
                      widget.translation.createdAt)),
              if (widget.translation.expiresAt != null)
                _buildDetailRow(
                    'Expires',
                    _formatDateTime(
                        widget.translation.expiresAt!)),
            ],
          ),
          const SizedBox(height: 16),
          if (widget.translation.audioUrl != null)
            _buildDetailCard(
              'Audio',
              [
                _buildDetailRow(
                    'Audio URL', widget.translation.audioUrl!),
                const SizedBox(height: 8),
                ElevatedButton.icon(
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Play Audio'),
                  onPressed: () =>
                      _playAudio(widget.translation.audioUrl),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildHistoryTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recent Translations',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 16),
        if (_isLoadingRelated)
          const Center(child: CircularProgressIndicator())
        else if (_error != null)
          Center(
            child: Column(
              children: [
                Icon(
                  Icons.error_outline,
                  size: 48,
                  color: Theme.of(context).colorScheme.error,
                ),
                const SizedBox(height: 8),
                Text(
                  _error!,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.error,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          )
        else if (_relatedTranslations.isEmpty)
          const Center(
            child: Column(
              children: [
                Icon(Icons.history, size: 48, color: Colors.grey),
                SizedBox(height: 8),
                Text(
                  'No recent translations found',
                  style: TextStyle(color: Colors.grey),
                ),
              ],
            ),
          )
        else
          Expanded(
            child: ListView.builder(
              itemCount: _relatedTranslations.length,
              itemBuilder: (context, index) {
                final translation = _relatedTranslations[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    title: Text(
                      translation.originalText,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    subtitle: Text(
                      translation.translatedText,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: Text(
                      _formatDateTime(translation.createdAt),
                      style:
                          Theme.of(context).textTheme.bodySmall,
                    ),
                    onTap: () {
                      Navigator.of(context).pop();
                      showDialog(
                        context: context,
                        builder: (context) =>
                            TranslationPanelWidget(
                          translation: translation,
                          originalText: translation.originalText,
                          sourceLanguage: widget.sourceLanguage,
                          targetLanguage: widget.targetLanguage,
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
      ],
    );
  }

  Widget _buildDetailCard(String title, List<Widget> children) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
            ),
          ),
          Expanded(
            child: SelectableText(
              value,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        OutlinedButton.icon(
          icon: const Icon(Icons.share),
          label: const Text('Share'),
          onPressed: _shareTranslation,
        ),
        OutlinedButton.icon(
          icon: const Icon(Icons.copy),
          label: const Text('Copy All'),
          onPressed: _copyAllToClipboard,
        ),
        ElevatedButton.icon(
          icon: const Icon(Icons.close),
          label: const Text('Close'),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ],
    );
  }

  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  void _copyToClipboard(String text) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Copied to clipboard'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _copyAllToClipboard() {
    final text =
        '${widget.originalText}\n${widget.translation.translatedText}';
    _copyToClipboard(text);
  }

  void _shareTranslation() {
    // TODO: Implement sharing functionality
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Share functionality will be implemented soon'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _playPronunciation(String text, String language) async {
    final audioService = AudioService();
    final ok = await audioService.speakText(
      text,
      language: audioService.getSupportedLanguage(language),
    );
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Audio playback failed'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  void _playAudio(String? audioUrl) async {
    final audioService = AudioService();

    try {
      if (audioUrl != null && audioUrl.isNotEmpty) {
        await audioService.playAudioFromUrl(audioUrl);
      } else {
        final textToSpeak = widget.translation.pronunciation != null
            ? widget.originalText
            : widget.translation.translatedText;

        final language = widget.translation.pronunciation != null
            ? widget.sourceLanguage
            : widget.targetLanguage;

        final success = await audioService.speakText(
          textToSpeak,
          language: audioService.getSupportedLanguage(language),
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

  Future<void> _toggleFavorite(
      FavoritesProvider favoritesProvider) async {
    final authProvider =
        Provider.of<AuthProvider>(context, listen: false);
    final token = authProvider.token;

    final isFavorite =
        favoritesProvider.isFavorite(widget.originalText);

    if (isFavorite) {
      final favoriteWord =
          favoritesProvider.getFavoriteByWord(widget.originalText);
      if (favoriteWord != null) {
        await favoritesProvider.removeFromFavorites(
          favoriteWord.id,
          token: token,
        );
      }
    } else {
      final favoriteWord = FavoriteWord(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        word: widget.originalText,
        translation: widget.translation.translatedText,
        language: widget.sourceLanguage,
        pronunciation: widget.translation.pronunciation,
        definition: null,
        examples: widget.translation.examples,
        audioUrl: widget.translation.audioUrl,
        category: widget.context,
        difficultyLevel: null,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        isSynced: false,
        serverId: null,
      );

      await favoritesProvider.addToFavorites(
        favoriteWord,
        token: token,
      );
    }
  }
}

