import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../models/translation.dart';
import '../models/favorite_word.dart';

import '../providers/auth_provider.dart';
import '../providers/favorites_provider.dart';

import '../utils/translation_service.dart';
import '../utils/audio_service.dart';

import 'translation_panel_widget.dart';

class TranslationTooltipWidget extends StatefulWidget {
  final String text;
  final Widget child;
  final String sourceLanguage;
  final String targetLanguage;
  final String? context;
  final bool showOnTap;
  final bool showOnLongPress;
  final bool showOnHover;
  final VoidCallback? onTranslationLoaded;

  final EdgeInsetsGeometry? tooltipPadding;
  final Color? tooltipBackgroundColor;
  final TextStyle? tooltipTextStyle;
  final double? tooltipBorderRadius;

  final bool enableFavorites;
  final bool enablePronunciation;
  final bool enableExpandedView;
  final bool enableCopy;
  final bool enableSmartPositioning;

  final Duration animationDuration;
  final Duration autoHideDelay;

  const TranslationTooltipWidget({
    super.key,
    required this.text,
    required this.child,
    this.sourceLanguage = 'en',
    this.targetLanguage = 'es',
    this.context,
    this.showOnTap = true,
    this.showOnLongPress = true,
    this.showOnHover = false,
    this.onTranslationLoaded,
    this.tooltipPadding,
    this.tooltipBackgroundColor,
    this.tooltipTextStyle,
    this.tooltipBorderRadius,
    this.enableFavorites = true,
    this.enablePronunciation = true,
    this.enableExpandedView = true,
    this.enableCopy = true,
    this.enableSmartPositioning = true,
    this.animationDuration = const Duration(milliseconds: 300),
    this.autoHideDelay = const Duration(seconds: 5),
  });

  @override
  State<TranslationTooltipWidget> createState() =>
      _TranslationTooltipWidgetState();
}

