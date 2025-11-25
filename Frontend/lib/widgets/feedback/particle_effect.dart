import 'package:flutter/material.dart';
import 'dart:math' as math;

class ParticleEffect extends StatefulWidget {
  final ParticleType type;
  final int particleCount;
  final Duration duration;
  final Color? primaryColor;
  final Color? secondaryColor;
  final double size;
  final bool autoStart;
  final VoidCallback? onComplete;

  const ParticleEffect({
    super.key,
    this.type = ParticleType.confetti,
    this.particleCount = 50,
    this.duration = const Duration(seconds: 3),
    this.primaryColor,
    this.secondaryColor,
    this.size = 300,
    this.autoStart = true,
    this.onComplete,
  });

  @override
  State<ParticleEffect> createState() => _ParticleEffectState();
}

class _ParticleEffectState extends State<ParticleEffect>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late List<Particle> _particles;
  final math.Random _random = math.Random();

  @override
  void initState() {
    super.initState();
    _setupAnimation();
    _initializeParticles();

    if (widget.autoStart) {
      start();
    }
  }

  void _setupAnimation() {
    _controller = AnimationController(duration: widget.duration, vsync: this);

    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        widget.onComplete?.call();
      }
    });

    _controller.addListener(() {
      setState(() {
        _updateParticles();
      });
    });
  }

  void _initializeParticles() {
    _particles = List.generate(widget.particleCount, (index) {
      return _createParticle();
    });
  }

  Particle _createParticle() {
    final centerX = widget.size / 2;
    final centerY = widget.size / 2;

    switch (widget.type) {
      case ParticleType.confetti:
        return _createConfettiParticle(centerX, centerY);
      case ParticleType.stars:
        return _createStarParticle(centerX, centerY);
      case ParticleType.fireworks:
        return _createFireworkParticle(centerX, centerY);
      case ParticleType.hearts:
        return _createHeartParticle(centerX, centerY);
      case ParticleType.sparkles:
        return _createSparkleParticle(centerX, centerY);
    }
  }

  Particle _createConfettiParticle(double centerX, double centerY) {
    return Particle(
      x: centerX + (_random.nextDouble() - 0.5) * 100,
      y: centerY + (_random.nextDouble() - 0.5) * 100,
      velocityX: (_random.nextDouble() - 0.5) * 400,
      velocityY: -_random.nextDouble() * 300 - 100,
      size: _random.nextDouble() * 8 + 4,
      color: _getRandomColor(),
      rotation: _random.nextDouble() * 2 * math.pi,
      rotationSpeed: (_random.nextDouble() - 0.5) * 10,
      gravity: 200,
      life: 1.0,
      shape: ParticleShape.rectangle,
    );
  }

  Particle _createStarParticle(double centerX, double centerY) {
    final angle = _random.nextDouble() * 2 * math.pi;
    final speed = _random.nextDouble() * 200 + 100;

    return Particle(
      x: centerX,
      y: centerY,
      velocityX: math.cos(angle) * speed,
      velocityY: math.sin(angle) * speed,
      size: _random.nextDouble() * 12 + 8,
      color: _getRandomColor(),
      rotation: 0,
      rotationSpeed: _random.nextDouble() * 5,
      gravity: 50,
      life: 1.0,
      shape: ParticleShape.star,
    );
  }

  Particle _createFireworkParticle(double centerX, double centerY) {
    final angle = _random.nextDouble() * 2 * math.pi;
    final speed = _random.nextDouble() * 300 + 150;

    return Particle(
      x: centerX,
      y: centerY,
      velocityX: math.cos(angle) * speed,
      velocityY: math.sin(angle) * speed,
      size: _random.nextDouble() * 6 + 3,
      color: _getRandomColor(),
      rotation: 0,
      rotationSpeed: 0,
      gravity: 100,
      life: 1.0,
      shape: ParticleShape.circle,
    );
  }

  Particle _createHeartParticle(double centerX, double centerY) {
    return Particle(
      x: centerX + (_random.nextDouble() - 0.5) * 200,
      y: centerY + _random.nextDouble() * 100,
      velocityX: (_random.nextDouble() - 0.5) * 100,
      velocityY: -_random.nextDouble() * 150 - 50,
      size: _random.nextDouble() * 16 + 12,
      color: _getRandomColor(),
      rotation: 0,
      rotationSpeed: (_random.nextDouble() - 0.5) * 2,
      gravity: 80,
      life: 1.0,
      shape: ParticleShape.heart,
    );
  }

  Particle _createSparkleParticle(double centerX, double centerY) {
    final angle = _random.nextDouble() * 2 * math.pi;
    final distance = _random.nextDouble() * 150;

    return Particle(
      x: centerX + math.cos(angle) * distance,
      y: centerY + math.sin(angle) * distance,
      velocityX: (_random.nextDouble() - 0.5) * 50,
      velocityY: (_random.nextDouble() - 0.5) * 50,
      size: _random.nextDouble() * 8 + 4,
      color: _getRandomColor(),
      rotation: 0,
      rotationSpeed: _random.nextDouble() * 8,
      gravity: 0,
      life: 1.0,
      shape: ParticleShape.sparkle,
    );
  }

  Color _getRandomColor() {
    final colors = [
      widget.primaryColor ?? Colors.blue,
      widget.secondaryColor ?? Colors.purple,
      Colors.pink,
      Colors.orange,
      Colors.yellow,
      Colors.green,
      Colors.red,
    ];
    return colors[_random.nextInt(colors.length)];
  }

  void _updateParticles() {
    final dt = 1.0 / 60.0; // Assuming 60 FPS
    final progress = _controller.value;

    for (final particle in _particles) {
      // Update position
      particle.x += particle.velocityX * dt;
      particle.y += particle.velocityY * dt;

      // Apply gravity
      particle.velocityY += particle.gravity * dt;

      // Update rotation
      particle.rotation += particle.rotationSpeed * dt;

      // Update life (fade out over time)
      particle.life = 1.0 - progress;

      // Add some air resistance
      particle.velocityX *= 0.99;
      particle.velocityY *= 0.99;
    }
  }

  void start() {
    _controller.reset();
    _initializeParticles();
    _controller.forward();
  }

  void stop() {
    _controller.stop();
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
      child: CustomPaint(painter: ParticlePainter(_particles)),
    );
  }
}

