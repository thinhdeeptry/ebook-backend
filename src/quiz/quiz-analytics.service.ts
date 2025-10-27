import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class QuizAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getQuizAnalytics(pageBlockId: string, userId?: string) {
    const analytics = await this.prisma.quizAnalytics.findFirst({
      where: {
        pageBlockId,
        userId: userId || null
      }
    });

    return analytics;
  }

  async getQuestionAnalytics(quizConfigId: string) {
    const questions = await this.prisma.quizQuestion.findMany({
      where: { quizConfigId },
      include: {
        responses: true
      }
    });

    return questions.map(question => {
      const totalResponses = question.responses.length;
      const correctResponses = question.responses.filter(r => r.isCorrect).length;
      const incorrectResponses = totalResponses - correctResponses;
      const correctRate = totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0;
      
      const totalTime = question.responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
      const averageTimeSpent = totalResponses > 0 ? totalTime / totalResponses : 0;

      // Phân tích phân bố đáp án
      const answerDistribution: Record<string, number> = {};
      question.responses.forEach(response => {
        // const answer = response.userAnswer?.selectedOption || 'unknown';
        // answerDistribution[answer] = (answerDistribution[answer] || 0) + 1;
      });

      return {
        questionId: question.id,
        questionText: question.questionText,
        totalResponses,
        correctResponses,
        incorrectResponses,
        correctRate,
        averageTimeSpent,
        answerDistribution
      };
    });
  }

  async getStudentQuizPerformance(quizConfigId: string, classId?: string) {
    const quizConfig = await this.prisma.quizConfig.findUnique({
      where: { id: quizConfigId }
    });

    if (!quizConfig) return [];

    // Lấy progress từ pageBlock
    const progresses = await this.prisma.studentProgress.findMany({
      where: {
        pageBlockId: quizConfig.pageBlockId
      },
      include: {
        user: true,
        quizAttempts: {
          // orderBy: { createdAt: 'desc' }
        }
      }
    });

    const performances = progresses.map(progress => {
      const attempts = progress.quizAttempts;
      const totalAttempts = attempts.length;
      
      if (totalAttempts === 0) {
        return {
          studentId: progress.user.id,
          studentName: `${progress.user.firstName} ${progress.user.lastName}`,
          totalAttempts: 0,
          bestScore: 0,
          averageScore: 0,
          lastAttemptScore: 0,
          isPassed: false,
          totalTimeSpent: 0,
          lastAttemptDate: null
        };
      }

      const scores = attempts.map(a => a.score || 0);
      const bestScore = Math.max(...scores);
      const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const lastAttempt = attempts[0];
      const totalTimeSpent = attempts.reduce((sum, a) => sum + (a.duration || 0), 0);

      return {
        studentId: progress.user.id,
        studentName: `${progress.user.firstName} ${progress.user.lastName}`,
        totalAttempts,
        bestScore,
        averageScore,
        lastAttemptScore: lastAttempt.score || 0,
        isPassed: lastAttempt.isPass,
        totalTimeSpent,
        lastAttemptDate: lastAttempt.submittedAt
      };
    });

    return performances;
  }

  async getClassQuizAnalytics(quizConfigId: string, classId: string) {
    const quizConfig = await this.prisma.quizConfig.findUnique({
      where: { id: quizConfigId }
    });

    if (!quizConfig) return null;

    // Lấy danh sách học sinh trong lớp
    const classMembers = await this.prisma.classMembership.findMany({
      where: { classId },
      include: { user: true }
    });

    const totalStudents = classMembers.length;

    // Lấy performance của từng học sinh
    const studentPerformances = await this.getStudentQuizPerformance(quizConfigId);
    
    const studentsAttempted = studentPerformances.filter(p => p.totalAttempts > 0).length;
    const studentsPassed = studentPerformances.filter(p => p.isPassed).length;
    const passRate = studentsAttempted > 0 ? (studentsPassed / studentsAttempted) * 100 : 0;

    const scores = studentPerformances
      .filter(p => p.totalAttempts > 0)
      .map(p => p.bestScore);
    
    const averageScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    // Lấy phân tích câu hỏi
    const questionAnalytics = await this.getQuestionAnalytics(quizConfigId);

    return {
      quizId: quizConfigId,
      quizTitle: quizConfig.title,
      totalStudents,
      studentsAttempted,
      studentsPassed,
      passRate,
      averageScore,
      highestScore,
      lowestScore,
      studentPerformances,
      questionAnalytics
    };
  }

  async calculateAndSaveAnalytics(pageBlockId: string, userId?: string) {
    const pageBlock = await this.prisma.pageBlock.findUnique({
      where: { id: pageBlockId },
      include: {
        quizConfig: true,
        progress: {
          where: userId ? { userId } : {},
          include: {
            quizAttempts: true
          }
        }
      }
    });

    if (!pageBlock || !pageBlock.quizConfig) return null;

    const allAttempts = pageBlock.progress.flatMap(p => p.quizAttempts);
    
    if (allAttempts.length === 0) return null;

    const scores = allAttempts.map(a => a.score || 0);
    const durations = allAttempts.map(a => a.duration || 0).filter(d => d > 0);

    const analyticsData = {
      pageBlockId,
      userId: userId || null,
      totalAttempts: allAttempts.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passRate: (allAttempts.filter(a => a.isPass).length / allAttempts.length) * 100,
      averageTimeSpent: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : null
    };

    // Upsert analytics
    const analytics = await this.prisma.quizAnalytics.upsert({
      where: {
        pageBlockId_userId: {
          pageBlockId,
          userId: userId || null
        }
      },
      create: analyticsData,
      update: {
        ...analyticsData,
        lastCalculated: new Date()
      }
    });

    return analytics;
  }
}
