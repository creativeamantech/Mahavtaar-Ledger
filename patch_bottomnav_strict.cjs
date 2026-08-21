const fs = require('fs');
const file = 'src/components/layout/BottomNav.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "{ label: 'Team Perf', icon: Activity, path: '/exec-team-perf', view: VIEWS.EXEC_DASHBOARD }",
  "{ label: 'Team Perf', icon: Activity, path: '/exec-team-perf', view: VIEWS.EXEC_TEAM_PERF }"
);

fs.writeFileSync(file, content);
console.log('BottomNav updated');
