const fs = require('fs');
const file = 'src/components/layout/BottomNav.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "{ label: 'Band Analysis', icon: Activity, path: '/band-explorer', view: VIEWS.DASHBOARD },",
  "{ label: 'Band Analysis', icon: Activity, path: '/band-explorer', view: VIEWS.CITY_TEAM_MATRIX },"
);

fs.writeFileSync(file, content);
console.log('BottomNav band updated');
