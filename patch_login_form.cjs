const fs = require('fs');
const file = 'src/pages/Login.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>',
  '<label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground">Name or Email</label>'
);

content = content.replace(
  'type="email"',
  'type="text"'
);

content = content.replace(
  'placeholder="admin@company.com"',
  'placeholder="e.g. Aarti Sharma"'
);

fs.writeFileSync(file, content);
console.log('Login form patched');
