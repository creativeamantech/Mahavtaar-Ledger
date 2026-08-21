const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace handleSave to add validation
const handleSaveNew = `  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is mandatory');
    if (!form.role) return toast.error('Role is mandatory');
    if (!editId && !form.password) return toast.error('Password is mandatory for new users');
    
    if (editId) {
      await updateUser(editId, { name: form.name, email: form.email, role: form.role, permissions: { views: editPerms } });
      toast.success('User updated');
    } else {
      await addUser({ name: form.name, email: form.email, role: form.role, password: form.password, permissions: { views: editPerms } });
      toast.success('User created');
    }
    setShowModal(false);
  };`;

content = content.replace(/  const handleSave = async \(\) => \{[\s\S]*?setShowModal\(false\);\n  \};/, handleSaveNew);

// In the add user method from AuthContext, does it take password? Yes. Wait, the type of addUser in AuthContext:
// `addUser: (u: Omit<User, 'id'>) => Promise<void>;`
// But we pass password to it! Wait, `User` doesn't have password. The local AuthContext must be taking password separately or it takes `Omit<User, 'id'> & {password?: string}`? Let's check `AuthContext.tsx`.

fs.writeFileSync(file, content);
console.log('Settings patched');
