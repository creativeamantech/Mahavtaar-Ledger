const fs = require('fs');
let content = fs.readFileSync('src/components/layout/AppSidebar.tsx', 'utf8');

const navGroupsStr = `const NAV_GROUPS = [
  {
    title: 'Strategy & Monitoring',
    items: [
      { label: 'Admin Strategy', icon: Home, path: '/dashboard', view: VIEWS.DASHBOARD },
      { label: 'Executive Strategy', icon: TrendingUp, path: '/exec-dashboard', view: VIEWS.EXEC_DASHBOARD },
      { label: 'Live Tracking', icon: MonitorPlay, path: '/live-monitoring', view: VIEWS.LIVE_MONITORING },
    ]
  },
  {
    title: 'Execution Tracking',
    items: [
      { label: 'Team Performance', icon: Target, path: '/exec-team-perf', view: VIEWS.EXEC_TEAM_PERF },
      { label: 'Data Explorer', icon: Search, path: '/explorer', view: VIEWS.DATA_EXPLORER },
      { label: 'Band Analysis', icon: Waves, path: '/band-explorer', view: VIEWS.CITY_TEAM_MATRIX },
    ]
  },
  {
    title: 'Reconciliation',
    items: [
      { label: 'City Ledger', icon: Building2, path: '/city-pivot', view: VIEWS.CITY_PIVOT },
      { label: 'Team Ledger', icon: GitFork, path: '/team-pivot', view: VIEWS.TEAM_PIVOT },
      { label: 'Quality & Feedback', icon: MessageSquare, path: '/feedbacks', view: VIEWS.FEEDBACKS },
    ]
  },
  {
    title: 'System & Data',
    items: [
      { label: 'Data Ingestion', icon: Edit3, path: '/data-entry', view: VIEWS.DATA_ENTRY },
      { label: 'Case Assignment', icon: UserPlus, path: '/assignment', view: VIEWS.ASSIGNMENT },
      { label: 'Attendance Logs', icon: CalendarClock, path: '/attendance', view: VIEWS.ATTENDANCE },
      { label: 'Connectivity Hub', icon: Wifi, path: '/connectivity', view: VIEWS.CONNECTIVITY_HUB },
      { label: 'Settings', icon: Sliders, path: '/settings', view: VIEWS.SETTINGS },
      { label: 'Audit Logs', icon: History, path: '/audit', view: VIEWS.AUDIT_LOG },
    ]
  }
];`;

content = content.replace(/const NAV_GROUPS = \[[\s\S]*?\];/g, navGroupsStr);

// Remove the hardcoded Executive Hub role check
content = content.replace(/if \(group\.title === 'Executive Hub'.*?return null;/g, '');

fs.writeFileSync('src/components/layout/AppSidebar.tsx', content);
