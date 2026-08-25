const fs = require('fs');
let code = fs.readFileSync('src/components/layout/MobileHeader.tsx', 'utf8');

if (!code.includes('LogOut')) {
    code = code.replace(/UserCircle \}/, 'UserCircle, LogOut }');
}

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

const userBlock = `
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center hover:bg-muted p-0.5 rounded-full transition-colors border border-border/50 bg-card">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold shadow-sm">
                  {user?.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.role}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
`;

code = code.replace(/<button className="p-1 hover:bg-muted rounded-full transition-colors text-primary" title="User Profile">[\s\S]*?<\/button>/, userBlock);

// ensure logout is extracted
code = code.replace(/const \{ user \} = useAuth\(\);/, 'const { user, logout } = useAuth();');

fs.writeFileSync('src/components/layout/MobileHeader.tsx', code);
