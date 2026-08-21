const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state for column filter search strings
if (!content.includes('columnFilterSearches')) {
  content = content.replace(
    "const [customFilterSearch, setCustomFilterSearch] = useState('');",
    "const [customFilterSearch, setCustomFilterSearch] = useState('');\n  const [columnFilterSearches, setColumnFilterSearches] = useState<Record<string, string>>({});"
  );
}

// 2. Fix the filtering logic inside useMemo
const targetString = `      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = String(r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || '').toLowerCase();
        const id = String(r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '').toLowerCase();
        if (!name.includes(q) && !id.includes(q)) return false;

      }
      
      return true;`;

const newFilterLogic = `      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = String(r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || '').toLowerCase();
        const id = String(r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '').toLowerCase();
        if (!name.includes(q) && !id.includes(q)) return false;

      }
      
      for (const col of activeCustomFilters) {
        const filterVal = customFilterValues[col];
        if (filterVal && filterVal !== 'All') {
          if (String(r[col] || '').trim().toUpperCase() !== filterVal.trim().toUpperCase()) {
            return false;
          }
        }
      }
      
      return true;`;

if (content.includes(targetString)) {
  content = content.replace(targetString, newFilterLogic);
  console.log("Replaced filter logic successfully.");
} else {
  console.log("Could not find the target string for filter logic.");
}

// 3. Replace the <select> with a Popover for custom filters
const oldSelectUI = `                <select 
                  value={customFilterValues[col] || 'All'} 
                  onChange={e => setCustomFilterValues(prev => ({...prev, [col]: e.target.value}))} 
                  className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary max-w-[150px]"
                >
                  <option value="All">All</option>
                  {options.map(s => <option key={s} value={s}>{s}</option>)}
                </select>`;

const newPopoverUI = `                <Popover>
                  <PopoverTrigger asChild>
                    <button className="h-8 min-w-[120px] max-w-[150px] justify-between px-2 flex items-center text-xs font-medium bg-muted/50 border border-border rounded hover:bg-muted transition-colors truncate">
                      <span className="truncate">{customFilterValues[col] || 'All'}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="start">
                    <div className="relative mb-2">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Search values..." 
                        className="w-full pl-6 pr-2 py-1.5 text-xs border border-border rounded bg-muted/20 outline-none focus:border-primary transition-colors"
                        value={columnFilterSearches[col] || ''}
                        onChange={e => setColumnFilterSearches(prev => ({...prev, [col]: e.target.value}))}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto no-scrollbar flex flex-col gap-1">
                      <button 
                        onClick={() => setCustomFilterValues(prev => ({...prev, [col]: 'All'}))}
                        className={\`text-left px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors \${!customFilterValues[col] || customFilterValues[col] === 'All' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'}\`}
                      >
                        All
                      </button>
                      {options.filter(o => o.toLowerCase().includes((columnFilterSearches[col] || '').toLowerCase())).map(o => (
                        <button 
                          key={o}
                          onClick={() => setCustomFilterValues(prev => ({...prev, [col]: o}))}
                          className={\`text-left px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors truncate \${customFilterValues[col] === o ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'}\`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>`;

if (content.includes(oldSelectUI)) {
  content = content.replace(oldSelectUI, newPopoverUI);
  console.log("Replaced select UI with Popover UI successfully.");
} else {
  console.log("Could not find old select UI.");
}

fs.writeFileSync(file, content);
