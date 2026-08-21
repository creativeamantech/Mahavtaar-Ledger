const fs = require('fs');

let permCode = fs.readFileSync('src/constants/permissions.ts', 'utf-8');

permCode = permCode.replace(
  `  AUDIT_LOG: 'audit_log',`,
  `  AUDIT_LOG: 'audit_log',\n  ASSIGNMENT: 'assignment',`
);

permCode = permCode.replace(
  `  MANAGER: [VIEWS.DATA_EXPLORER, VIEWS.DASHBOARD, VIEWS.DATA_ENTRY, VIEWS.CITY_PIVOT, VIEWS.TEAM_PIVOT, VIEWS.CITY_TEAM_MATRIX, VIEWS.AUDIT_LOG, VIEWS.EXPORT],`,
  `  MANAGER: [VIEWS.DATA_EXPLORER, VIEWS.DASHBOARD, VIEWS.DATA_ENTRY, VIEWS.CITY_PIVOT, VIEWS.TEAM_PIVOT, VIEWS.CITY_TEAM_MATRIX, VIEWS.AUDIT_LOG, VIEWS.EXPORT, VIEWS.ASSIGNMENT],`
);

fs.writeFileSync('src/constants/permissions.ts', permCode);
console.log("Added assignment view to permissions");
