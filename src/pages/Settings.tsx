import { AdvancedTargetsTab } from '../components/AdvancedTargetsTab';
import { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { DEFAULT_PERMISSIONS, VIEWS, Role, User } from '../constants/permissions';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { UserFormSheet } from '../components/settings/UserFormSheet';
import { db, backupSystemData, resetSystemData } from '../lib/db';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { cn } from '../lib/utils';
import { TargetInput } from '../components/TargetInput';


function SystemTab() {
  const [isResetting, setIsResetting] = useState(false);
  
  const handleBackup = async () => {
    try {
      await backupSystemData();
      toast.success('System backup downloaded successfully');
    } catch (e) {
      toast.error('Failed to create backup');
    }
  };

  const handleReset = async () => {
    if (!confirm("WARNING: This will delete ALL data (users, feedback, records). Type 'RESET' to confirm.")) return;
    try {
      setIsResetting(true);
      await resetSystemData();
      toast.success('System reset successfully');
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      toast.error('Failed to reset system');
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Data Backup</h3>
          <p className="text-sm text-muted-foreground mb-4">Download a complete JSON backup of all system data.</p>
          <Button onClick={handleBackup}>Download Full Backup</Button>
        </div>
      </div>
      <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">Permanently wipe all data from this device. This cannot be undone.</p>
          <Button variant="destructive" onClick={handleReset} disabled={isResetting}>
            {isResetting ? 'Resetting...' : 'Factory Reset System'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function UserManagementTab() {
  const { users, user: currentUser, addUser, updateUser, deleteUser } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  const [confirmWipe, setConfirmWipe] = useState(false);
  
  const handleWipeDatabase = async () => {
    if (!confirmWipe) {
      setConfirmWipe(true);
      toast('Click CONFIRM WIPE again to confirm deletion', { duration: 4000 });
      return;
    }
    try {
      await db.delete();
      localStorage.clear();
      window.location.reload();
    } catch (err) {
      toast.error("Failed to wipe database");
      console.error(err);
    }
  };

  const openCreate = () => {
    setEditingUser(undefined);
    setSheetOpen(true);
  };

  const openEdit = (u: any) => {
    setEditingUser(u);
    setSheetOpen(true);
  };

  const handleSave = async (data: Partial<User>) => {
    if (editingUser) {
        await updateUser(editingUser.id, { 
            name: data.name, 
            email: data.email, 
            role: data.role as Role, 
            permissions: DEFAULT_PERMISSIONS[data.role as Role],
            maintenanceMode: (data as any).maintenanceMode
        });
        toast.success('User updated successfully');
    } else {
        await addUser({
            name: data.name!,
            email: data.email!,
            role: data.role as Role,
            password: data.plainPassword!,
            permissions: DEFAULT_PERMISSIONS[data.role as Role]
        });
        toast.success('User created successfully');
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) return toast.error("Cannot delete yourself");
    if (!confirm('Delete user?')) return;
    await deleteUser(id);
    toast.success('User deleted');
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (val: Role) => <StatusBadge status={val} /> },
    { key: 'actions', label: 'Actions', render: (_: any, row: any) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}><Pencil className="w-4 h-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} disabled={row.id === currentUser?.id}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">User Management</h2>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleWipeDatabase}>
            {confirmWipe ? 'CONFIRM WIPE' : 'Wipe Database'}
          </Button>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add User</Button>
        </div>
      </div>
      <DataTable columns={columns} data={users} pageSize={20} />
      
      <UserFormSheet 
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        user={editingUser}
        onSave={handleSave}
      />
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'users' | 'targets' | 'system'>('users');
  const { user } = useAuth();
  
  if (user?.role !== 'ADMIN') {
    return (
      <AppLayout title="Settings">
        <div className="p-8 text-center text-muted-foreground">Access denied. Administrator privileges required.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage users, system configurations, and targets.</p>
        </div>

        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('targets')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'targets' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Global Targets
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'system' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            System
          </button>
        </div>

        <div className="pt-4">
          {activeTab === 'users' && <UserManagementTab />}
          {activeTab === 'targets' && <AdvancedTargetsTab />}
          {activeTab === 'system' && <SystemTab />}
        </div>
      </div>
    </AppLayout>
  );
}
