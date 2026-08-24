const fs = require('fs');

let content = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf8');

// Replace sort state
content = content.replace(/const \[sortKey, setSortKey\] = useState<string>\(''\);\n\s*const \[sortDirection, setSortDirection\] = useState<'asc' \| 'desc'>\('asc'\);/, `const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}[]>([]);`);

// Sort Logic
const multiSortLogic = `
  const sortedRecords = useMemo(() => {
    if (sortConfig.length === 0) return filteredRecords;
    return [...filteredRecords].sort((a: any, b: any) => {
      for (const sort of sortConfig) {
        let valA = a[sort.key];
        let valB = b[sort.key];
        
        const numA = Number(valA);
        const numB = Number(valB);
        let comp = 0;
        if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
          comp = sort.direction === 'asc' ? numA - numB : numB - numA;
        } else {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
          comp = sort.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (comp !== 0) return comp;
      }
      return 0;
    });
  }, [filteredRecords, sortConfig]);
`;
content = content.replace(/const sortedRecords = useMemo\(\(\) => \{.*?\}, \[filteredRecords, sortKey, sortDirection\]\);/s, multiSortLogic.trim());

// Multi-sort popover
const oldSortPopover = /<button \s*key=\{col\}\s*onClick=\{\(\) => \{ setSortKey\(col\); setSortDirection\('asc'\); \}\}\s*className="text-left px-2 py-1\.5 text-xs rounded hover:bg-muted transition-colors truncate"\s*>\s*\{col\}\s*<\/button>/s;
const newSortPopover = `
                    <div key={col} className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded transition-colors cursor-pointer" onClick={() => {
                      setSortConfig(prev => {
                        const exists = prev.find(s => s.key === col);
                        if (exists) return prev.filter(s => s.key !== col);
                        return [...prev, { key: col, direction: 'asc' }];
                      });
                    }}>
                      <Checkbox checked={!!sortConfig.find(s => s.key === col)} />
                      <span className="text-xs truncate flex-1">{col}</span>
                    </div>
`;
content = content.replace(oldSortPopover, newSortPopover.trim());

// Active sort pills
const oldSortPills = /\{sortKey && \([\s\S]*?<\/div>\s*\)\}/s;
const newSortPills = `
          {sortConfig.map(sort => (
            <div key={sort.key} className="flex items-center gap-1 bg-muted/50 border border-border px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-foreground">
              Sort: {sort.key}
              <button onClick={() => setSortConfig(prev => prev.map(s => s.key === sort.key ? { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' } : s))} className="ml-1 text-muted-foreground hover:text-foreground">
                {sort.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              </button>
              <button onClick={() => setSortConfig(prev => prev.filter(s => s.key !== sort.key))} className="ml-1 text-muted-foreground hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
`;
content = content.replace(oldSortPills, newSortPills.trim());

// Multi-filter popover
const oldFilterPopover = /<button\s*key=\{col\}\s*onClick=\{\(\) => \{\s*setActiveCustomFilters\(prev => \[\.\.\.prev, col\]\);\s*setCustomFilterSearch\(''\);\s*\}\}\s*className="text-left px-2 py-2 text-xs rounded hover:bg-muted transition-colors truncate shrink-0 text-foreground"\s*>\s*\{col\}\s*<\/button>/s;
const newFilterPopover = `
                    <div key={col} className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded transition-colors cursor-pointer" onClick={() => {
                      if (activeCustomFilters.includes(col)) {
                        setActiveCustomFilters(prev => prev.filter(c => c !== col));
                        const newVals = { ...customFilterValues };
                        delete newVals[col];
                        setCustomFilterValues(newVals);
                      } else {
                        setActiveCustomFilters(prev => [...prev, col]);
                      }
                    }}>
                      <Checkbox checked={activeCustomFilters.includes(col)} />
                      <span className="text-xs truncate flex-1">{col}</span>
                    </div>
`;
content = content.replace(oldFilterPopover, newFilterPopover.trim());

// Because activeCustomFilters already renders inputs sequentially, we don't need to change how the active filters render.
// However, the original map in the popover filters out active filters!
// \`.filter(col => !STANDARD_KEYS.includes(col) && !col.startsWith('_') && !activeCustomFilters.includes(col))\`
// We need to REMOVE \`&& !activeCustomFilters.includes(col)\` so they stay in the list as checked checkboxes!
content = content.replace(/&& !activeCustomFilters\.includes\(col\)/, '');

fs.writeFileSync('src/pages/DataExplorer.tsx', content, 'utf8');
console.log('Updated DataExplorer multi-sort and multi-filter');
