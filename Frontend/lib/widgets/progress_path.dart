import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../models/episode.dart';

class ProgressPath extends StatefulWidget {
  final List<Episode> episodes;
  final Size screenSize;

  const ProgressPath({
    super.key,
    required this.episodes,
    required this.screenSize,
  });

  @override
  State<ProgressPath> createState() => _ProgressPathState();
}

class _ProgressPathState extends State<ProgressPath>
    with TickerProviderStateMixin {
  late AnimationController _sparkleController;
  late Animation<double> _sparkleAnimation;

  @override
  void initState() {
    super.initState();

    _sparkleController = AnimationController(
      duration: const Duration(seconds: 4),
      vsync: this,
    );
    _sparkleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(_sparkleController);

    _sparkleController.repeat();
  }

  @override
  void dispose() {
    _sparkleController.dispose();
    super.dispose();
  }

  /// Calcula las posiciones de los episodios en un patrón de cuadrantes (5 filas x 2 columnas)
  /// Los episodios se posicionan alternando entre columnas (zigzag)
  List<Offset> _getEpisodePositions() {
    final width = widget.screenSize.width;
    final height = widget.screenSize.height;

    final positions = <Offset>[];
    const int rows = 5;
    const int cols = 2;

    // Padding desde los bordes
    const double horizontalPadding = 0.15; // 15% padding
    const double verticalPadding = 0.1;   // 10% padding

    // Espacio disponible para el grid
    final double availableWidth = width * (1 - 2 * horizontalPadding);
    final double availableHeight = height * (1 - 2 * verticalPadding);

    // Tamaño de cada cuadrante
    final double quadrantWidth = availableWidth / cols;
    final double quadrantHeight = availableHeight / rows;

    for (int i = 0; i < widget.episodes.length && i < rows * cols; i++) {
      // Alternar entre columnas: 0, 1, 0, 1, 0...
      final int col = i % cols;
      final int row = i ~/ cols;

      // Posición X: centro del cuadrante correspondiente
      final double x = width * horizontalPadding +
                       (col + 0.5) * quadrantWidth;

      // Posición Y: centro del cuadrante correspondiente
      final double y = height * verticalPadding +
                       (row + 0.5) * quadrantHeight;

      positions.add(Offset(x, y));
    }

    return positions;
  }

  @override
  Widget build(BuildContext context) {
    final positions = _getEpisodePositions();

    return CustomPaint(
      size: widget.screenSize,
      painter: _PathPainter(
        episodes: widget.episodes,
        positions: positions,
        sparkleAnimation: _sparkleAnimation,
      ),
    );
  }
}

class _PathPainter extends CustomPainter {
  final List<Episode> episodes;
  final List<Offset> positions;
  final Animation<double> sparkleAnimation;

  _PathPainter({
    required this.episodes,
    required this.positions,
    required this.sparkleAnimation,
  }) : super(repaint: sparkleAnimation);

  @override
  void paint(Canvas canvas, Size size) {
    final pathPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final sparklePaint = Paint()
      ..style = PaintingStyle.fill
      ..color = Colors.amber;

    // Dibujar conexiones entre episodios
    for (int i = 0; i < positions.length - 1; i++) {
      final start = positions[i];
      final end = positions[i + 1];
      final episode = episodes[i];

      // Color del path según estado del siguiente episodio
      if (episodes[i + 1].status == EpisodeStatus.locked) {
        pathPaint.color = Colors.grey.shade300;
      } else if (episodes[i + 1].status == EpisodeStatus.completed) {
        pathPaint.color = Colors.green.shade400;
      } else {
        pathPaint.color = Colors.blue.shade400;
      }

      // Crear path con conexión estilo cuadrante (90 grados con curvas)
      final path = _createQuadrantPath(start, end, i);

      // Dibujar path
      canvas.drawPath(path, pathPaint);

      // Agregar partículas brillantes en paths completados
      if (episode.status == EpisodeStatus.completed &&
          episodes[i + 1].status != EpisodeStatus.locked) {
        _drawSparkles(canvas, path, sparklePaint);
      }
    }
  }

  /// Crea un path con estilo de cuadrante (conexiones en ángulo de 90 grados con esquinas redondeadas)
  Path _createQuadrantPath(Offset start, Offset end, int index) {
    final path = Path();
    path.moveTo(start.dx, start.dy);

    // Determinar si vamos de izquierda a derecha o derecha a izquierda
    final bool movingRight = end.dx > start.dx;
    final bool movingDown = end.dy > start.dy;

    // Radio de las esquinas redondeadas
    const double cornerRadius = 20.0;

    // Punto intermedio horizontal (a mitad de camino horizontalmente)

    if (movingRight) {
      // Moverse a la derecha primero, luego bajar
      final double horizontalEndX = end.dx - cornerRadius;
      final double verticalStartY = start.dy + cornerRadius;

      // Línea horizontal hacia la derecha
      path.lineTo(horizontalEndX, start.dy);

      // Esquina redondeada (cuarto de círculo)
      if (movingDown) {
        path.arcToPoint(
          Offset(end.dx, verticalStartY),
          radius: const Radius.circular(cornerRadius),
          clockwise: true,
        );
      } else {
        path.arcToPoint(
          Offset(end.dx, start.dy - cornerRadius),
          radius: const Radius.circular(cornerRadius),
          clockwise: false,
        );
      }

      // Línea vertical hacia abajo/arriba
      path.lineTo(end.dx, end.dy);
    } else {
      // Moverse hacia abajo primero, luego a la izquierda
      final double verticalEndY = end.dy - (movingDown ? cornerRadius : -cornerRadius);
      final double horizontalStartX = start.dx - cornerRadius;

      // Línea vertical hacia abajo/arriba
      path.lineTo(start.dx, verticalEndY);

      // Esquina redondeada
      if (movingDown) {
        path.arcToPoint(
          Offset(horizontalStartX, end.dy),
          radius: const Radius.circular(cornerRadius),
          clockwise: true,
        );
      } else {
        path.arcToPoint(
          Offset(horizontalStartX, end.dy),
          radius: const Radius.circular(cornerRadius),
          clockwise: false,
        );
      }

      // Línea horizontal hacia la izquierda
      path.lineTo(end.dx, end.dy);
    }

    return path;
  }

  void _drawSparkles(Canvas canvas, Path path, Paint paint) {
    final pathMetrics = path.computeMetrics();
    for (final metric in pathMetrics) {
      // Dibujar 3-4 partículas a lo largo del path
      for (int i = 0; i < 3; i++) {
        final progress = (sparkleAnimation.value + i * 0.3) % 1.0;
        final distance = metric.length * progress;
        final tangent = metric.getTangentForOffset(distance);

        if (tangent != null) {
          final sparkleSize = 4.0 + 2.0 * math.sin(sparkleAnimation.value * math.pi * 2);
          final opacity = 0.5 + 0.3 * math.sin(sparkleAnimation.value * math.pi * 2);
          canvas.drawCircle(
            tangent.position,
            sparkleSize,
            paint..color = Colors.amber.withValues(alpha: opacity),
          );
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
