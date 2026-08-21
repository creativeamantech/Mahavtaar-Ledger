const fs = require('fs');
const file = 'src/components/layout/AppSidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

const navGroupsRegex = /const NAV_GROUPS = \[[\s\S]*?\];/m;

const newNavGroups = `const NAV_GROUPS = [
  {
    title: 'Admin Hub',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', view: VIEWS.DASHBOARD },
      { label: 'Data Entry', icon: FileText, path: '/data-entry', view: VIEWS.DATA_ENTRY },
      { label: 'Assignment', icon: Users, path: '/assignment', view: VIEWS.ASSIGNMENT },
    ]
  },
  {
    title: 'Executive Hub',
    items: [
      { label: 'Exec Dashboard', icon: LayoutDashboard, path: '/exec-dashboard', view: VIEWS.EXEC_DASHBOARD },
      { label: 'Team Perf', icon: Activity, path: '/exec-team-perf', view: VIEWS.EXEC_TEAM_PERF },
    ]
  },
  {
    title: 'Data & Reports',
    items: [
      { label: 'Data Explorer', icon: Database, path: '/explorer', view: VIEWS.DATA_EXPLORER },
      { label: 'City Pivot', icon: Building2, path: '/city-pivot', view: VIEWS.CITY_PIVOT },
      { label: 'Team Pivot', icon: Users, path: '/team-pivot', view: VIEWS.TEAM_PIVOT },
      { label: 'Band Analysis', icon: Activity, path: '/band-explorer', view: VIEWS.CITY_TEAM_MATRIX },
    ]
  },
  {
    title: 'Settings',
    items: [
      { label: 'System Config', icon: Settings, path: '/settings', view: VIEWS.SETTINGS },
      { label: 'Audit Log', icon: ClipboardList, path: '/audit', view: VIEWS.AUDIT_LOG },
    ]
  }
];`;

content = content.replace(navGroupsRegex, newNavGroups);
fs.writeFileSync(file, content);
console.log('AppSidebar groups updated');
