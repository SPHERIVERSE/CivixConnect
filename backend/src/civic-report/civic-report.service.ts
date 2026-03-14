import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportType, ReportStatus, Role, TransactionSource } from '@prisma/client';
import { CleanCoinService } from '../cleancoin/cleancoin.service';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class CivicReportService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => CleanCoinService))
    private cleanCoinService: CleanCoinService,
    @Inject(forwardRef(() => GeminiService))
    private geminiService: GeminiService,
  ) {}

  async createReport(data: {
    title: string;
    description?: string;
    type: ReportType;
    imageUrl?: string | null;
    localFilePath?: string; // NEW parameter
    latitude: number;
    longitude: number;
    createdById: string;
  }) {
    const report = await this.prisma.civicReport.create({
      data: {
        title: data.title,
        description: data.description || '',
        type: data.type,
        imageUrl: data.imageUrl || null,
        latitude: data.latitude,
        longitude: data.longitude,
        createdBy: {
          connect: { id: data.createdById },
        },
      },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        supports: true,
      },
    });

    // Enrich the report with AI analysis
    try {
      const analysis = await this.geminiService.analyzeCivicReport({
        title: report.title,
        description: report.description,
        type: report.type,
        latitude: report.latitude,
        longitude: report.longitude,
        localFilePath: data.localFilePath, // Pass the path to Gemini
      });

      const radius = 0.001; 
      const nearby = await this.prisma.civicReport.findMany({
        where: {
          id: { not: report.id },
          latitude: { gte: report.latitude - radius, lte: report.latitude + radius },
          longitude: { gte: report.longitude - radius, lte: report.longitude + radius },
        },
        take: 10,
      });

      let canonicalId: string | null = null;
      let bestScore = 0;

      for (const candidate of nearby) {
        const score = await this.geminiService.compareCivicReports({
          existing: {
            title: candidate.title,
            description: candidate.description,
            type: candidate.type,
          },
          incoming: {
            title: report.title,
            description: report.description,
            type: report.type,
          },
        });

        if (score > 0.8 && score > bestScore) {
          bestScore = score;
          canonicalId = candidate.canonicalReportId || candidate.id;
        }
      }

      const isValidType = Object.values(ReportType).includes(analysis.detectedType as ReportType);
      const safeDetectedType = isValidType ? (analysis.detectedType as ReportType) : null;

      const updated = await this.prisma.civicReport.update({
        where: { id: report.id },
        data: {
          aiDetectedType: safeDetectedType,
          aiConfidence: analysis.confidence,
          aiSeverityScore: analysis.severityScore,
          aiPriority: analysis.priority,
          aiSummary: analysis.summary,
          aiFlaggedAsSpam: analysis.flaggedAsSpam,
          canonicalReportId: canonicalId,
        },
        include: {
          createdBy: { select: { id: true, name: true, role: true } },
          supports: true,
        },
      });

      if (canonicalId) {
        await this.prisma.civicReport.update({
          where: { id: canonicalId },
          data: { duplicateCount: { increment: 1 } },
        });
      }

      return this.formatReportResponse(updated, data.createdById);
    } catch (error) {
      console.error('AI enrichment for civic report failed:', error);
      return this.formatReportResponse(report, data.createdById);
    }
  }

  async getAllReports(currentUserId: string) {
    const reports = await this.prisma.civicReport.findMany({
      include: {
        supports: true,
        createdBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map((report) =>
      this.formatReportResponse(report, currentUserId),
    );
  }

  async getAdminReports(currentUserId: string) {
    const reports = await this.prisma.civicReport.findMany({
      where: { supportCount: { gte: 5 } },
      include: {
        supports: true,
        createdBy: { select: { id: true, name: true, role: true } },
        assignedToWorker: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map((report) => this.formatReportResponse(report, currentUserId));
  }

  async getMyReports(userId: string) {
    const reports = await this.prisma.civicReport.findMany({
      where: { createdById: userId },
      include: {
        supports: true,
        createdBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map((report) => this.formatReportResponse(report, userId));
  }
  
  async withdrawReport(reportId: string, userId: string) {
    const report = await this.prisma.civicReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to withdraw this report');
    }

    await this.prisma.civicReport.delete({
      where: { id: reportId },
    });

    return { message: 'Report withdrawn successfully' };
  }

  async getOtherReports(userId: string) {
    const reports = await this.prisma.civicReport.findMany({
      where: { NOT: { createdById: userId } },
      include: {
        supports: true,
        createdBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map((report) => this.formatReportResponse(report, userId));
  }

  async getReportById(id: string, currentUserId: string) {
    const report = await this.prisma.civicReport.findUnique({
      where: { id },
      include: {
        supports: true,
        createdBy: { select: { id: true, name: true, role: true } },
      },
    });

    if (!report) throw new NotFoundException('Report not found');

    return this.formatReportResponse(report, currentUserId);
  }

  async supportReport(reportId: string, userId: string) {
    const report = await this.prisma.civicReport.findUnique({
      where: { id: reportId },
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.createdById === userId) {
      throw new ForbiddenException('Cannot vote on your own report');
    }

    const existing = await this.prisma.civicReportSupport.findUnique({
      where: { reportId_userId: { reportId, userId } }, 
    });

    if (existing) {
      throw new BadRequestException('You have already voted on this report');
    }

    const support = await this.prisma.civicReportSupport.create({
      data: { reportId, userId, support: true },
    });

    await this.prisma.civicReport.update({
      where: { id: reportId },
      data: { supportCount: { increment: 1 } },
    });

    try {
      const hasEarned = await this.cleanCoinService.hasEarnedForAction(
        userId,
        TransactionSource.SUPPORT_VOTE,
        { reportId }
      );
      
      if (!hasEarned) {
        await this.cleanCoinService.awardCoins(
          userId,
          2,
          TransactionSource.SUPPORT_VOTE,
          `Supported a civic report`,
          { reportId }
        );
      }
    } catch (error) {
      console.error('Failed to award CleanCoins for support vote:', error);
    }

    await this.checkThreshold(reportId);
    return support;
  }

  async opposeReport(reportId: string, userId: string) {
    const report = await this.prisma.civicReport.findUnique({
      where: { id: reportId },
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.createdById === userId) {
      throw new ForbiddenException('Cannot vote on your own report');
    }

    const existing = await this.prisma.civicReportSupport.findUnique({
      where: { reportId_userId: { reportId, userId } }, 
    });

    if (existing) {
      throw new BadRequestException('You have already voted on this report');
    }

    const oppose = await this.prisma.civicReportSupport.create({
      data: { reportId, userId, support: false },
    });

    await this.prisma.civicReport.update({
      where: { id: reportId },
      data: { oppositionCount: { increment: 1 } },
    });

    await this.checkThreshold(reportId);
    return oppose;
  }

  private formatReportResponse(report: any, currentUserId: string) {
    const userVote = report.supports?.find(
      (s: any) => s.userId === currentUserId,
    );

    return {
      ...report,
      isOwnReport: report.createdById === currentUserId,
      userVote: userVote ? (userVote.support ? 'support' : 'oppose') : null,
      hasVoted: !!userVote,
      canVote: report.createdById !== currentUserId && !userVote,
    };
  }

  private async checkThreshold(reportId: string) {
    const supportCount = await this.prisma.civicReportSupport.count({
      where: { reportId, support: true },
    });

    const threshold = 5; 
    if (supportCount >= threshold) {
      const updated = await this.prisma.civicReport.update({
        where: { id: reportId },
        data: { status: ReportStatus.escalated }, 
      });

      const admins = await this.prisma.user.findMany({ where: { role: Role.ADMIN } });
      await this.prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          reportId,
          message: `Report ${updated.title} has reached support threshold and needs review.`,
        })),
        skipDuplicates: true,
      });
    }
  }

  async assignToNearestWorker(reportId: string) {
    const report = await this.prisma.civicReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');

    const infraTypes: ReportType[] = [
      ReportType.public_bin_request,
      ReportType.public_toilet_request,
    ];
    if (infraTypes.includes(report.type)) {
      throw new BadRequestException('This is an infrastructure request; handle via admin resolution.');
    }

    const workerLocations = await this.prisma.wasteWorkerLocation.findMany({
      include: { worker: true },
    });
    if (workerLocations.length === 0) throw new BadRequestException('No workers available');

    const nearest = workerLocations
      .map((wl) => ({
        wl,
        dist: Math.hypot(wl.latitude - report.latitude, wl.longitude - report.longitude),
      }))
      .sort((a, b) => a.dist - b.dist)[0].wl;

    const updated = await this.prisma.civicReport.update({
      where: { id: reportId },
      data: { assignedToWorkerId: nearest.workerId, status: ReportStatus.assigned },
      include: { createdBy: true },
    });

    await this.prisma.notification.create({
      data: {
        userId: nearest.workerId,
        reportId: reportId,
        message: `A report has been assigned to you: ${updated.title}`,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: updated.createdById,
        reportId: reportId,
        message: `Your report "${updated.title}" has been assigned to a worker and is being processed.`,
      },
    });

    return updated;
  }

  async workerUploadResolution(reportId: string, workerId: string, imageUrl: string, notes?: string) {
    const report = await this.prisma.civicReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    if (report.assignedToWorkerId !== workerId) throw new ForbiddenException('Not assigned to you');

    const updated = await this.prisma.civicReport.update({
      where: { id: reportId },
      data: { resolvedImageUrl: imageUrl, resolvedNotes: notes ?? null }, 
      include: { createdBy: true },
    });

    const admins = await this.prisma.user.findMany({ where: { role: Role.ADMIN } });
    await this.prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        reportId,
        message: `Worker uploaded resolution evidence for: ${updated.title}`,
      })),
      skipDuplicates: true,
    });

    return updated;
  }

  async workerMarkResolved(reportId: string, workerId: string) {
    const report = await this.prisma.civicReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    if (report.assignedToWorkerId !== workerId) throw new ForbiddenException('Not assigned to you');
    if (!report.resolvedImageUrl) throw new BadRequestException('Upload resolution photo first');

    let updatedReport = report;
    if (report.status === ReportStatus.assigned) {
        updatedReport = await this.prisma.civicReport.update({
            where: { id: reportId },
            data: { 
                status: ReportStatus.escalated, 
            },
            include: { createdBy: true },
        });
    }

    const admins = await this.prisma.user.findMany({ where: { role: Role.ADMIN } });
    await this.prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        reportId,
        message: `🚨 Worker finished report: ${updatedReport.title}. Requires Admin Confirmation.`,
      })),
      skipDuplicates: true,
    });
    
    return updatedReport;
  }
  
  async adminConfirmResolution(reportId: string, adminId: string) {
    const report = await this.prisma.civicReport.findUnique({ 
      where: { id: reportId },
      select: { id: true, title: true, createdById: true, status: true },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status === ReportStatus.resolved) {
        throw new BadRequestException('Report is already officially resolved.');
    }

    // 1. Mark the report as resolved
    const updated = await this.prisma.civicReport.update({
      where: { id: reportId },
      data: { 
          status: ReportStatus.resolved, 
      },
      include: { createdBy: true },
    });

    // 2. Handle Rewards & Notifications
    try {
      const hasEarned = await this.cleanCoinService.hasEarnedForAction(
        updated.createdById,
        TransactionSource.REPORT_RESOLUTION,
        { reportId }
      );
      
      if (!hasEarned) {
        // Award 50 CleanCoins
        await this.cleanCoinService.awardCoins(
          updated.createdById,
          50, // Updated to 50
          TransactionSource.REPORT_RESOLUTION,
          `Report resolved: ${updated.title}`,
          { reportId }
        );

        // Award 100 XP for the leaderboard
        await this.prisma.user.update({
          where: { id: updated.createdById },
          data: { totalXp: { increment: 100 } }
        });

        // Send the congratulatory notification WITH the reward amounts
        await this.prisma.notification.create({
          data: {
            userId: updated.createdById, 
            reportId,
            message: `✅ Your report "${updated.title}" was resolved! You earned 50 CleanCoins and 100 XP. Thank you for keeping the city smart!`,
          },
        });
      } else {
        // Fallback notification if they somehow already got the reward
        await this.prisma.notification.create({
          data: {
            userId: updated.createdById, 
            reportId,
            message: `✅ Your report "${updated.title}" has been officially RESOLVED by the administration.`,
          },
        });
      }
    } catch (error) {
      console.error('Failed to award CleanCoins/XP for report resolution:', error);
    }

    return updated;
  }
  
  async getAssignedToWorker(workerId: string) {
    const reports = await this.prisma.civicReport.findMany({
      where: { assignedToWorkerId: workerId },
      orderBy: { createdAt: 'desc' },
    });
    return reports;
  }

  async adminStartWorking(reportId: string, adminId: string) {
    const report = await this.prisma.civicReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');

    const infraTypes: ReportType[] = [
      ReportType.public_bin_request,
      ReportType.public_toilet_request,
      ReportType.POTHOLE,
      ReportType.BROKEN_STREETLIGHT,
      ReportType.ROAD_DAMAGE,
      ReportType.WATER_LEAK,
      ReportType.FALLEN_TREE,
      ReportType.BROKEN_FOOTPATH
    ];
    if (!infraTypes.includes(report.type)) {
      throw new BadRequestException('Only infrastructure requests can be marked as working without assignment');
    }

    const updated = await this.prisma.civicReport.update({
      where: { id: reportId },
      data: { status: ReportStatus.working }, 
      include: { createdBy: true },
    });

    await this.prisma.notification.create({
      data: {
        userId: updated.createdById,
        reportId,
        message: `City authorities have begun working on your reported issue: ${updated.title}`,
      },
    });

    return updated;
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, 
    });
  }

  async markNotificationRead(notificationId: string, userId: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notif || notif.userId !== userId) throw new ForbiddenException('Not allowed');
    return this.prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
  }
}