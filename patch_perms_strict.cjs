const fs = require('fs');
const file = 'src/constants/permissions.ts';

const newContent = `export const VIEWS = {
  DATA_EXPLORER: 'data_explorer',
  DASHBOARD: 'dashboard',
  EXEC_DASHBOARD: 'exec_dashboard',
  EXEC_TEAM_PERF: 'exec_team_perf',
  DATA_ENTRY: 'data_entry',
  CITY_PIVOT: 'city_pivot',
  TEAM_PIVOT: 'team_pivot',
  CITY_TEAM_MATRIX: 'city_team_matrix',
  SETTINGS: 'settings',
  AUDIT_LOG: 'audit_log',
  ASSIGNMENT: 'assignment',
  EXPORT: 'export',
} as const;

export type ViewKey = typeof VIEWS[keyof typeof VIEWS];

export const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [VIEWS.DASHBOARD, VIEWS.DATA_EXPLORER, VIEWS.DATA_ENTRY, VIEWS.CITY_PIVOT, VIEWS.TEAM_PIVOT, VIEWS.CITY_TEAM_MATRIX, VIEWS.ASSIGNMENT, VIEWS.SETTINGS, VIEWS.AUDIT_LOG, VIEWS.EXPORT],
  MANAGER: [VIEWS.DASHBOARD, VIEWS.DATA_EXPLORER, VIEWS.DATA_ENTRY, VIEWS.CITY_PIVOT, VIEWS.TEAM_PIVOT, VIEWS.CITY_TEAM_MATRIX, VIEWS.ASSIGNMENT, VIEWS.EXPORT],
  EXECUTIVE: [VIEWS.EXEC_DASHBOARD, VIEWS.EXEC_TEAM_PERF, VIEWS.DATA_EXPLORER],
  VIEWER: [VIEWS.DASHBOARD, VIEWS.DATA_EXPLORER, VIEWS.CITY_PIVOT],
};

export type Role = 'ADMIN' | 'MANAGER' | 'EXECUTIVE' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: Role;
  permissions: { views: string[] };
  plainPassword?: string;
}
`;

fs.writeFileSync(file, newContent);
console.log('permissions.ts updated');
