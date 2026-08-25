const fs = require('fs');
let code = fs.readFileSync('src/components/layout/DesktopHeader.tsx', 'utf8');

// Add LogOut to lucide-react imports if it's not there
if (!code.includes('LogOut')) {
    code = code.replace(/UserCircle, Menu } from 'lucide-react';/, 'UserCircle, Menu, LogOut } from "lucide-react";');
}

// Add dropdown imports
if (!code.includes('DropdownMenu')) {
    code = code.replace(/import \{ ThemeToggle \} from '\.\.\/ThemeToggle';/, `import { ThemeToggle } from '../ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";`);
}

// Replace the Link to profile with the dropdown
const userBlock = `
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-muted p-1 pr-2 rounded-full transition-colors ml-1 border border-border/50">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold shadow-sm">
                  {user?.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col items-start min-w-0 max-w-[120px]">
                  <span className="text-xs font-bold text-foreground truncate w-full text-left">{user?.name}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider truncate w-full text-left">{user?.role}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={useAuth().logout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
`;

code = code.replace(/<Link to="\/profile"[^>]*>[\s\S]*?<\/Link>/, userBlock);

// Note: I need to extract `const { logout } = useAuth();` in the component.
code = code.replace(/const \{ user \} = useAuth\(\);/, 'const { user, logout } = useAuth();');
// Since useAuth().logout in JSX might be a bad hook call if not destructured, let's fix the dropdown to use logout.
code = code.replace(/onClick=\{useAuth\(\)\.logout\}/g, 'onClick={logout}');

fs.writeFileSync('src/components/layout/DesktopHeader.tsx', code);
