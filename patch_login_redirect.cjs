const fs = require('fs');
const file = 'src/pages/Login.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "await login(email, password);\n      navigate('/dashboard');",
  "const user = await login(email, password);\n      navigate(user.role === 'EXECUTIVE' ? '/exec-dashboard' : '/dashboard');"
);

fs.writeFileSync(file, content);
console.log('Login.tsx patched redirects');
