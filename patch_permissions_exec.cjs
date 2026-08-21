const fs = require('fs');
const file = 'src/constants/permissions.ts';
let content = fs.readFileSync(file, 'utf8');

const oldExec = `EXECUTIVE: [VIEWS.DATA_EXPLORER, VIEWS.DASHBOARD, VIEWS.DATA_ENTRY],`;
const newExec = `EXECUTIVE: [VIEWS.DATA_EXPLORER, VIEWS.DASHBOARD, VIEWS.DATA_ENTRY, VIEWS.CITY_PIVOT, VIEWS.TEAM_PIVOT, VIEWS.ASSIGNMENT],`;

content = content.replace(oldExec, newExec);

fs.writeFileSync(file, content);
console.log('permissions exec defaults patched');
