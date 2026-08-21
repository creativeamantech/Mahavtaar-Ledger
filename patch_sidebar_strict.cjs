const fs = require('fs');
const file = 'src/components/layout/AppSidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "{ label: 'Team Overall Perf', icon: Activity, path: '/exec-team-perf', view: VIEWS.EXEC_DASHBOARD },",
  "{ label: 'Team Overall Perf', icon: Activity, path: '/exec-team-perf', view: VIEWS.EXEC_TEAM_PERF },"
);
content = content.replace(
  "{ label: 'Band Analysis', icon: Activity, path: '/band-explorer', view: VIEWS.DASHBOARD },",
  "{ label: 'Band Analysis', icon: Activity, path: '/band-explorer', view: VIEWS.CITY_TEAM_MATRIX },"
);

fs.writeFileSync(file, content);
console.log('AppSidebar updated');
