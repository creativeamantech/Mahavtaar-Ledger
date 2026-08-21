const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const originalModal = `<div className="space-y-3">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="h-8 w-full rounded-md border border-border bg-input px-3 font-sans text-xs outline-none focus:border-primary" />
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="h-8 w-full rounded-md border border-border bg-input px-3 font-sans text-xs outline-none focus:border-primary" />
              <select value={form.role} onChange={e => { const role = e.target.value as Role; setForm(f => ({ ...f, role })); setEditPerms(DEFAULT_PERMISSIONS[role]); }} className="h-8 w-full rounded-md border border-border bg-input px-3 font-sans text-xs outline-none focus:border-primary">
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="EXECUTIVE">Executive</option>
                <option value="VIEWER">Viewer</option>
              </select>
              {!editId && <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" type="password" className="h-8 w-full rounded-md border border-border bg-input px-3 font-sans text-xs outline-none focus:border-primary" />}`;

const newModal = `<div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1 block">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="h-8 w-full rounded-md border border-border bg-input px-3 font-sans text-xs outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1 block">Email (Optional)</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="h-8 w-full rounded-md border border-border bg-input px-3 font-sans text-xs outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1 block">Role *</label>
                <select value={form.role} onChange={e => { const role = e.target.value as Role; setForm(f => ({ ...f, role })); setEditPerms(DEFAULT_PERMISSIONS[role]); }} className="h-8 w-full rounded-md border border-border bg-input px-3 font-sans text-xs outline-none focus:border-primary">
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="EXECUTIVE">Executive</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              {!editId && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1 block">Password *</label>
                  <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" type="password" className="h-8 w-full rounded-md border border-border bg-input px-3 font-sans text-xs outline-none focus:border-primary" />
                </div>
              )}`;

content = content.replace(originalModal, newModal);
fs.writeFileSync(file, content);
console.log('Settings Modal patched');
