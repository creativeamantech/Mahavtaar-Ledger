const fs = require('fs');

let content = fs.readFileSync('src/pages/ExecTeamPerf.tsx', 'utf8');

if (!content.includes('useState')) {
  content = content.replace(/import React, \{ useMemo \} from 'react';/, "import React, { useState, useMemo } from 'react';");
}
content = content.replace(/import \{ Download  \} from 'lucide-react';/, "import { Download, Plus, Search, ArrowUp, ArrowDown, X } from 'lucide-react';");
if (!content.includes('Popover')) {
  content = content.replace(/import \{ Link/, "import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';\nimport { Link");
}

const stateToAdd = `
  const [filterText, setFilterText] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
`;
content = content.replace(/(const { user, isExecutive } = useAuth\(\);)/, `$1\n${stateToAdd}`);

const processedDataRegex = `  const cityData = useMemo\\(\\(\\) => buildExecCityPivot\\(filtered, targets\\), \\[filtered, targets\\]\\);`;
const newCityData = `  const rawCityData = useMemo(() => buildExecCityPivot(filtered, targets), [filtered, targets]);
  
  const cityData = useMemo(() => {
    let data = [...rawCityData];
    
    if (filterText) {
      data = data.filter(d => d.city.toLowerCase().includes(filterText.toLowerCase()));
    }
    
    if (sortKey) {
      data.sort((a: any, b: any) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        
        if (sortKey === 'pct') {
          valA = a.totalPOS ? a.paidPOS / a.totalPOS : 0;
          valB = b.totalPOS ? b.paidPOS / b.totalPOS : 0;
        }

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
    
    return data;
  }, [rawCityData, filterText, sortKey, sortDirection]);`;

content = content.replace(new RegExp(processedDataRegex), newCityData);

const sortOptions = [
  { key: 'city', label: 'City' },
  { key: 'collection', label: 'Collection' },
  { key: 'count', label: 'Total Count' },
  { key: 'paid', label: 'Paid Count' },
  { key: 'posPaidOnlyCount', label: 'POS Paid Only Count' },
  { key: 'totalPOS', label: 'Total POS' },
  { key: 'paidPOS', label: 'Paid POS' },
  { key: 'target', label: 'Needed POS' },
  { key: 'dailyRequiredPOS', label: 'Daily Required POS' },
  { key: 'posPaidOnlyPOS', label: 'POS Paid Only POS' },
  { key: 'pct', label: 'Total %' }
];

const toolbarUI = `
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter City..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            className="pl-8 pr-3 py-1.5 h-8 text-xs bg-card border border-border rounded-md outline-none focus:border-primary w-48"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex h-8 items-center gap-1.5 px-3 rounded-md border border-dashed border-border hover:bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider bg-card">
              <Plus className="h-3.5 w-3.5" /> Add Sort
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sort By Column</h4>
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto no-scrollbar pr-2">
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
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden rounded-xl">
`;

content = content.replace(/<\/div>\s*<div className="bg-card border rounded-xl shadow-sm overflow-hidden rounded-xl">/, toolbarUI);

fs.writeFileSync('src/pages/ExecTeamPerf.tsx', content, 'utf8');
console.log('Updated ExecTeamPerf');
