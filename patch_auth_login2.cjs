const fs = require('fs');
const file = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldLogin = `  const login = async (identifier: string, password: string): Promise<User> => {
    const found = await db.users.filter(u => u.name === identifier || (!!u.email && u.email === identifier)).first();`;

const newLogin = `  const login = async (identifier: string, password: string): Promise<User> => {
    const searchStr = identifier.trim().toLowerCase();
    const found = await db.users.filter(u => u.name.trim().toLowerCase() === searchStr || (!!u.email && u.email.trim().toLowerCase() === searchStr)).first();`;

content = content.replace(oldLogin, newLogin);

fs.writeFileSync(file, content);
console.log('AuthContext Login Patched Again');
