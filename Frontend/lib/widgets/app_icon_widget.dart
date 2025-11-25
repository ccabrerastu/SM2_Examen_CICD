import 'package:flutter/material.dart';

class AppIconWidget extends StatelessWidget {
  final double size;
  final Color backgroundColor;
  final Color bookColor;
  final Color accentColor;

  const AppIconWidget({
    super.key,
    this.size = 100,
    this.backgroundColor = const Color(0xFF2196F3),
    this.bookColor = Colors.white,
    this.accentColor = const Color(0xFFFFEB3B),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(size * 0.22), // iOS style corner radius
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: size * 0.1,
            offset: Offset(0, size * 0.05),
          ),
        ],
      ),
      child: CustomPaint(
        size: Size(size, size),
        painter: AppIconPainter(
          bookColor: bookColor,
          accentColor: accentColor,
        ),
      ),
    );
  }
}

class AppIconPainter extends CustomPainter {
  final Color bookColor;
  final Color accentColor;

  AppIconPainter({
    required this.bookColor,
    required this.accentColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint();
    final center = Offset(size.width / 2, size.height / 2);
    
    // Book dimensions
    final bookWidth = size.width * 0.45;
    final bookHeight = size.height * 0.55;
    final bookRect = Rect.fromCenter(
      center: center,
      width: bookWidth,
      height: bookHeight,
    );

    // Draw book shadow
    paint
      ..color = Colors.black.withValues(alpha: 0.1)
      ..style = PaintingStyle.fill;
    
    final shadowRect = bookRect.translate(2, 2);
    canvas.drawRRect(
      RRect.fromRectAndRadius(shadowRect, const Radius.circular(3)),
      paint,
    );

    // Draw main book body
    paint.color = bookColor;
    final bookPath = Path();
    bookPath.addRRect(RRect.fromRectAndRadius(
      bookRect,
      const Radius.circular(3),
    ));
    canvas.drawPath(bookPath, paint);

    // Draw book spine
    paint.color = accentColor;
    final spineWidth = size.width * 0.08;
    final spineRect = Rect.fromLTRB(
      bookRect.left - spineWidth/2,
      bookRect.top,
      bookRect.left + spineWidth/2,
      bookRect.bottom,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(spineRect, const Radius.circular(2)),
      paint,
    );

    // Draw book pages (lines)
    paint
      ..color = bookColor.withValues(alpha: 0.7)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    
    final pageSpacing = bookHeight / 8;
    for (int i = 1; i < 8; i++) {
      final lineY = bookRect.top + (pageSpacing * i);
      canvas.drawLine(
        Offset(bookRect.left + 6, lineY),
        Offset(bookRect.right - 4, lineY),
        paint,
      );
    }

    // Draw accent bookmark
    paint
      ..color = accentColor
      ..style = PaintingStyle.fill;
    
    final bookmarkWidth = size.width * 0.04;
    final bookmarkHeight = size.height * 0.25;
    final bookmarkRect = Rect.fromLTRB(
      bookRect.right - bookmarkWidth,
      bookRect.top - bookmarkHeight * 0.3,
      bookRect.right + bookmarkWidth * 0.5,
      bookRect.top + bookmarkHeight,
    );
    
    final bookmarkPath = Path();
    bookmarkPath.addRRect(RRect.fromRectAndRadius(
      bookmarkRect,
      const Radius.circular(1),
    ));
    
    // Add bookmark triangle at bottom
    final triangleTop = bookmarkRect.bottom;
    final triangleCenter = bookmarkRect.center.dx;
    final triangleWidth = bookmarkWidth;
    
    bookmarkPath.moveTo(triangleCenter - triangleWidth/2, triangleTop);
    bookmarkPath.lineTo(triangleCenter + triangleWidth/2, triangleTop);
    bookmarkPath.lineTo(triangleCenter, triangleTop + triangleWidth/2);
    bookmarkPath.close();
    
    canvas.drawPath(bookmarkPath, paint);

    // Draw book outline
    paint
      ..color = bookColor.withValues(alpha: 0.8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawPath(bookPath, paint);

    // Draw subtle highlight on book
    paint
      ..color = Colors.white.withValues(alpha: 0.2)
      ..style = PaintingStyle.fill;
    
    final highlightRect = Rect.fromLTRB(
      bookRect.left + 2,
      bookRect.top + 2,
      bookRect.right - 2,
      bookRect.top + bookHeight * 0.3,
    );
    
    final highlightPath = Path();
    highlightPath.addRRect(RRect.fromRectAndRadius(
      highlightRect,
      const Radius.circular(2),
    ));
    
    canvas.clipPath(bookPath);
    canvas.drawPath(highlightPath, paint);
  }

  @override
  bool shouldRepaint(covariant AppIconPainter oldDelegate) {
    return bookColor != oldDelegate.bookColor ||
           accentColor != oldDelegate.accentColor;
  }
}