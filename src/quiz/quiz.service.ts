import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateQuizConfigDto, UpdateQuizConfigDto } from './dto/quiz-config.dto';
import { CreateQuizQuestionDto, UpdateQuizQuestionDto } from './dto/quiz-question.dto';
import {
  StartQuizAttemptDto,
  SubmitAnswerDto,
  CompleteQuizAttemptDto,
} from './dto/quiz-attempt.dto';
import { ProgressStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  // ==================== QUIZ CONFIG ====================

  async createQuizConfig(dto: CreateQuizConfigDto) {
    // Kiểm tra PageBlock tồn tại
    const pageBlock = await this.prisma.pageBlock.findUnique({
      where: { id: dto.pageBlockId },
    });

    if (!pageBlock) {
      throw new NotFoundException('PageBlock không tồn tại');
    }

    // Kiểm tra đã có QuizConfig chưa
    const existing = await this.prisma.quizConfig.findUnique({
      where: { pageBlockId: dto.pageBlockId },
    });

    if (existing) {
      throw new BadRequestException('PageBlock này đã có QuizConfig');
    }

    return this.prisma.quizConfig.create({
      data: dto,
    });
  }

  async getQuizConfigByPageBlock(pageBlockId: string) {
    const config = await this.prisma.quizConfig.findUnique({
      where: { pageBlockId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!config) {
      throw new NotFoundException('QuizConfig không tồn tại');
    }

    return config;
  }

  async updateQuizConfig(id: string, dto: UpdateQuizConfigDto) {
    return this.prisma.quizConfig.update({
      where: { id },
      data: dto,
    });
  }

  async deleteQuizConfig(id: string) {
    return this.prisma.quizConfig.delete({
      where: { id },
    });
  }

  // ==================== QUIZ QUESTIONS ====================

  async createQuestion(dto: CreateQuizQuestionDto) {
    return this.prisma.quizQuestion.create({
      data: dto,
    });
  }

  async getQuestionsByQuizConfig(quizConfigId: string) {
    return this.prisma.quizQuestion.findMany({
      where: { quizConfigId },
      orderBy: { order: 'asc' },
    });
  }

  async updateQuestion(id: string, dto: UpdateQuizQuestionDto) {
    return this.prisma.quizQuestion.update({
      where: { id },
      data: dto,
    });
  }

  async deleteQuestion(id: string) {
    return this.prisma.quizQuestion.delete({
      where: { id },
    });
  }

  // ==================== QUIZ ATTEMPTS ====================

  async startQuizAttempt(userId: string, dto: StartQuizAttemptDto) {
    const pageBlock = await this.prisma.pageBlock.findUnique({
      where: { id: dto.pageBlockId },
      include: {
        quizConfig: {
          include: {
            questions: {
              include: {
                h5pContent: true,
              },
            },
          },
        },
      },
    });

    if (!pageBlock || !pageBlock.quizConfig) {
      throw new NotFoundException('Quiz không tồn tại');
    }

    const quizConfig = pageBlock.quizConfig;

    // Kiểm tra số lần làm bài
    const progress = await this.prisma.studentProgress.findUnique({
      where: {
        userId_pageBlockId: {
          userId,
          pageBlockId: dto.pageBlockId,
        },
      },
      include: {
        quizAttempts: true,
      },
    });

    if (
      quizConfig.maxAttempts &&
      progress &&
      progress.quizAttempts.length >= quizConfig.maxAttempts
    ) {
      throw new BadRequestException(`Đã hết số lần làm bài (${quizConfig.maxAttempts} lần)`);
    }

    // Tạo hoặc cập nhật StudentProgress
    const studentProgress = await this.prisma.studentProgress.upsert({
      where: {
        userId_pageBlockId: {
          userId,
          pageBlockId: dto.pageBlockId,
        },
      },
      create: {
        userId,
        pageBlockId: dto.pageBlockId,
        status: ProgressStatus.IN_PROGRESS,
      },
      update: {
        status: ProgressStatus.IN_PROGRESS,
      },
    });

    // Tạo QuizAttempt
    const attemptNumber = progress ? progress.quizAttempts.length + 1 : 1;
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        studentProgressId: studentProgress.id,
        attemptNumber,
        isPass: false,
      },
    });

    // Ghi xAPI Statement "attempted"
    await this.createXApiStatement(
      userId,
      'attempted',
      quizConfig.id,
      attempt.id,
      pageBlock.h5pContentId,
    );

    return {
      attemptId: attempt.id,
      attemptNumber,
      questions: this.sanitizeQuestionsForStudent(
        quizConfig.questions,
        quizConfig.shuffleQuestions,
      ),
      timeLimit: quizConfig.timeLimit,
      totalPoints: quizConfig.questions.reduce((sum, q) => sum + q.points, 0),
    };
  }

  async submitAnswer(userId: string, dto: SubmitAnswerDto) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: dto.attemptId },
      include: {
        studentProgress: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt không tồn tại');
    }

    if (attempt.studentProgress.userId !== userId) {
      throw new ForbiddenException('Không có quyền truy cập');
    }

    if (attempt.submittedAt) {
      throw new BadRequestException('Bài tập đã được submit');
    }

    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: dto.questionId },
    });

    if (!question) {
      throw new NotFoundException('Câu hỏi không tồn tại');
    }

    // Kiểm tra đáp án
    const { isCorrect, pointsEarned } = this.checkAnswer(question, dto.userAnswer);

    // Lưu QuestionResponse
    const response = await this.prisma.questionResponse.create({
      data: {
        quizAttemptId: dto.attemptId,
        questionId: dto.questionId,
        userAnswer: dto.userAnswer,
        isCorrect,
        pointsEarned,
        timeSpent: dto.timeSpent || 0,
      },
    });

    // Ghi xAPI Statement "answered"
    await this.createXApiStatement(
      userId,
      'answered',
      dto.questionId,
      dto.attemptId,
      question.h5pContentId,
      {
        score: pointsEarned,
        maxScore: question.points,
        success: isCorrect,
        response: dto.userAnswer,
      },
    );

    return {
      responseId: response.id,
      isCorrect,
      pointsEarned,
      maxPoints: question.points,
    };
  }

  async completeQuizAttempt(userId: string, dto: CompleteQuizAttemptDto) {
    const startTime = Date.now();

    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: dto.attemptId },
      include: {
        studentProgress: {
          include: {
            pageBlock: {
              include: {
                quizConfig: {
                  include: { questions: true },
                },
              },
            },
          },
        },
        questionResponses: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt không tồn tại');
    }

    if (attempt.studentProgress.userId !== userId) {
      throw new ForbiddenException('Không có quyền truy cập');
    }

    if (attempt.submittedAt) {
      throw new BadRequestException('Bài tập đã được submit');
    }

    const quizConfig = attempt.studentProgress.pageBlock.quizConfig;

    // Submit các câu chưa trả lời
    for (const answer of dto.answers) {
      const existingResponse = attempt.questionResponses.find(
        (r) => r.questionId === answer.questionId,
      );
      if (!existingResponse) {
        await this.submitAnswer(userId, {
          attemptId: dto.attemptId,
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          timeSpent: answer.timeSpent,
        });
      }
    }

    // Tính điểm
    const responses = await this.prisma.questionResponse.findMany({
      where: { quizAttemptId: dto.attemptId },
    });

    const totalPoints = responses.reduce((sum, r) => sum + r.pointsEarned, 0);
    const maxPoints = quizConfig.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
    const isPass = percentage >= quizConfig.passingScore;
    const duration = Math.floor((Date.now() - startTime) / 1000);

    // Cập nhật QuizAttempt
    const updatedAttempt = await this.prisma.quizAttempt.update({
      where: { id: dto.attemptId },
      data: {
        score: percentage,
        maxScore: 100,
        isPass,
        duration,
        submittedAt: new Date(),
      },
    });

    // Cập nhật StudentProgress
    await this.prisma.studentProgress.update({
      where: { id: attempt.studentProgressId },
      data: {
        status: isPass ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
        completedAt: isPass ? new Date() : null,
      },
    });

    // Ghi xAPI Statements
    await this.createXApiStatement(
      userId,
      'completed',
      quizConfig.id,
      dto.attemptId,
      attempt.studentProgress.pageBlock.h5pContentId,
      {
        score: percentage,
        maxScore: 100,
        success: isPass,
        completion: true,
        duration,
      },
    );

    await this.createXApiStatement(
      userId,
      isPass ? 'passed' : 'failed',
      quizConfig.id,
      dto.attemptId,
      attempt.studentProgress.pageBlock.h5pContentId,
      {
        score: percentage,
        maxScore: 100,
        success: isPass,
      },
    );

    return {
      attemptId: dto.attemptId,
      score: percentage,
      maxScore: 100,
      percentage,
      isPass,
      passingScore: quizConfig.passingScore,
      duration,
      totalQuestions: quizConfig.questions.length,
      correctAnswers: responses.filter((r) => r.isCorrect).length,
      incorrectAnswers: responses.filter((r) => !r.isCorrect).length,
    };
  }

  // ==================== HELPER METHODS ====================

  private checkAnswer(
    question: any,
    userAnswer: any,
  ): { isCorrect: boolean; pointsEarned: number } {
    const metadata = question.metadata;

    switch (question.questionType) {
      case 'multiple-choice':
        const correctOption = metadata.options?.find((opt: any) => opt.isCorrect);
        const isCorrect = userAnswer.selectedOption === correctOption?.id;
        return {
          isCorrect,
          pointsEarned: isCorrect ? question.points : 0,
        };

      case 'true-false':
        return {
          isCorrect: userAnswer.answer === metadata.correctAnswer,
          pointsEarned: userAnswer.answer === metadata.correctAnswer ? question.points : 0,
        };

      default:
        return { isCorrect: false, pointsEarned: 0 };
    }
  }

  private sanitizeQuestionsForStudent(questions: any[], shuffle: boolean) {
    let sanitized = questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      order: q.order,
      points: q.points,
      h5pContentId: q.h5pContentId,
      h5pContent: q.h5pContent,
      metadata: this.removeCorrectAnswers(q.metadata, q.questionType),
    }));

    if (shuffle) {
      sanitized = this.shuffleArray(sanitized);
    }

    return sanitized;
  }

  private removeCorrectAnswers(metadata: any, questionType: string) {
    if (questionType === 'multiple-choice' && metadata.options) {
      return {
        ...metadata,
        options: metadata.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
        })),
      };
    }
    return metadata;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private async createXApiStatement(
    userId: string,
    verbName: string,
    objectId: string,
    attemptId: string,
    h5pContentId?: string,
    result?: any,
  ) {
    const verb = await this.prisma.xApiVerb.findFirst({
      where: { verbIri: { contains: verbName } },
    });

    if (!verb) return;

    const data: any = {
      statementId: crypto.randomUUID(),
      actorId: userId,
      verbId: verb.id,
      objectId,
      objectType: 'Activity',
      quizAttemptId: attemptId,
      h5pContentId,
      contextJson: {
        platform: 'Hệ thống học tập tiểu học',
        language: 'vi-VN',
      },
    };

    if (result) {
      if (result.score !== undefined) data.resultScore = result.score;
      if (result.maxScore !== undefined) data.resultScoreMax = result.maxScore;
      if (result.success !== undefined) data.resultSuccess = result.success;
      if (result.completion !== undefined) data.resultCompletion = result.completion;
      if (result.response !== undefined) data.resultResponse = result.response;
      if (result.duration !== undefined) {
        data.resultDuration = this.formatDuration(result.duration);
      }
    }

    await this.prisma.xApiStatement.create({ data });
  }

  private formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    let duration = 'PT';
    if (h > 0) duration += `${h}H`;
    if (m > 0) duration += `${m}M`;
    if (s > 0) duration += `${s}S`;
    return duration || 'PT0S';
  }
}
