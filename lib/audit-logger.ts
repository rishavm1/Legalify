import { supabaseAdmin } from './db';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export class AuditLogger {
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      await supabaseAdmin.from('audit_logs').insert({
        user_id: entry.userId,
        action: entry.action,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        metadata: entry.metadata
      });
    } catch (error) {
      console.error('Audit log failed:', error);
    }
  }

  static async getUserLogs(userId: string, limit = 50) {
    const { data } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  }

  static async getRecentLogs(limit = 100) {
    const { data } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  }
}

// Helper function for easy logging
export async function logAudit(
  userId: string,
  action: string,
  req: any,
  metadata?: Record<string, any>
): Promise<void> {
  await AuditLogger.log({
    userId,
    action,
    ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    metadata
  });
}
