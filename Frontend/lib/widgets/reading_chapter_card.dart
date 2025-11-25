import 'package:flutter/material.dart';
import '../models/reading_chapter.dart';

class ReadingChapterCard extends StatelessWidget {
  final ReadingChapter chapter;
  final VoidCallback onTap;

  const ReadingChapterCard({
    super.key,
    required this.chapter,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: chapter.isUnlocked ? 4 : 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: chapter.isUnlocked ? onTap : null,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: _getBackgroundGradient(),
          ),
          child: Stack(
            children: [
              // Main content
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Order badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _getBadgeColor(),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${chapter.order}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                    const Spacer(),

                    // Title
                    Text(
                      chapter.title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: chapter.isUnlocked ? Colors.black87 : Colors.grey,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),

                    // Level
                    Text(
                      chapter.levelDisplay,
                      style: TextStyle(
                        fontSize: 12,
                        color: chapter.isUnlocked ? Colors.grey.shade600 : Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Progress or status
                    if (chapter.isCompleted)
                      _buildCompletedBadge()
                    else if (chapter.isUnlocked && chapter.progress > 0)
                      _buildProgressBar()
                    else if (!chapter.isUnlocked)
                      _buildLockedBadge(),
                  ],
                ),
              ),

              // Lock overlay
              if (!chapter.isUnlocked)
                Positioned(
                  top: 16,
                  right: 16,
                  child: Icon(
                    Icons.lock,
                    color: Colors.grey.shade400,
                    size: 32,
                  ),
                ),

              // Completed checkmark
              if (chapter.isCompleted)
                Positioned(
                  top: 16,
                  right: 16,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  LinearGradient _getBackgroundGradient() {
    if (!chapter.isUnlocked) {
      return LinearGradient(
        colors: [
          Colors.grey.shade200,
          Colors.grey.shade300,
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }

    if (chapter.isCompleted) {
      return LinearGradient(
        colors: [
          Colors.green.shade50,
          Colors.green.shade100,
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }

    if (chapter.progress > 0) {
      return LinearGradient(
        colors: [
          Colors.blue.shade50,
          Colors.blue.shade100,
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }

    return const LinearGradient(
      colors: [
        Colors.white,
        Color(0xFFF5F5F5),
      ],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  Color _getBadgeColor() {
    switch (chapter.level.toUpperCase()) {
      case 'BASIC':
        return Colors.green;
      case 'INTERMEDIATE':
        return Colors.orange;
      case 'ADVANCED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Widget _buildCompletedBadge() {
    return Row(
      children: [
        const Icon(
          Icons.check_circle,
          color: Colors.green,
          size: 16,
        ),
        const SizedBox(width: 4),
        Text(
          chapter.score != null ? 'Score: ${chapter.score}/10' : 'Completed',
          style: const TextStyle(
            fontSize: 12,
            color: Colors.green,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildProgressBar() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: chapter.progress / 100,
                  backgroundColor: Colors.grey.shade300,
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.blue),
                  minHeight: 6,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '${chapter.progress.toInt()}%',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildLockedBadge() {
    return Row(
      children: [
        Icon(
          Icons.lock_outline,
          color: Colors.grey.shade600,
          size: 16,
        ),
        const SizedBox(width: 4),
        Text(
          'Locked',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }
}
