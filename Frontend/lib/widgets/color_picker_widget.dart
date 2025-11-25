import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';

class ColorPickerWidget extends StatefulWidget {
  final Color initialColor;
  final ValueChanged<Color> onColorChanged;

  const ColorPickerWidget({
    super.key,
    required this.initialColor,
    required this.onColorChanged,
  });

  @override
  State<ColorPickerWidget> createState() => _ColorPickerWidgetState();
}

class _ColorPickerWidgetState extends State<ColorPickerWidget> {
  late Color _currentColor;
  double _hue = 0.0;
  double _saturation = 1.0;
  double _lightness = 0.5;

  @override
  void initState() {
    super.initState();
    _currentColor = widget.initialColor;
    final hsl = HSLColor.fromColor(_currentColor);
    _hue = hsl.hue;
    _saturation = hsl.saturation;
    _lightness = hsl.lightness;
  }

  void _updateColor() {
    final hslColor = HSLColor.fromAHSL(1.0, _hue, _saturation, _lightness);
    setState(() {
      _currentColor = hslColor.toColor();
    });
    widget.onColorChanged(_currentColor);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            AppLocalizations.of(context)!.selectCustomColor,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          
          // Color preview
          Container(
            width: double.infinity,
            height: 80,
            decoration: BoxDecoration(
              color: _currentColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.2),
                width: 1,
              ),
            ),
          ),
          const SizedBox(height: 24),
          
          // Hue slider
          _buildSlider(
            label: AppLocalizations.of(context)!.hue,
            value: _hue,
            max: 360.0,
            onChanged: (value) {
              setState(() => _hue = value);
              _updateColor();
            },
            color: HSLColor.fromAHSL(1.0, _hue, 1.0, 0.5).toColor(),
          ),
          
          const SizedBox(height: 16),
          
          // Saturation slider
          _buildSlider(
            label: AppLocalizations.of(context)!.saturation,
            value: _saturation,
            max: 1.0,
            onChanged: (value) {
              setState(() => _saturation = value);
              _updateColor();
            },
            color: _currentColor,
          ),
          
          const SizedBox(height: 16),
          
          // Lightness slider
          _buildSlider(
            label: AppLocalizations.of(context)!.lightness,
            value: _lightness,
            max: 1.0,
            onChanged: (value) {
              setState(() => _lightness = value);
              _updateColor();
            },
            color: _currentColor,
          ),
          
          const SizedBox(height: 32),
          
          // Predefined colors
          Text(
            AppLocalizations.of(context)!.quickColors,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: _buildPredefinedColors(),
          ),
          
          const SizedBox(height: 24),
          
          // Action buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: Text(AppLocalizations.of(context)!.cancel),
              ),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(_currentColor),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _currentColor,
                  foregroundColor: _currentColor.computeLuminance() > 0.5 
                      ? Colors.black : Colors.white,
                ),
                child: Text(AppLocalizations.of(context)!.selectColor),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSlider({
    required String label,
    required double value,
    required double max,
    required ValueChanged<double> onChanged,
    required Color color,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$label: ${(value * (max == 1.0 ? 100 : 1)).round()}${max == 1.0 ? '%' : '°'}',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: color,
            thumbColor: color,
            inactiveTrackColor: color.withValues(alpha: 0.3),
          ),
          child: Slider(
            value: value,
            max: max,
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }

  List<Widget> _buildPredefinedColors() {
    final predefinedColors = [
      const Color(0xFFA702DC), // Purple (primary)
      const Color(0xFF2196F3), // Blue
      const Color(0xFF4CAF50), // Green
      const Color(0xFFFF9800), // Orange
      const Color(0xFFF44336), // Red
      const Color(0xFF9C27B0), // Purple
      const Color(0xFF00BCD4), // Cyan
      const Color(0xFF795548), // Brown
      const Color(0xFF607D8B), // Blue Grey
      const Color(0xFFE91E63), // Pink
      const Color(0xFF8BC34A), // Light Green
      const Color(0xFFFF5722), // Deep Orange
    ];

    return predefinedColors.map((color) {
      final isSelected = (color.r * 255).round() == (_currentColor.r * 255).round() && 
                         (color.g * 255).round() == (_currentColor.g * 255).round() && 
                         (color.b * 255).round() == (_currentColor.b * 255).round();
      
      return GestureDetector(
        onTap: () {
          final hsl = HSLColor.fromColor(color);
          setState(() {
            _currentColor = color;
            _hue = hsl.hue;
            _saturation = hsl.saturation;
            _lightness = hsl.lightness;
          });
          widget.onColorChanged(color);
        },
        child: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: isSelected ? Colors.white : Colors.transparent,
              width: 3,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
              if (isSelected)
                BoxShadow(
                  color: color.withValues(alpha: 0.3),
                  blurRadius: 8,
                  spreadRadius: 2,
                ),
            ],
          ),
        ),
      );
    }).toList();
  }
}