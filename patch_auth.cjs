const fs = require('fs');
const file = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = "setUsers(dbUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role as Role, permissions: u.permissions, plainPassword: u.plainPassword })));";

const replaceWith = `
        // Sync permissions for predefined roles so changes take effect
        const updatedUsers = [];
        for (const u of dbUsers) {
          if (['ADMIN', 'MANAGER', 'EXECUTIVE', 'VIEWER'].includes(u.role)) {
             u.permissions = { views: DEFAULT_PERMISSIONS[u.role] };
             await db.users.put(u);
          }
          updatedUsers.push({ id: u.id, name: u.name, email: u.email, role: u.role as Role, permissions: u.permissions, plainPassword: u.plainPassword });
        }
        setUsers(updatedUsers);
`;

content = content.replace(target, replaceWith);
fs.writeFileSync(file, content);
console.log('Auth updated');
