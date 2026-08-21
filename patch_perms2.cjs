const fs = require('fs');
const file = 'src/constants/permissions.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('EXEC_DASHBOARD')) {
  content = content.replace(
    "DASHBOARD: 'dashboard',",
    "DASHBOARD: 'dashboard',\n  EXEC_DASHBOARD: 'exec_dashboard',"
  );
  content = content.replace(
    "ADMIN: Object.values(VIEWS),",
    "ADMIN: Object.values(VIEWS),"
  );
  content = content.replace(
    "EXECUTIVE: [VIEWS.DATA_EXPLORER, VIEWS.DASHBOARD, VIEWS.DATA_ENTRY, VIEWS.CITY_PIVOT, VIEWS.TEAM_PIVOT, VIEWS.ASSIGNMENT],",
    "EXECUTIVE: [VIEWS.DATA_EXPLORER, VIEWS.EXEC_DASHBOARD, VIEWS.DASHBOARD, VIEWS.DATA_ENTRY, VIEWS.CITY_PIVOT, VIEWS.TEAM_PIVOT, VIEWS.ASSIGNMENT],"
  );
  
  fs.writeFileSync(file, content);
  console.log('Permissions patched');
}
