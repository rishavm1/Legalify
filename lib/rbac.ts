export type UserRole = 'free' | 'pro' | 'admin';
export type UserPlan = 'free' | 'pro' | 'enterprise';

export interface Permission {
  resource: string;
  action: string;
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  free: [
    { resource: 'chat', action: 'create' },
    { resource: 'document', action: 'draft' },
    { resource: 'upload', action: 'create' }
  ],
  pro: [
    { resource: 'chat', action: 'create' },
    { resource: 'document', action: 'draft' },
    { resource: 'upload', action: 'create' },
    { resource: 'research', action: 'conduct' },
    { resource: 'memo', action: 'generate' },
    { resource: 'review', action: 'advanced' },
    { resource: 'argument', action: 'generate' }
  ],
  admin: [
    { resource: '*', action: '*' }
  ]
};

const PLAN_LIMITS: Record<UserPlan, { chatsPerDay: number; uploadsPerDay: number; memosPerMonth: number }> = {
  free: { chatsPerDay: 20, uploadsPerDay: 5, memosPerMonth: 3 },
  pro: { chatsPerDay: 200, uploadsPerDay: 50, memosPerMonth: 50 },
  enterprise: { chatsPerDay: -1, uploadsPerDay: -1, memosPerMonth: -1 }
};

export class RBAC {
  static hasPermission(role: UserRole, resource: string, action: string): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.some(p => 
      (p.resource === '*' || p.resource === resource) && 
      (p.action === '*' || p.action === action)
    );
  }

  static getPlanLimits(plan: UserPlan) {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  }

  static canAccessFeature(role: UserRole, feature: string): boolean {
    const featureMap: Record<string, { resource: string; action: string }> = {
      'legal-research': { resource: 'research', action: 'conduct' },
      'memo-generator': { resource: 'memo', action: 'generate' },
      'advanced-review': { resource: 'review', action: 'advanced' },
      'argument-generator': { resource: 'argument', action: 'generate' }
    };

    const permission = featureMap[feature];
    if (!permission) return true;

    return this.hasPermission(role, permission.resource, permission.action);
  }

  static getUpgradeMessage(feature: string): string {
    return `🔒 This feature requires a Pro plan. Upgrade to access ${feature} and more!`;
  }
}