class _TranslationTooltipWidgetState extends State<TranslationTooltipWidget>
    with TickerProviderStateMixin {
  final TranslationService _translationService = TranslationService();

  Translation? _translation;
  bool _isLoading = false;
  String? _error;

  OverlayEntry? _overlayEntry;
  AnimationController? _animationController;
  Animation<double>? _fadeAnimation;
  Animation<double>? _scaleAnimation;
  Animation<Offset>? _slideAnimation;

  bool _isTooltipVisible = false;
  bool _isHovering = false;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: widget.animationDuration,
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController!,
        curve: Curves.easeOutCubic,
      ),
    );

    _scaleAnimation = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController!,
        curve: Curves.easeOutBack,
      ),
    );

    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, -0.15), end: Offset.zero).animate(
      CurvedAnimation(
        parent: _animationController!,
        curve: Curves.easeOutCubic,
      ),
    );
  }

  @override
  void dispose() {
    _hideTooltip();
    _animationController?.dispose();
    super.dispose();
  }

  Future<void> _loadTranslation() async {
    if (_isLoading || widget.text.trim().isEmpty) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;

      final result = await _translationService.translate(
        text: widget.text.trim(),
        sourceLanguage: widget.sourceLanguage,
        targetLanguage: widget.targetLanguage,
        context: widget.context,
        token: token,
      );

      if (result.success && result.translation != null) {
        setState(() {
          _translation = result.translation;
          _error = null;
        });
        widget.onTranslationLoaded?.call();
        HapticFeedback.lightImpact();
      } else {
        setState(() {
          _error = result.error ?? 'Translation failed';
        });
        HapticFeedback.selectionClick();
      }
    } catch (e) {
      setState(() {
        _error = 'Translation error: $e';
      });
      HapticFeedback.selectionClick();
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showTooltip() {
    if (_isTooltipVisible) return;

    _loadTranslation();

    final renderBox = context.findRenderObject() as RenderBox?;
    if (renderBox == null) return;

    final size = renderBox.size;
    final offset = renderBox.localToGlobal(Offset.zero);
    final screen = MediaQuery.of(context).size;

    // Posicionamiento inteligente
    double left = offset.dx;
    double top = offset.dy + size.height + 8;
    bool showAbove = false;

    const estHeight = 220.0;
    const estWidth = 320.0;

    if (widget.enableSmartPositioning) {
      if (left + estWidth > screen.width - 16) {
        left = screen.width - estWidth - 16;
      }
      if (left < 16) left = 16;

      if (top + estHeight > screen.height - 100) {
        showAbove = true;
        top = offset.dy - estHeight - 8;
      }
    }

    _overlayEntry = OverlayEntry(
      builder: (_) => Positioned(
        left: left,
        top: top,
        child: Material(
          color: Colors.transparent,
          child: AnimatedBuilder(
            animation: _animationController!,
            builder: (context, child) => Transform.scale(
              scale: _scaleAnimation!.value,
              child: SlideTransition(
                position: _slideAnimation!,
                child: FadeTransition(
                  opacity: _fadeAnimation!,
                  child: _buildTooltipContent(showAbove),
                ),
              ),
            ),
          ),
        ),
      ),
    );

    Overlay.of(context).insert(_overlayEntry!);
    _animationController!.forward();
    _isTooltipVisible = true;

    // Auto-hide
    Future.delayed(widget.autoHideDelay, () {
      if (_isTooltipVisible && !_isHovering) _hideTooltip();
    });
  }

  void _hideTooltip() {
    if (!_isTooltipVisible) return;
    _animationController!.reverse().then((_) {
      _overlayEntry?.remove();
      _overlayEntry = null;
      _isTooltipVisible = false;
    });
  }

  Widget _buildTooltipContent(bool showAbove) {
    return MouseRegion(
      onEnter: (_) => _isHovering = true,
      onExit: (_) => _isHovering = false,
      child: Container(
        constraints: const BoxConstraints(
          maxWidth: 320,
          minWidth: 220,
          maxHeight: 420,
        ),
        padding: widget.tooltipPadding ?? const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: widget.tooltipBackgroundColor ??
              Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(widget.tooltipBorderRadius ?? 12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
          border: Border.all(
            color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.12),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildHeaderBar(),
            const SizedBox(height: 12),
            _buildContent(),
            if (_shouldShowActions()) _buildActions(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderBar() {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primaryContainer,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            '${widget.sourceLanguage.toUpperCase()} → ${widget.targetLanguage.toUpperCase()}',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ),
        const Spacer(),
        IconButton(
          icon: Icon(
            Icons.close,
            size: 18,
            color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
          ),
          onPressed: _hideTooltip,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
          style: IconButton.styleFrom(
            backgroundColor:
                Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
          ),
        ),
      ],
    );
  }

  Widget _buildContent() {
    if (_isLoading) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(
                  Theme.of(context).colorScheme.primary,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Translating...',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context)
                        .colorScheme
                        .onSurface
                        .withValues(alpha: 0.7),
                  ),
            ),
          ],
        ),
      );
    }

    if (_error != null) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Theme.of(context)
              .colorScheme
              .errorContainer
              .withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: Theme.of(context).colorScheme.error.withValues(alpha: 0.2),
          ),
        ),
        child: Row(
          children: [
            Icon(Icons.error_outline,
                size: 20, color: Theme.of(context).colorScheme.error),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _error!,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.error,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
      );
    }

    if (_translation == null) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Center(
          child: Text(
            'Tap to translate',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontStyle: FontStyle.italic,
                  color: Theme.of(context)
                      .colorScheme
                      .onSurface
                      .withValues(alpha: 0.6),
                ),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Texto original
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color:
                Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            widget.text,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(height: 12),
        // Traducción + botón de pronunciación
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                _translation!.translatedText,
                style: widget.tooltipTextStyle ??
                    Theme.of(context).textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: Theme.of(context).colorScheme.primary,
                        ),
              ),
            ),
            if (widget.enablePronunciation &&
                _translation!.pronunciation != null)
              _buildPronunciationButton(),
          ],
        ),
        if (_translation!.pronunciation != null) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Theme.of(context)
                  .colorScheme
                  .secondaryContainer
                  .withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              '/${_translation!.pronunciation}/',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontStyle: FontStyle.italic,
                    color: Theme.of(context)
                        .colorScheme
                        .onSecondaryContainer,
                  ),
            ),
          ),
        ],
        if (_translation!.examples.isNotEmpty) ...[
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Theme.of(context)
                  .colorScheme
                  .tertiaryContainer
                  .withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color:
                    Theme.of(context).colorScheme.tertiary.withValues(alpha: 0.2),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.lightbulb_outline,
                        size: 16,
                        color: Theme.of(context).colorScheme.tertiary),
                    const SizedBox(width: 6),
                    Text(
                      'Example:',
                      style: Theme.of(context)
                          .textTheme
                          .labelMedium
                          ?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: Theme.of(context)
                                .colorScheme
                                .tertiary,
                          ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  _translation!.examples.first,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontStyle: FontStyle.italic,
                      ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildPronunciationButton() {
    return Container(
      margin: const EdgeInsets.only(left: 8),
      child: IconButton(
        icon: const Icon(Icons.volume_up, size: 20),
        onPressed: _playPronunciation,
        style: IconButton.styleFrom(
          backgroundColor: Theme.of(context)
              .colorScheme
              .primaryContainer
              .withValues(alpha: 0.5),
          foregroundColor:
              Theme.of(context).colorScheme.onPrimaryContainer,
          padding: const EdgeInsets.all(8),
          minimumSize: const Size(36, 36),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        tooltip: 'Play pronunciation',
      ),
    );
  }

  bool _shouldShowActions() {
    return (widget.enableFavorites ||
            widget.enableExpandedView ||
            widget.enableCopy) &&
        _translation != null;
  }

  Widget _buildActions() {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.only(top: 12),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color:
                Theme.of(context).colorScheme.outline.withValues(alpha: 0.2),
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          if (widget.enableCopy)
            _buildActionButton(
              icon: Icons.copy,
              label: 'Copy',
              onPressed: _copyTranslation,
            ),
          if (widget.enableFavorites)
            Consumer<FavoritesProvider>(
              builder: (context, favoritesProvider, child) {
                final isFavorite =
                    favoritesProvider.isFavorite(widget.text);
                return _buildActionButton(
                  icon: isFavorite
                      ? Icons.favorite
                      : Icons.favorite_border,
                  label: isFavorite ? 'Saved' : 'Save',
                  onPressed: () => _toggleFavorite(favoritesProvider),
                  color: isFavorite ? Colors.red : null,
                );
              },
            ),
          if (widget.enableExpandedView)
            _buildActionButton(
              icon: Icons.open_in_full,
              label: 'Expand',
              onPressed: _showExpandedView,
            ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
    Color? color,
  }) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 18,
              color: color ??
                  Theme.of(context)
                      .colorScheme
                      .onSurface
                      .withValues(alpha: 0.7),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: color ??
                        Theme.of(context)
                            .colorScheme
                            .onSurface
                            .withValues(alpha: 0.7),
                  ),
            ),
          ],
        ),
      ),
    );
  }

  void _copyTranslation() {
    if (_translation == null) return;
    Clipboard.setData(
      ClipboardData(text: _translation!.translatedText),
    );
    HapticFeedback.selectionClick();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle, color: Colors.white, size: 20),
            SizedBox(width: 8),
            Text('Translation copied to clipboard'),
          ],
        ),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Future<void> _playPronunciation() async {
    if (_translation == null) return;
    final audioService = AudioService();

    try {
      HapticFeedback.selectionClick();

      // Preferir URL si llega del backend; si no, TTS
      if (_translation!.audioUrl != null &&
          _translation!.audioUrl!.isNotEmpty) {
        await audioService.playAudioFromUrl(_translation!.audioUrl!);
      } else {
        // TTS sobre el texto traducido (o original si no hay pronunciación)
        final speakText = _translation!.pronunciation != null
            ? widget.text
            : _translation!.translatedText;
        final lang = _translation!.pronunciation != null
            ? widget.sourceLanguage
            : widget.targetLanguage;

        final ok = await audioService.speakText(
          speakText,
          language: audioService.getSupportedLanguage(lang),
        );

        if (!ok && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Audio not available'),
              duration: Duration(seconds: 2),
            ),
          );
        }
      }
    } catch (e) {
      // Intentar fallback a TTS del texto original
      try {
        await audioService.speakText(
          widget.text,
          language: audioService.getSupportedLanguage(widget.sourceLanguage),
        );
      } catch (_) {
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
  }

  Future<void> _toggleFavorite(
    FavoritesProvider favoritesProvider,
  ) async {
    if (_translation == null) return;

    try {
      HapticFeedback.mediumImpact();

      final isFavorite = favoritesProvider.isFavorite(widget.text);
      if (isFavorite) {
        final fav = favoritesProvider.getFavoriteByWord(widget.text);
        if (fav != null) {
          await favoritesProvider.removeFromFavorites(fav.id);
          if (mounted) {
            _toast('Removed from favorites', icon: Icons.heart_broken);
          }
        }
      } else {
        final now = DateTime.now();
        final fav = FavoriteWord(
          id: now.millisecondsSinceEpoch.toString(),
          word: widget.text,
          translation: _translation!.translatedText,
          language: widget.sourceLanguage, // de qué idioma viene la palabra
          pronunciation: _translation!.pronunciation,
          definition: _translation!.definition,
          examples: _translation!.examples,
          audioUrl: _translation!.audioUrl,
          category: widget.context,
          difficultyLevel: null,
          createdAt: now,
          updatedAt: now,
          isSynced: false,
          serverId: null,
        );

        await favoritesProvider.addToFavorites(fav);
        if (mounted) {
          _toast('Added to favorites', icon: Icons.favorite, iconColor: Colors.red);
        }
      }
    } catch (e) {
      if (mounted) {
        _toast(
          'Failed to update favorites',
          icon: Icons.error_outline,
          bg: Theme.of(context).colorScheme.error,
        );
      }
    }
  }

  void _toast(
    String msg, {
    IconData icon = Icons.check_circle,
    Color? iconColor,
    Color? bg,
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: bg,
        content: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: iconColor ?? Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(msg),
          ],
        ),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  void _showExpandedView() {
    if (_translation == null) return;

    HapticFeedback.lightImpact();
    _hideTooltip();

    // Mostrar panel completo en modal bottom sheet
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.75,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => Container(
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 10,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: Column(
            children: [
              // Handle
              Container(
                margin: const EdgeInsets.only(top: 12, bottom: 8),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Theme.of(context)
                      .colorScheme
                      .onSurface
                      .withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              // Header
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Row(
                  children: [
                    Text(
                      'Translation Details',
                      style: Theme.of(context)
                          .textTheme
                          .headlineSmall
                          ?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.of(context).pop(),
                      style: IconButton.styleFrom(
                        backgroundColor:
                            Theme.of(context).colorScheme.surfaceContainerHighest,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Content
              Expanded(
                child: TranslationPanelWidget(
                  translation: _translation!,
                  originalText: widget.text,
                  sourceLanguage: widget.sourceLanguage,
                  targetLanguage: widget.targetLanguage,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.showOnTap ? _showTooltip : null,
      onLongPress: widget.showOnLongPress ? _showTooltip : null,
      child: MouseRegion(
        onEnter: widget.showOnHover ? (_) => _showTooltip() : null,
        onExit: widget.showOnHover ? (_) => _hideTooltip() : null,
        child: widget.child,
      ),
    );
  }
}

/// Texto con tooltip de traducción integrado (wrapper conveniente)
class TranslatableText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final String sourceLanguage;
  final String targetLanguage;
  final String? context;

  final bool showOnTap;
  final bool showOnLongPress;
  final bool showOnHover;

  final bool enableFavorites;
  final bool enablePronunciation;
  final bool enableExpandedView;
  final bool enableCopy;
  final bool enableSmartPositioning;

  final Duration animationDuration;
  final Duration autoHideDelay;

  final VoidCallback? onTranslationLoaded;

  final EdgeInsetsGeometry? tooltipPadding;
  final Color? tooltipBackgroundColor;
  final TextStyle? tooltipTextStyle;
  final double? tooltipBorderRadius;

  final int? maxLines;
  final TextOverflow? overflow;
  final TextAlign? textAlign;

  const TranslatableText(
    this.text, {
    super.key,
    this.style,
    this.sourceLanguage = 'en',
    this.targetLanguage = 'es',
    this.context,
    this.showOnTap = true,
    this.showOnLongPress = true,
    this.showOnHover = false,
    this.enableFavorites = true,
    this.enablePronunciation = true,
    this.enableExpandedView = true,
    this.enableCopy = true,
    this.enableSmartPositioning = true,
    this.animationDuration = const Duration(milliseconds: 300),
    this.autoHideDelay = const Duration(seconds: 5),
    this.onTranslationLoaded,
    this.tooltipPadding,
    this.tooltipBackgroundColor,
    this.tooltipTextStyle,
    this.tooltipBorderRadius,
    this.maxLines,
    this.overflow,
    this.textAlign,
  });

  @override
  Widget build(BuildContext buildContext) {
    return TranslationTooltipWidget(
      text: text,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      context: context,
      showOnTap: showOnTap,
      showOnLongPress: showOnLongPress,
      showOnHover: showOnHover,
      enableFavorites: enableFavorites,
      enablePronunciation: enablePronunciation,
      enableExpandedView: enableExpandedView,
      enableCopy: enableCopy,
      enableSmartPositioning: enableSmartPositioning,
      animationDuration: animationDuration,
      autoHideDelay: autoHideDelay,
      onTranslationLoaded: onTranslationLoaded,
      tooltipPadding: tooltipPadding,
      tooltipBackgroundColor: tooltipBackgroundColor,
      tooltipTextStyle: tooltipTextStyle,
      tooltipBorderRadius: tooltipBorderRadius,
      child: Text(
        text,
        style: style,
        maxLines: maxLines,
        overflow: overflow,
        textAlign: textAlign,
      ),
    );
  }
}

