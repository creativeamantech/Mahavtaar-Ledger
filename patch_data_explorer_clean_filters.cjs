const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove extraFilters state
content = content.replace(
  "  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({});\n",
  ""
);

// 2. Remove extraFilters logic
const filterLogic = `
      for (const [col, val] of Object.entries(extraFilters)) {
        if (!val) continue;
        const rowVal = String(r[col] !== undefined && r[col] !== null ? r[col] : '').toLowerCase();
        if (!rowVal.includes(val.toLowerCase())) return false;
      }
`;
if (content.includes(filterLogic)) {
  content = content.replace(filterLogic, "");
}

// 3. Revert Table Headers (Remove Popover)
const complexThRegex = /\{\(visibleExtraColumns \|\| \[\]\)\.map\(col => \([\s\S]*?<\/th>\n                \)\)}/;

const simpleTh = `{(visibleExtraColumns || []).map(col => (
                  <th key={col} id={\`th-\${col}\`} className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{col}</th>
                ))}`;

content = content.replace(complexThRegex, simpleTh);

// 4. Add Scroll & Jump To Logic
const scrollRefImport = `import { useState, useMemo, useEffect, useRef } from 'react';`;
content = content.replace(`import { useState, useMemo, useEffect } from 'react';`, scrollRefImport);

const stateInjection = `const [columnSearch, setColumnSearch] = useState('');`;
const jumpLogic = `
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollTable = (dir: 'left' | 'right') => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };
  const jumpToColumn = (colName: string) => {
    const el = document.getElementById(\`th-\${colName}\`);
    if (el && tableContainerRef.current) {
      // Get the relative position of the column within the container
      const containerLeft = tableContainerRef.current.getBoundingClientRect().left;
      const elLeft = el.getBoundingClientRect().left;
      const scrollOffset = elLeft - containerLeft - 100; // offset slightly
      tableContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };
`;
content = content.replace(stateInjection, stateInjection + jumpLogic);

// 5. Inject Scroll container ref
content = content.replace(
  `<div className="overflow-x-auto scrollbar-thin">`,
  `<div className="overflow-x-auto scrollbar-thin" ref={tableContainerRef}>`
);

// 6. Inject Left/Right and Jump buttons above table
const popoverTrigger = `<Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all bg-card border border-border hover:bg-muted text-muted-foreground">
                  <Columns className="h-4 w-4" /> Columns
                </button>
              </PopoverTrigger>`;

const newPopoverTrigger = `
            <div className="flex items-center gap-1 mr-2">
              <button onClick={() => scrollTable('left')} className="h-8 px-2 border border-border rounded bg-muted/50 hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors" title="Scroll Left">
                <span className="text-[14px] leading-none">←</span>
              </button>
              <button onClick={() => scrollTable('right')} className="h-8 px-2 border border-border rounded bg-muted/50 hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors" title="Scroll Right">
                <span className="text-[14px] leading-none">→</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2 mr-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Jump</span>
              <select onChange={(e) => { if(e.target.value) jumpToColumn(e.target.value); e.target.value = ""; }} className="h-8 w-32 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
                <option value="">Select Col...</option>
                {(visibleExtraColumns || []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all bg-card border border-border hover:bg-muted text-muted-foreground">
                  <Columns className="h-4 w-4" /> Columns
                </button>
              </PopoverTrigger>`;

content = content.replace(popoverTrigger, newPopoverTrigger);

fs.writeFileSync(file, content);
