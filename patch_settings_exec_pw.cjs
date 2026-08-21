const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add Password column
const oldCols = `const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (v: string) => {`;
const newCols = `const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'plainPassword', label: 'Password', render: (v: string) => v || '••••••' },
    { key: 'role', label: 'Role', render: (v: string) => {`;
content = content.replace(oldCols, newCols);

// Fix EXECUTIVE permission checkboxes
const oldCheck = `{(form.role === 'MANAGER' || form.role === 'VIEWER') && (`;
const newCheck = `{(form.role === 'MANAGER' || form.role === 'VIEWER' || form.role === 'EXECUTIVE') && (`;
content = content.replace(oldCheck, newCheck);

fs.writeFileSync(file, content);
console.log('Settings patched for exec perms and pw col');
