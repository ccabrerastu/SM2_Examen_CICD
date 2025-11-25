import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/chapter_evaluation.dart' as chapter;
import '../models/approval_evaluation.dart' as approval;

import '../widgets/chapter_evaluation_card.dart';
import 'evaluation_details_screen.dart';
import '../l10n/app_localizations.dart';
import '../providers/approval_provider.dart';

class ChapterResultsScreen extends StatefulWidget {
  const ChapterResultsScreen({super.key});

  @override
  State<ChapterResultsScreen> createState() => _ChapterResultsScreenState();
}

class _ChapterResultsScreenState extends State<ChapterResultsScreen> {
  // Campos del branch main (se conservan por compatibilidad; el flujo usa Provider)
  List<chapter.ChapterEvaluation> evaluations = [];
  bool isLoading = true;

  String? selectedChapter;

  @override
  void initState() {
    super.initState();
    // Carga tras el primer frame usando Provider
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadEvaluations();
    });
  }

  Future<void> _loadEvaluations() async {
    final approvalProvider =
        Provider.of<ApprovalProvider>(context, listen: false);
    await approvalProvider.initializeApprovalData();
  }

  List<chapter.ChapterEvaluation> _getFilteredEvaluations(
      List<chapter.ChapterEvaluation> evaluations) {
    if (selectedChapter == null) return evaluations;
    return evaluations
        .where((eval) => eval.chapterNumber.toString() == selectedChapter)
        .toList();
  }

  Set<String> _getAvailableChapters(
      List<chapter.ChapterEvaluation> evaluations) {
    return evaluations.map((eval) => eval.chapterNumber.toString()).toSet();
  }

  List<chapter.ChapterEvaluation> _convertApprovalToChapterEvaluations(
      List<approval.ApprovalEvaluation> approvalEvaluations) {
    return approvalEvaluations
        .map(
          (approvalEval) => chapter.ChapterEvaluation(
            id: approvalEval.id,
            chapterNumber: int.tryParse(approvalEval.chapterId) ?? 1,
            // Título por defecto, ApprovalEvaluation no lo trae
            chapterTitle: 'Chapter ${approvalEval.chapterId}',
            score: approvalEval.score.round(),
            // Máximo por defecto (ApprovalEvaluation no lo trae)
            maxScore: 100,
            completedAt: approvalEval.evaluatedAt,
            status: approvalEval.status == approval.EvaluationStatus.approved
                ? chapter.EvaluationStatus.passed
                : chapter.EvaluationStatus.failed,
            attempts: approvalEval.attemptNumber,
            // Duración por defecto (ApprovalEvaluation no lo trae)
            timeSpent: const Duration(minutes: 0),
            // Sin desglose de habilidades en ApprovalEvaluation
            skillBreakdown: const [],
            feedback: approvalEval.feedback,
          ),
        )
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Consumer<ApprovalProvider>(
      builder: (context, approvalProvider, child) {
        final approvalEvaluations = approvalProvider.userEvaluations;
        final evaluations =
            _convertApprovalToChapterEvaluations(approvalEvaluations);
        final filteredEvaluations = _getFilteredEvaluations(evaluations);
        final availableChapters = _getAvailableChapters(evaluations);
        final isLoading = approvalProvider.isLoading;

        return Scaffold(
          backgroundColor: theme.colorScheme.surfaceContainer,
          appBar: AppBar(
            title: Text(l10n.chapterResults),
            backgroundColor: theme.colorScheme.primary,
            foregroundColor: theme.colorScheme.onPrimary,
            elevation: 0,
            centerTitle: true,
            actions: [
              PopupMenuButton<String>(
                icon: const Icon(Icons.filter_list),
                onSelected: (value) {
                  setState(() {
                    selectedChapter = value == 'all' ? null : value;
                  });
                },
                itemBuilder: (context) => [
                  PopupMenuItem(
                    value: 'all',
                    child: Text(l10n.allChapters),
                  ),
                  ...availableChapters.map(
                    (chapterNum) => PopupMenuItem(
                      value: chapterNum,
                      child: Text('${l10n.chapter} $chapterNum'),
                    ),
                  ),
                ],
              ),
            ],
          ),
          body: isLoading
              ? const Center(child: CircularProgressIndicator())
              : approvalProvider.errorMessage != null
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 64,
                            color: theme.colorScheme.error.withValues(alpha: 0.7),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Error loading results',
                            style: theme.textTheme.headlineSmall?.copyWith(
                              color:
                                  theme.colorScheme.onSurface.withValues(alpha: 0.7),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            approvalProvider.errorMessage!,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.error.withValues(alpha: 0.8),
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: () =>
                                approvalProvider.initializeApprovalData(),
                            icon: const Icon(Icons.refresh),
                            label: Text(l10n.retry),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: () => approvalProvider.refreshApprovalData(),
                      child: filteredEvaluations.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.assessment_outlined,
                                    size: 64,
                                    color: theme.colorScheme.primary
                                        .withValues(alpha: 0.5),
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    l10n.noEvaluationsFound,
                                    style: theme.textTheme.headlineSmall
                                        ?.copyWith(
                                      color: theme.colorScheme.onSurface
                                          .withValues(alpha: 0.7),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    l10n.completeChaptersToSeeResults,
                                    style: theme.textTheme.bodyLarge
                                        ?.copyWith(
                                      color: theme.colorScheme.onSurface
                                          .withValues(alpha: 0.7),
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: filteredEvaluations.length,
                              itemBuilder: (context, index) {
                                final evaluation =
                                    filteredEvaluations[index];
                                return Padding(
                                  padding:
                                      const EdgeInsets.only(bottom: 12),
                                  child: ChapterEvaluationCard(
                                    evaluation: evaluation,
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) =>
                                              EvaluationDetailsScreen(
                                            evaluation: evaluation,
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                );
                              },
                            ),
                    ),
        );
      },
    );
  }
}

