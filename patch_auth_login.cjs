const fs = require('fs');
const file = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "login: (email: string, password: string) => Promise<User>;",
  "login: (identifier: string, password: string) => Promise<User>;"
);

const oldLogin = `  const login = async (email: string, password: string): Promise<User> => {
    const found = await db.users.where('email').equals(email).first();`;

const newLogin = `  const login = async (identifier: string, password: string): Promise<User> => {
    const found = await db.users.filter(u => u.name === identifier || (!!u.email && u.email === identifier)).first();`;

content = content.replace(oldLogin, newLogin);

fs.writeFileSync(file, content);
console.log('AuthContext Login Patched');
