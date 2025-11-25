import 'package:flutter/material.dart';

class LoadingBookIcon extends StatefulWidget {
  final double size;
  final Color baseColor;
  final Color fillColor;
  final Duration duration;

  const LoadingBookIcon({
    super.key,
    this.size = 80,
    this.baseColor = Colors.grey,
    required this.fillColor,
    this.duration = const Duration(seconds: 2),
  });

  @override
  State<LoadingBookIcon> createState() => _LoadingBookIconState();
}

class _LoadingBookIconState extends State<LoadingBookIcon>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fillAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );
    
    _fillAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));

    _controller.repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _fillAnimation,
        builder: (context, child) {
          return CustomPaint(
            size: Size(widget.size, widget.size),
            painter: BookPainter(
              fillProgress: _fillAnimation.value,
              baseColor: widget.baseColor,
              fillColor: widget.fillColor,
            ),
          );
        },
      ),
    );
  }
}

class BookPainter extends CustomPainter {
  final double fillProgress;
  final Color baseColor;
  final Color fillColor;

  BookPainter({
    required this.fillProgress,
    required this.baseColor,
    required this.fillColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint();
    final center = Offset(size.width / 2, size.height / 2);
    final bookWidth = size.width * 0.6;
    final bookHeight = size.height * 0.7;
    final bookRect = Rect.fromCenter(
      center: center,
      width: bookWidth,
      height: bookHeight,
    );

    // Draw book outline
    paint
      ..color = baseColor.withValues(alpha: 0.3)
      ..style = PaintingStyle.fill;
    
    final bookPath = Path();
    bookPath.addRRect(RRect.fromRectAndRadius(
      bookRect,
      const Radius.circular(4),
    ));
    canvas.drawPath(bookPath, paint);

    // Draw book spine
    paint.color = baseColor.withValues(alpha: 0.5);
    final spineRect = Rect.fromLTRB(
      bookRect.left - 3,
      bookRect.top,
      bookRect.left + 3,
      bookRect.bottom,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(spineRect, const Radius.circular(2)),
      paint,
    );

    // Draw fill animation (from bottom to top)
    if (fillProgress > 0) {
      final fillHeight = bookHeight * fillProgress;
      final fillRect = Rect.fromLTRB(
        bookRect.left,
        bookRect.bottom - fillHeight,
        bookRect.right,
        bookRect.bottom,
      );

      paint
        ..color = fillColor
        ..style = PaintingStyle.fill;
      
      final fillPath = Path();
      fillPath.addRRect(RRect.fromRectAndRadius(
        fillRect,
        const Radius.circular(4),
      ));
      
      // Clip to book bounds
      canvas.clipPath(bookPath);
      canvas.drawPath(fillPath, paint);
    }

    // Draw book pages lines
    paint
      ..color = baseColor.withValues(alpha: 0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    
    final pageSpacing = bookHeight / 6;
    for (int i = 1; i < 6; i++) {
      final lineY = bookRect.top + (pageSpacing * i);
      canvas.drawLine(
        Offset(bookRect.left + 8, lineY),
        Offset(bookRect.right - 8, lineY),
        paint,
      );
    }

    // Draw book outline border
    paint
      ..color = baseColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    canvas.drawPath(bookPath, paint);
  }

  @override
  bool shouldRepaint(covariant BookPainter oldDelegate) {
    return fillProgress != oldDelegate.fillProgress ||
           baseColor != oldDelegate.baseColor ||
           fillColor != oldDelegate.fillColor;
  }
}