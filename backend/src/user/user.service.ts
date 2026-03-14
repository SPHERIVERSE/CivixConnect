import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // ✅ Get all users with detailed information
  async getAllUsers(role?: Role) {
    return this.prisma.user.findMany({
      where: role ? { role } : {},
      include: {
        civicReports: true,
        posts: true,
        followers: true,
        following: true,
        notifications: {
          where: { isRead: false },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Get user by ID with full details
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        civicReports: true,
        notifications: true,
        posts: true,
        reactions: true,
        followers: {
          include: {
            following: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        following: {
          include: {
            follower: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ✅ Update user role
  async updateUserRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  // ✅ Get user statistics
  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        civicReports: true,
        posts: true,
        reactions: true,
        followers: true,
        following: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const reportsCreated = user.civicReports.length;
    const postsCreated = user.posts.length;
    const followersCount = user.followers.length;
    const followingCount = user.following.length;

    return {
      ...user,
      stats: {
        reportsCreated,
        postsCreated,
        followersCount,
        followingCount,
      },
    };
  }

  // ✅ Get leaderboard data
  async getLeaderboard(limit: number = 10, role?: Role) {
    const users = await this.prisma.user.findMany({
      where: role ? { role } : {},
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        totalXp: true,
        role: true,
        createdAt: true,
        civicReports: true,
      },
      orderBy: { totalXp: 'desc' },
      take: limit,
    });

    return users.map((user, index) => ({
      ...user,
      rank: index + 1,
      reportsCreated: user.civicReports.length,
    }));
  }

  // ✅ Get user's rank
  async getUserRank(userId: string, role?: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const usersWithHigherXp = await this.prisma.user.count({
      where: {
        totalXp: { gt: user.totalXp },
        role: role || user.role,
      },
    });

    const totalUsers = await this.prisma.user.count({
      where: { role: role || user.role },
    });

    return {
      rank: usersWithHigherXp + 1,
      totalUsers,
      percentile: totalUsers > 0 ? ((totalUsers - usersWithHigherXp) / totalUsers) * 100 : 0,
    };
  }

  // ✅ Send notification to user
  async sendNotificationToUser(userId: string, message: string, reportId?: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        message,
        ...(reportId && { reportId }), // Conditionally spread reportId if it exists
      },
    });
  }

  // ✅ Send notification to all users of a role
  async sendNotificationToRole(role: Role, message: string, reportId?: string) {
    const users = await this.prisma.user.findMany({
      where: { role },
      select: { id: true },
    });

    return this.prisma.notification.createMany({
      data: users.map(user => ({
        userId: user.id,
        message,
        ...(reportId && { reportId }),
      })),
    });
  }

  // ✅ Get user activity summary
  async getUserActivitySummary(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [reports, posts] = await Promise.all([
      this.prisma.civicReport.findMany({
        where: {
          createdById: userId,
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.communityPost.findMany({
        where: {
          authorId: userId,
          createdAt: { gte: startDate },
        },
      }),
    ]);

    return {
      period: `${days} days`,
      reports,
      posts,
      totalActivities: reports.length + posts.length,
    };
  }
}