class ParticlePainter extends CustomPainter {
  final List<Particle> particles;

  ParticlePainter(this.particles);

  @override
  void paint(Canvas canvas, Size size) {
    for (final particle in particles) {
      if (particle.life <= 0) continue;

      final paint = Paint()
        ..color = particle.color.withValues(alpha: particle.life)
        ..style = PaintingStyle.fill;

      canvas.save();
      canvas.translate(particle.x, particle.y);
      canvas.rotate(particle.rotation);

      switch (particle.shape) {
        case ParticleShape.circle:
          canvas.drawCircle(Offset.zero, particle.size / 2, paint);
          break;
        case ParticleShape.rectangle:
          canvas.drawRect(
            Rect.fromCenter(
              center: Offset.zero,
              width: particle.size,
              height: particle.size * 0.6,
            ),
            paint,
          );
          break;
        case ParticleShape.star:
          _drawStar(canvas, paint, particle.size);
          break;
        case ParticleShape.heart:
          _drawHeart(canvas, paint, particle.size);
          break;
        case ParticleShape.sparkle:
          _drawSparkle(canvas, paint, particle.size);
          break;
      }

      canvas.restore();
    }
  }

  void _drawStar(Canvas canvas, Paint paint, double size) {
    final path = Path();
    final radius = size / 2;
    final innerRadius = radius * 0.4;

    for (int i = 0; i < 10; i++) {
      final angle = (i * math.pi) / 5;
      final r = i.isEven ? radius : innerRadius;
      final x = r * math.cos(angle - math.pi / 2);
      final y = r * math.sin(angle - math.pi / 2);

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    path.close();
    canvas.drawPath(path, paint);
  }

  void _drawHeart(Canvas canvas, Paint paint, double size) {
    final path = Path();
    final scale = size / 20;

    path.moveTo(0, 5 * scale);
    path.cubicTo(
      -5 * scale,
      -5 * scale,
      -15 * scale,
      -5 * scale,
      -10 * scale,
      0,
    );
    path.cubicTo(
      -10 * scale,
      -5 * scale,
      -5 * scale,
      -10 * scale,
      0,
      -5 * scale,
    );
    path.cubicTo(5 * scale, -10 * scale, 10 * scale, -5 * scale, 10 * scale, 0);
    path.cubicTo(15 * scale, -5 * scale, 5 * scale, -5 * scale, 0, 5 * scale);

    canvas.drawPath(path, paint);
  }

  void _drawSparkle(Canvas canvas, Paint paint, double size) {
    final radius = size / 2;

    // Draw cross shape
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset.zero,
        width: radius * 2,
        height: radius * 0.3,
      ),
      paint,
    );

    canvas.drawRect(
      Rect.fromCenter(
        center: Offset.zero,
        width: radius * 0.3,
        height: radius * 2,
      ),
      paint,
    );

    // Draw diagonal lines
    canvas.save();
    canvas.rotate(math.pi / 4);
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset.zero,
        width: radius * 1.4,
        height: radius * 0.2,
      ),
      paint,
    );
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset.zero,
        width: radius * 0.2,
        height: radius * 1.4,
      ),
      paint,
    );
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}

class Particle {
  double x;
  double y;
  double velocityX;
  double velocityY;
  double size;
  Color color;
  double rotation;
  double rotationSpeed;
  double gravity;
  double life;
  ParticleShape shape;

  Particle({
    required this.x,
    required this.y,
    required this.velocityX,
    required this.velocityY,
    required this.size,
    required this.color,
    required this.rotation,
    required this.rotationSpeed,
    required this.gravity,
    required this.life,
    required this.shape,
  });
}

enum ParticleType { confetti, stars, fireworks, hearts, sparkles }

enum ParticleShape { circle, rectangle, star, heart, sparkle }

// Helper widget for easy particle effects
class CelebrationParticles extends StatelessWidget {
  final Widget child;
  final bool isActive;
  final ParticleType type;
  final int particleCount;
  final Duration duration;
  final Color? primaryColor;
  final Color? secondaryColor;

  const CelebrationParticles({
    super.key,
    required this.child,
    this.isActive = false,
    this.type = ParticleType.confetti,
    this.particleCount = 30,
    this.duration = const Duration(seconds: 2),
    this.primaryColor,
    this.secondaryColor,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        if (isActive)
          Positioned.fill(
            child: IgnorePointer(
              child: ParticleEffect(
                type: type,
                particleCount: particleCount,
                duration: duration,
                primaryColor: primaryColor,
                secondaryColor: secondaryColor,
                autoStart: true,
              ),
            ),
          ),
      ],
    );
  }
}
