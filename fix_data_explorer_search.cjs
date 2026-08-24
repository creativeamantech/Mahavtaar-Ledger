const fs = require('fs');
let content = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf8');

if (!content.includes('const [sortSearch')) {
  content = content.replace(/const \[sortConfig, setSortConfig\] = useState/, "const [sortSearch, setSortSearch] = useState('');\n  const [sortConfig, setSortConfig] = useState");
}

const oldSortHeader = /<h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sort By Column<\/h4>\s*<ScrollArea className="h-48 pr-2">\s*<div className="flex flex-col gap-1">\s*\{schema\.map\(col => \(/s;

const newSortHeader = `<h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sort By Column</h4>
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search columns..." 
                  className="w-full pl-6 pr-2 py-1 text-xs border border-border rounded bg-muted/20 outline-none focus:border-primary transition-colors"
                  value={sortSearch}
                  onChange={e => setSortSearch(e.target.value)}
                />
              </div>
              <ScrollArea className="h-48 pr-2">
                <div className="flex flex-col gap-1">
                  {schema.filter(col => col.toLowerCase().includes(sortSearch.toLowerCase())).map(col => (`;

content = content.replace(oldSortHeader, newSortHeader);

fs.writeFileSync('src/pages/DataExplorer.tsx', content, 'utf8');
console.log('Fixed DataExplorer sort search');
