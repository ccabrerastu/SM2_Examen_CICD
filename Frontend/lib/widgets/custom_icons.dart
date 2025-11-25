import 'package:flutter/material.dart';

class CustomIcons {
  static Widget vocabularyIcon() {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Base cubes
        Container(
          width: 45,
          height: 45,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF4CAF50), // Green
                Color(0xFF2E7D32),
              ],
            ),
          ),
        ),
        // Overlapping cubes
        Positioned(
          top: 5,
          right: 5,
          child: Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF2196F3), // Blue
                  Color(0xFF1565C0),
                ],
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 5,
          left: 5,
          child: Container(
            width: 15,
            height: 15,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(3),
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFFFF9800), // Orange
                  Color(0xFFE65100),
                ],
              ),
            ),
          ),
        ),
        // Documents overlay
        Positioned(
          top: 8,
          left: 8,
          child: Icon(
            Icons.description,
            color: Colors.white,
            size: 16,
          ),
        ),
      ],
    );
  }

  static Widget readingIcon() {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Books stack
        Container(
          width: 40,
          height: 32,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(4),
            color: const Color(0xFF3F51B5), // Indigo
          ),
        ),
        Positioned(
          top: -2,
          left: 2,
          child: Container(
            width: 36,
            height: 28,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              color: const Color(0xFF673AB7), // Deep Purple
            ),
          ),
        ),
        Positioned(
          top: -4,
          left: 4,
          child: Container(
            width: 32,
            height: 24,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              color: const Color(0xFF9C27B0), // Purple
            ),
          ),
        ),
        // Glasses overlay
        Positioned(
          bottom: 5,
          child: Container(
            width: 24,
            height: 8,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF8B5FBF), width: 2),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Container(
                  width: 8,
                  height: 6,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color(0x408B5FBF),
                  ),
                ),
                Container(
                  width: 8,
                  height: 6,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color(0x408B5FBF),
                  ),
                ),
              ],
            ),
          ),
        ),
        // Stars
        Positioned(
          top: 2,
          right: 2,
          child: Icon(
            Icons.star,
            color: Colors.yellow.shade600,
            size: 8,
          ),
        ),
        Positioned(
          top: 8,
          right: -2,
          child: Icon(
            Icons.star,
            color: Colors.yellow.shade400,
            size: 6,
          ),
        ),
      ],
    );
  }

  static Widget interviewIcon() {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Desk/background
        Container(
          width: 50,
          height: 40,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            color: const Color(0xFF5D4037), // Brown desk
          ),
        ),
        // Person silhouette
        Positioned(
          top: 5,
          child: Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(15),
              color: const Color(0xFF37474F), // Dark gray person
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Head
                Container(
                  width: 12,
                  height: 12,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color(0xFFBCAAA4), // Skin tone
                  ),
                ),
                const SizedBox(height: 2),
                // Body with tie
                Container(
                  width: 16,
                  height: 12,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(4),
                    color: const Color(0xFF263238), // Dark shirt
                  ),
                  child: Center(
                    child: Container(
                      width: 3,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Color(0xFFD32F2F), // Red tie
                        borderRadius: BorderRadius.all(Radius.circular(1.5)),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        // Briefcase or document
        Positioned(
          bottom: 2,
          right: 2,
          child: Container(
            width: 12,
            height: 8,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2),
              color: const Color(0xFF424242),
            ),
            child: Center(
              child: Icon(
                Icons.work,
                color: Colors.white,
                size: 6,
              ),
            ),
          ),
        ),
      ],
    );
  }
}