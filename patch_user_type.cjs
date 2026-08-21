const fs = require('fs');
const file = 'src/constants/permissions.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'permissions: { views: string[] };\n}',
  'permissions: { views: string[] };\n  plainPassword?: string;\n}'
);

fs.writeFileSync(file, content);
console.log('permissions patched');
