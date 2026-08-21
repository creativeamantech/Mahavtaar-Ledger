const fs = require('fs');
const file = 'src/constants/permissions.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'ADMIN: Object.values(VIEWS),',
  'ADMIN: Object.values(VIEWS).filter(v => v !== VIEWS.EXEC_DASHBOARD),'
);

fs.writeFileSync(file, content);
console.log('Permissions updated');
