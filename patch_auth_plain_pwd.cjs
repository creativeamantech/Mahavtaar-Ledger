const fs = require('fs');
const file = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const seedUsers = MOCK_USERS.map(u => ({ ...u, passwordHash: defaultPasswordHash }));",
  "const seedUsers = MOCK_USERS.map(u => ({ ...u, passwordHash: defaultPasswordHash, plainPassword: 'Admin@123' }));"
);

content = content.replace(
  "setUsers(dbUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role as Role, permissions: u.permissions })));",
  "setUsers(dbUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role as Role, permissions: u.permissions, plainPassword: u.plainPassword })));"
);

content = content.replace(
  "const safeUser: User = { id: found.id, name: found.name, email: found.email, role: found.role as Role, permissions: found.permissions };",
  "const safeUser: User = { id: found.id, name: found.name, email: found.email, role: found.role as Role, permissions: found.permissions, plainPassword: found.plainPassword };"
);

const oldAdd = `const newUser = { ...userWithoutPassword, id };
    
    setUsers(prev => [...prev, newUser]);
    await db.users.put({ ...newUser, passwordHash });`;

const newAdd = `const newUser = { ...userWithoutPassword, id, plainPassword: pw };
    
    setUsers(prev => [...prev, newUser]);
    await db.users.put({ ...newUser, passwordHash, plainPassword: pw });`;

content = content.replace(oldAdd, newAdd);

// we also need to allow changing the password in updateUser. Wait, the form might not pass password to updateUser?
// updateUser takes Partial<User>. Does it pass plainPassword? Let's check Settings.tsx handleSave.

fs.writeFileSync(file, content);
console.log('AuthContext patched for plain password');
