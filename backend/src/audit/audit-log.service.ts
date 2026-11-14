import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogOptions {
  userId?: string | null;
  action: string;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAction(options: AuditLogOptions): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: options.userId ?? null,
          action: options.action,
          details: (options.details as any) ?? undefined,
          ipAddress: options.ipAddress ?? null,
          userAgent: options.userAgent ? options.userAgent.slice(0, 255) : null,
        },
      });
    } catch (error) {
      // Never fail the primary user request if audit log recording fails
      this.logger.error(
        `Failed to record audit log for action "${options.action}":`,
        error,
      );
    }
  }

  async getRecentLogs(limit = 100, userId?: string) {
    return this.prisma.auditLog.findMany({
      where: userId ? { userId } : undefined,
      take: Math.min(limit, 500),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
