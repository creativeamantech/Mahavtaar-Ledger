const fs = require('fs');

const files = [
  'src/pages/CityPivot.tsx',
  'src/pages/ExecTeamPerf.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/BandExplorer.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Find all sort options in the file
  const blockRegex = /<div className="flex items-center gap-2 px-2 py-1\.5 hover:bg-muted rounded transition-colors cursor-pointer" onClick=\{\(\) => \{\s*setSortConfig\(prev => \{\s*const exists = prev\.find\(s => s\.key === '([^']+)'\);\s*if \(exists\) return prev\.filter\(s => s\.key !== '[^']+'\);\s*return \[\.\.\.prev, \{ key: '[^']+', direction: 'asc' \}\];\s*\}\);\s*\}\}>\s*<Checkbox className="pointer-events-none" checked=\{\!\!sortConfig\.find\(s => s\.key === '[^']+'\)\} \/>\s*<span className="text-xs truncate flex-1">([^<]+)<\/span>\s*<\/div>/g;

  let options = [];
  let match;
  while ((match = blockRegex.exec(content)) !== null) {
    options.push({ key: match[1], label: match[2] });
  }

  if (options.length > 0) {
    // Generate the array definition
    const arrayDef = `const sortOptions = [\n${options.map(o => `  { key: '${o.key}', label: '${o.label}' }`).join(',\n')}\n];\n`;

    // Add state for sortSearch
    if (!content.includes('const [sortSearch')) {
      content = content.replace(/const \[sortConfig, setSortConfig\] = useState/, "const [sortSearch, setSortSearch] = useState('');\n  const [sortConfig, setSortConfig] = useState");
    }
    
    // Add Search to imports if it's not there
    if (!content.includes('Search')) {
        // If it imports from lucide-react, add Search
        content = content.replace(/import \{([^}]+)\} from 'lucide-react';/, (m, p1) => {
            if (!p1.includes('Search')) {
                return `import { Search, ${p1} } from 'lucide-react';`;
            }
            return m;
        });
    }

    // Define sortOptions outside the component or inside? Inside is fine, or right before return.
    // Let's put it right before the Popover.
    
    const popoverContentStart = '<h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sort By Column</h4>';
    const newPopoverContent = `
            ${popoverContentStart}
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
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto no-scrollbar pr-2">
              {[
${options.map(o => `                { key: '${o.key}', label: '${o.label}' }`).join(',\n')}
              ].filter(opt => opt.label.toLowerCase().includes(sortSearch.toLowerCase())).map(opt => (
                <div key={opt.key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded transition-colors cursor-pointer" onClick={() => {
                  setSortConfig(prev => {
                    const exists = prev.find(s => s.key === opt.key);
                    if (exists) return prev.filter(s => s.key !== opt.key);
                    return [...prev, { key: opt.key, direction: 'asc' }];
                  });
                }}>
                  <Checkbox className="pointer-events-none" checked={!!sortConfig.find(s => s.key === opt.key)} />
                  <span className="text-xs truncate flex-1">{opt.label}</span>
                </div>
              ))}
            </div>
`;

    // Replace the old popover content with new one
    // First, find the span of the old content.
    // We can use a regex that matches from `<h4` up to `</PopoverContent>`
    const blockToReplace = /<h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sort By Column<\/h4>\s*<div className="flex flex-col gap-1 max-h-64 overflow-y-auto no-scrollbar pr-2">[\s\S]*?<\/PopoverContent>/;
    
    content = content.replace(blockToReplace, newPopoverContent.trim() + '\n          </PopoverContent>');

    fs.writeFileSync(file, content, 'utf8');
  }
}
console.log('Fixed pivot search');
