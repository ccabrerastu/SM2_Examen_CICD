import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/chapter_evaluation.dart';
import '../l10n/app_localizations.dart';

class EvaluationDetailsScreen extends StatelessWidget {
  final ChapterEvaluation evaluation;

  const EvaluationDetailsScreen({
    super.key,
    required this.evaluation,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');

    return Scaffold(
      backgroundColor: theme.colorScheme.surfaceContainer,
      appBar: AppBar(
        title: Text('${l10n?.chapter ?? "Chapter"} ${evaluation.chapterNumber}'),
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: theme.colorScheme.onPrimary,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Card con información general
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
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
                                evaluation.chapterTitle,
                                style: theme.textTheme.headlineMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: theme.colorScheme.onSurface,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${l10n?.chapter ?? "Chapter"} ${evaluation.chapterNumber}',
                                style: theme.textTheme.bodyLarge?.copyWith(
                                  color: theme.colorScheme.primary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: evaluation.statusColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: evaluation.statusColor.withValues(alpha: 0.3),
                            ),
                          ),
                          child: Text(
                            evaluation.statusText,
                            style: theme.textTheme.labelLarge?.copyWith(
                              color: evaluation.statusColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Puntuación principal
                    Center(
                      child: Column(
                        children: [
                          Container(
                            width: 120,
                            height: 120,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: evaluation.statusColor.withValues(alpha: 0.1),
                              border: Border.all(
                                color: evaluation.statusColor,
                                width: 4,
                              ),
                            ),
                            child: Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    '${evaluation.score}',
                                    style: theme.textTheme.headlineLarge
                                        ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: evaluation.statusColor,
                                    ),
                                  ),
                                  Text(
                                    '/${evaluation.maxScore}',
                                    style: theme.textTheme.titleMedium
                                        ?.copyWith(
                                      color: theme.colorScheme.outline,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            '${evaluation.percentage.toStringAsFixed(1)}%',
                            style: theme.textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: evaluation.statusColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Información de la evaluación
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n?.evaluationInfo ?? "Evaluation Information",
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _InfoRow(
                      icon: Icons.calendar_today,
                      label: l10n?.completedDate ?? "Completed Date",
                      value: dateFormat.format(evaluation.completedAt),
                      theme: theme,
                    ),
                    const SizedBox(height: 12),
                    _InfoRow(
                      icon: Icons.refresh,
                      label: l10n?.attempts ?? "Attempts",
                      value: evaluation.attempts.toString(),
                      theme: theme,
                    ),
                    const SizedBox(height: 12),
                    _InfoRow(
                      icon: Icons.timer,
                      label: l10n?.timeSpent ?? "Time Spent",
                      value: _formatDuration(evaluation.timeSpent),
                      theme: theme,
                    ),
                  ],
                ),
              ),
            ),

            // Desglose por habilidades (si está disponible)
            if (evaluation.skillBreakdown != null &&
                evaluation.skillBreakdown!.isNotEmpty) ...[
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n?.skillBreakdown ?? "Skill Breakdown",
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ...evaluation.skillBreakdown!.map(
                        (skill) => Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: _SkillCard(skill: skill, theme: theme),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],

            // Retroalimentación (si está disponible)
            if (evaluation.feedback != null &&
                evaluation.feedback!.isNotEmpty) ...[
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n?.feedback ?? "Feedback",
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color:
                              theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          evaluation.feedback!,
                          style: theme.textTheme.bodyMedium,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],

            const SizedBox(height: 24),

            // Botón de acción
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () {
                  // TODO: Implementar navegación a repetir capítulo
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(l10n?.featureComingSoon ?? "Feature coming soon")),
                  );
                },
                icon: const Icon(Icons.refresh),
                label: Text(l10n?.repeatChapter ?? "Repeat Chapter"),
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds % 60;
    return '${minutes}m ${seconds}s';
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final ThemeData theme;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: theme.colorScheme.primary),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ),
        Text(
          value,
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _SkillCard extends StatelessWidget {
  final SkillEvaluation skill;
  final ThemeData theme;

  const _SkillCard({required this.skill, required this.theme});

  @override
  Widget build(BuildContext context) {
    final percentage = skill.percentage;
    final color = _getSkillColor(percentage);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  skill.skillName,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Text(
                '${skill.score}/${skill.maxScore}',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: percentage / 100,
            backgroundColor: theme.colorScheme.surfaceContainerHighest,
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 6,
          ),
          const SizedBox(height: 4),
          Text(
            '${percentage.toStringAsFixed(1)}%',
            style: theme.textTheme.labelMedium?.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (skill.feedback != null && skill.feedback!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              skill.feedback!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Color _getSkillColor(double percentage) {
    if (percentage >= 90) return const Color(0xFF4CAF50); // Green
    if (percentage >= 80) return const Color(0xFF2196F3); // Blue
    if (percentage >= 70) return const Color(0xFFFF9800); // Orange
    return const Color(0xFFF44336); // Red
  }
}

