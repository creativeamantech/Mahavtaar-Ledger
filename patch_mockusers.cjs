const fs = require('fs');
const file = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const MOCK_USERS: User\[\] = \[[\s\S]*?\];/;
const replacement = `const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'ADMIN', permissions: { views: DEFAULT_PERMISSIONS.ADMIN } },
];`;
content = content.replace(regex, replacement);

const initDbRegex = /if \(count === 0\) \{[\s\S]*?await db\.users\.bulkPut\(seedUsers\);\n        \}/;
const initDbReplacement = `if (count === 0) {
          const defaultPasswordHash = await hashPassword('Admin@123');
          const seedUsers = MOCK_USERS.map(u => ({ ...u, passwordHash: defaultPasswordHash, plainPassword: 'Admin@123' }));
          await db.users.bulkPut(seedUsers);
        } else {
          // Cleanup legacy mock users if they still exist
          const legacyIds = ['2', '3', '4'];
          for (const id of legacyIds) {
             const u = await db.users.get(id);
             if (u && ['ravi@company.com', 'aarti@company.com', 'viewer@company.com'].includes(u.email)) {
                 await db.users.delete(id);
             }
          }
        }`;
content = content.replace(initDbRegex, initDbReplacement);

fs.writeFileSync(file, content, 'utf8');
