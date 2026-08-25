const fs = require('fs');
let code = fs.readFileSync('src/components/layout/AppSidebar.tsx', 'utf8');

// Replace dark colors with theme variables
code = code.replace(/bg-\[#0b0f19\]/g, 'bg-card/95 backdrop-blur-md');
code = code.replace(/bg-\[#070a10\]/g, 'bg-muted/30');
code = code.replace(/border-white\/5/g, 'border-border');
code = code.replace(/border-white\/10/g, 'border-border');
code = code.replace(/text-slate-300/g, 'text-foreground');
code = code.replace(/text-white/g, 'text-foreground');
code = code.replace(/text-slate-200/g, 'text-foreground');
code = code.replace(/text-slate-400/g, 'text-muted-foreground');
code = code.replace(/text-slate-500/g, 'text-muted-foreground/70');
code = code.replace(/hover:bg-white\/5/g, 'hover:bg-muted');
code = code.replace(/hover:text-slate-300/g, 'hover:text-foreground');
code = code.replace(/hover:text-slate-200/g, 'hover:text-foreground');
code = code.replace(/bg-white\/5/g, 'bg-card');
code = code.replace(/bg-slate-800/g, 'bg-popover');
code = code.replace(/border-slate-700/g, 'border-border');

// also remove explicit 'text-white' on the Mahavtaar h1
code = code.replace(/text-white leading-tight/g, 'text-foreground leading-tight');

fs.writeFileSync('src/components/layout/AppSidebar.tsx', code);
