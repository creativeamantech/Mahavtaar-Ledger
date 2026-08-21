const fs = require('fs');
const file = 'src/components/layout/BottomNav.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldTabs = `const BOTTOM_TABS = [
  { label: 'Home', icon: LayoutDashboard, path: '/dashboard', view: VIEWS.DASHBOARD },
  { label: 'Data', icon: FileText, path: '/data-entry', view: VIEWS.DATA_ENTRY },
  { label: 'City', icon: Building2, path: '/city-pivot', view: VIEWS.CITY_PIVOT },
  { label: 'Team', icon: Users, path: '/team-pivot', view: VIEWS.TEAM_PIVOT },
];`;

const newTabs = `const BOTTOM_TABS = [
  { label: 'Home', icon: LayoutDashboard, path: '/dashboard', view: VIEWS.DASHBOARD },
  { label: 'Exec Home', icon: LayoutDashboard, path: '/exec-dashboard', view: VIEWS.EXEC_DASHBOARD },
  { label: 'Data', icon: FileText, path: '/data-entry', view: VIEWS.DATA_ENTRY },
  { label: 'City', icon: Building2, path: '/city-pivot', view: VIEWS.CITY_PIVOT },
  { label: 'Team', icon: Users, path: '/team-pivot', view: VIEWS.TEAM_PIVOT },
];`;

content = content.replace(oldTabs, newTabs);
fs.writeFileSync(file, content);
console.log('BottomNav patched');
