import { prisma } from "./prisma";

export interface LogAuditParams {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  meta?: Record<string, any>;
  ip?: string;
}

export async function logAudit(params: LogAuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        meta: params.meta ?? undefined,
        ip: params.ip || null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
