const fs = require('fs');
const file = 'src/lib/db.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'passwordHash: string;\n  permissions',
  'passwordHash: string;\n  plainPassword?: string;\n  permissions'
);

fs.writeFileSync(file, content);
console.log('db.ts patched');
