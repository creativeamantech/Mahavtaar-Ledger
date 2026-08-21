const fs = require('fs');
const file = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "addUser: (u: Omit<User, 'id'>) => Promise<void>;",
  "addUser: (u: Omit<User, 'id'> & { password?: string }) => Promise<void>;"
);

const addUserOld = `  const addUser = async (u: Omit<User, 'id'>) => {
    const id = crypto.randomUUID();
    const passwordHash = await hashPassword('Admin@123'); // Default password for new users
    const newUser = { ...u, id };
    
    setUsers(prev => [...prev, newUser]);
    await db.users.put({ ...newUser, passwordHash });
  };`;

const addUserNew = `  const addUser = async (u: Omit<User, 'id'> & { password?: string }) => {
    const id = crypto.randomUUID();
    const pw = u.password || 'Admin@123';
    const passwordHash = await hashPassword(pw);
    const { password, ...userWithoutPassword } = u;
    const newUser = { ...userWithoutPassword, id };
    
    setUsers(prev => [...prev, newUser]);
    await db.users.put({ ...newUser, passwordHash });
  };`;

if(content.includes("await hashPassword('Admin@123')")) {
  content = content.replace(addUserOld, addUserNew);
} else {
  // If exact string doesn't match, try a regex replace
  content = content.replace(/  const addUser = async \(u: Omit<User, 'id'>\) => \{[\s\S]*?await db.users.put\(\{ \.\.\.newUser, passwordHash \}\);\n  \};/, addUserNew);
}

fs.writeFileSync(file, content);
console.log('AuthContext patched');
