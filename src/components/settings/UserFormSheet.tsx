import React, { useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role, User } from "@/constants/permissions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface UserFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User;
    onSave: (data: Partial<User>) => void;
}

export function UserFormSheet({ open, onOpenChange, user, onSave }: UserFormSheetProps) {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [role, setRole] = React.useState<Role>("VIEWER");
    const [maintenanceMode, setMaintenanceMode] = React.useState(false);
    const [password, setPassword] = React.useState("");

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setRole(user.role || "VIEWER");
            setMaintenanceMode((user as any).maintenanceMode || false);
            setPassword("");
        } else {
            setName("");
            setEmail("");
            setRole("VIEWER");
            setMaintenanceMode(false);
            setPassword("");
        }
    }, [user, open]);
    
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSave({
            name,
            email,
            role,
            plainPassword: password || undefined,
            ...(maintenanceMode ? { maintenanceMode } : { maintenanceMode: false })
        });
        onOpenChange(false);
    }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{user ? "Edit User" : "Create User"}</SheetTitle>
          <SheetDescription>
            {user ? "Update the user's details below." : "Enter the details for the new user."}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
            </div>

            <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="name@example.com" />
            </div>

            <div className="space-y-2">
                <Label>{user ? 'Change Password (optional)' : 'Password'}</Label>
                <Input value={password} onChange={e => setPassword(e.target.value)} type="password" required={!user} />
            </div>

            <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v: Role) => setRole(v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                        <SelectItem value="MANAGER">MANAGER</SelectItem>
                        <SelectItem value="EXECUTIVE">EXECUTIVE</SelectItem>
                        <SelectItem value="VIEWER">VIEWER</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label className="text-base">Maintenance Mode</Label>
                    <div className="text-[0.8rem] text-muted-foreground">Put this user account into maintenance mode.</div>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>

            <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit">Save Changes</Button>
            </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
