const fs = require('fs');

let content = fs.readFileSync('src/pages/BandExplorer.tsx', 'utf8');

// Insert sort state
if (!content.includes('const [sortKey, setSortKey]')) {
  content = content.replace(/(const \[tempMax, setTempMax\] = useState\(String\(maxPos\)\);)/, `$1\n  const [sortKey, setSortKey] = useState<string>('');\n  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');`);
}

// Ensure icons are imported
content = content.replace(/import \{ Download, (.*?) \} from 'lucide-react';/, "import { Download, Plus, X, ArrowUp, ArrowDown, $1 } from 'lucide-react';");
if (!content.includes('Popover')) {
  content = content.replace(/import \{ Link/, "import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';\nimport { Link");
}

const bandDataRegex = `const bandData = useMemo\\(\\(\\) => \\{\\s*return dataWithBands\\.filter\\(r => r\\._posVal >= minPos && r\\._posVal <= maxPos\\);\\s*\\}, \\[dataWithBands, minPos, maxPos\\]\\);`;
const newBandData = `const bandData = useMemo(() => {
    let filtered = dataWithBands.filter(r => r._posVal >= minPos && r._posVal <= maxPos);
    
    if (sortKey) {
      filtered.sort((a: any, b: any) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    
    return filtered;
  }, [dataWithBands, minPos, maxPos, sortKey, sortDirection]);`;

content = content.replace(new RegExp(bandDataRegex), newBandData);

const sortOptions = [
  { key: 'aggr', label: 'Agreement Number' },
  { key: 'name', label: 'Customer Name' },
  { key: 'city', label: 'City' },
  { key: '_posVal', label: 'Principal (POS)' },
  { key: '_emiVal', label: 'EMI' }
];

const toolbarUI = `
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex h-8 items-center gap-1.5 px-3 rounded-md border border-dashed border-border hover:bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider bg-card">
                    <Plus className="h-3.5 w-3.5" /> Add Sort
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="start">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sort By Column</h4>
                  <div className="flex flex-col gap-1">
                    ${sortOptions.map(opt => `
                      <button 
                        onClick={() => { setSortKey('${opt.key}'); setSortDirection('asc'); }}
                        className="text-left px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors"
                      >
                        ${opt.label}
                      </button>
                    `).join('')}
                  </div>
                </PopoverContent>
              </Popover>
              {sortKey && (
                <div className="flex h-8 items-center gap-1.5 bg-muted/50 border border-border px-2 rounded-md text-xs font-bold uppercase tracking-wider text-foreground">
                  Sort: ${sortOptions.map(opt => `{sortKey === '${opt.key}' ? '${opt.label}' : ''}`).join('')}
                  <button onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')} className="ml-1 text-muted-foreground hover:text-foreground">
                    {sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => setSortKey('')} className="ml-1 text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
        </div>
`;

content = content.replace(/<\/div>\s*<div className="text-xs text-muted-foreground font-medium bg-muted\/30 px-3 py-1\.5 rounded-md border border-border\/50">\s*Total Filter Applied: <span className="text-primary font-bold">\{fmtCur\(minPos\)\} to \{fmtCur\(maxPos\)\}<\/span> \{globalBucket !== 'ALL' \? \`\| Bucket: \$\{globalBucket\}\` : ''\}\s*<\/div>\s*<\/div>/, '</div>' + toolbarUI);

fs.writeFileSync('src/pages/BandExplorer.tsx', content, 'utf8');
console.log('Updated BandExplorer');
