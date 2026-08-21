const fs = require('fs');
const file = 'src/constants/permissions.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "EXECUTIVE: [VIEWS.DATA_EXPLORER, VIEWS.EXEC_DASHBOARD, VIEWS.DASHBOARD, VIEWS.DATA_ENTRY, VIEWS.CITY_PIVOT, VIEWS.TEAM_PIVOT, VIEWS.ASSIGNMENT],",
  "EXECUTIVE: [VIEWS.DATA_EXPLORER, VIEWS.EXEC_DASHBOARD, VIEWS.DATA_ENTRY, VIEWS.CITY_PIVOT, VIEWS.TEAM_PIVOT, VIEWS.ASSIGNMENT],"
);

fs.writeFileSync(file, content);
console.log('Permissions patched to remove main dashboard from executive default');
