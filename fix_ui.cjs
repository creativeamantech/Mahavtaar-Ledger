const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
if (!content.includes('Rows')) {
    content = content.replace("LayoutTemplate } from 'lucide-react';", "LayoutTemplate, Rows } from 'lucide-react';");
}

// 2. States
const stateAnchor = "const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());";
if (!content.includes("const [density, setDensity]")) {
    content = content.replace(stateAnchor, stateAnchor + `
  const [density, setDensity] = useState<'compact' | 'comfortable'>('compact');
  const thPad = density === 'comfortable' ? 'py-4' : 'py-2';
  const tdPad = density === 'comfortable' ? 'py-3' : 'py-1.5';
  const [draggedCol, setDraggedCol] = useState<string | null>(null);
`);
}

// 3. Density Toggle Button
const popoverAnchor = `<Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all bg-card border border-border hover:bg-muted text-muted-foreground">
                  <Columns className="h-4 w-4" /> Columns
                </button>`;
const toggleUI = `<button 
              onClick={() => setDensity(d => d === 'compact' ? 'comfortable' : 'compact')}
              className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 border border-border rounded-lg text-xs font-bold hover:bg-muted transition-colors text-muted-foreground hover:text-foreground uppercase tracking-wider"
              title="Toggle Density"
            >
              <Rows className="h-4 w-4" /> 
              {density === 'compact' ? 'Compact' : 'Comfortable'}
            </button>
            `;
if (!content.includes("Toggle Density")) {
    content = content.replace(popoverAnchor, toggleUI + popoverAnchor);
}

// 4. Update Header Paddings (TH)
content = content.replace(/className="sticky left-0 top-0 z-30 bg-muted border-r border-border px-2 py-2 w-10"/g, 'className={`sticky left-0 top-0 z-30 bg-muted border-r border-border px-2 ${thPad} w-10`}');
content = content.replace(/className="sticky left-10 top-0 z-30 bg-muted border-r border-border px-2 py-2 font-sans text-\[10px\] uppercase tracking-wider text-muted-foreground font-bold"/g, 'className={`sticky left-10 top-0 z-30 bg-muted border-r border-border px-2 ${thPad} font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold`}');

// Standard TH replacement
content = content.replace(/<th className="px-2 py-2/g, '<th className={`px-2 ${thPad}');
// Need to close the backticks on standard TH replacements:
// e.g. <th className={`px-2 ${thPad} font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right`}>
content = content.replace(/font-bold text-right">/g, 'font-bold text-right`}>');
content = content.replace(/font-bold">/g, 'font-bold`}>');
// Note: we need to be careful with the ones we just replaced above, but they are uniquely targeted. Wait, the above replaces might conflict if I just blanket replace `font-bold">`.
