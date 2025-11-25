import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/quiz_provider.dart';
import '../providers/progress_provider.dart';
import '../widgets/quiz_question_card.dart';
import '../widgets/quiz_option_card.dart';
import '../widgets/app_banner.dart';
import '../l10n/app_localizations.dart';

class QuizScreen extends StatelessWidget {
  final String chapterId;
  
  const QuizScreen({super.key, this.chapterId = 'default-chapter'});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => QuizProvider(
        progressProvider: Provider.of<ProgressProvider>(context, listen: false),
        chapterId: chapterId,
      ),
      child: const _QuizScreenContent(),
    );
  }
}

class _QuizScreenContent extends StatelessWidget {
  const _QuizScreenContent();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surfaceContainer,
      appBar: AppBar(
        toolbarHeight: 0,
        backgroundColor: Theme.of(context).colorScheme.primary,
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Theme.of(context).colorScheme.primary,
          statusBarIconBrightness: Theme.of(context).brightness == Brightness.dark 
              ? Brightness.light 
              : Brightness.dark,
          statusBarBrightness: Theme.of(context).brightness,
        ),
      ),
      body: Column(
        children: [
          // Header
          Consumer<QuizProvider>(
            builder: (context, quizProvider, child) {
              return AppBanner(
                title: '${AppLocalizations.of(context)!.quiz} - ${quizProvider.currentQuestion.category}',
                subtitle: AppLocalizations.of(context)!.quiz,
                livesText: '5/5',
              );
            },
          ),
          
          // Content
          Expanded(
            child: SingleChildScrollView(
              child: Consumer<QuizProvider>(
                builder: (context, quizProvider, child) {
                  return Column(
                    children: [
                      // Question Card
                      QuizQuestionCard(
                        question: quizProvider.currentQuestion,
                        questionNumber: quizProvider.currentQuestionIndex + 1,
                      ),
                      
                      // Options Grid
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 16),
                        child: GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 1.8,
                            mainAxisSpacing: 8,
                            crossAxisSpacing: 8,
                          ),
                          itemCount: quizProvider.currentQuestion.options.length,
                          itemBuilder: (context, index) {
                            return QuizOptionCard(
                              option: quizProvider.currentQuestion.options[index],
                              isSelected: quizProvider.selectedOption == index,
                              isCorrect: quizProvider.showResult && 
                                        quizProvider.isCorrectAnswer(index),
                              isWrong: quizProvider.showResult && 
                                      quizProvider.isWrongAnswer(index),
                              showResult: quizProvider.showResult,
                              onTap: () => quizProvider.selectOption(index),
                            );
                          },
                        ),
                      ),
                      
                      const SizedBox(height: 32),
                      
                      // Submit Button
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 32),
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: quizProvider.canSubmit 
                              ? () => quizProvider.submitAnswer()
                              : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Theme.of(context).colorScheme.primary,
                            foregroundColor: Theme.of(context).colorScheme.onPrimary,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(25),
                            ),
                            disabledBackgroundColor: Theme.of(context)
                                .colorScheme
                                .primary
                                .withValues(alpha: 0.5),
                          ),
                          child: Text(
                            quizProvider.hasAnswered 
                                ? AppLocalizations.of(context)!.nextQuestion 
                                : AppLocalizations.of(context)!.submit,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: Colors.black,
                            ),
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Score
                      Text(
                        '${AppLocalizations.of(context)!.score}: ${quizProvider.score} ${AppLocalizations.of(context)!.points}',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Theme.of(context).colorScheme.onSurface,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      
                      const SizedBox(height: 32),
                    ],
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}