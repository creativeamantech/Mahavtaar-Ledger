const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add state for custom filters
const stateInject = `
  const [activeCustomFilters, setActiveCustomFilters] = useState<string[]>([]);
  const [customFilterValues, setCustomFilterValues] = useState<Record<string, string>>({});
  const [customFilterSearch, setCustomFilterSearch] = useState('');
`;

if (!content.includes('activeCustomFilters')) {
  content = content.replace(
    "const [maxPos, setMaxPos] = useState<string>(searchParams.get('maxPos') || '');",
    "const [maxPos, setMaxPos] = useState<string>(searchParams.get('maxPos') || '');" + stateInject
  );
}

// Ensure Plus icon is imported
if (!content.includes('Plus,')) {
  content = content.replace("Columns } from 'lucide-react';", "Columns, Plus, X } from 'lucide-react';");
}

// Modify the filteredRecords logic to include customFilterValues
const oldFilterReturnTrue = `            if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = String(r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || '').toLowerCase();
        const id = String(r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '').toLowerCase();
        if (!name.includes(q) && !id.includes(q)) return false;
      }
      
      return true;
    });`;

const newFilterReturnTrue = `            if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = String(r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || '').toLowerCase();
        const id = String(r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '').toLowerCase();
        if (!name.includes(q) && !id.includes(q)) return false;
      }
      
      for (const col of activeCustomFilters) {
        const filterVal = customFilterValues[col];
        if (filterVal && filterVal !== 'All') {
          if (String(r[col] || '').trim().toUpperCase() !== filterVal) {
            return false;
          }
        }
      }
      
      return true;
    });`;

if (content.includes("if (!name.includes(q) && !id.includes(q)) return false;")) {
  content = content.replace(oldFilterReturnTrue, newFilterReturnTrue);
}

// Add dependency to filteredRecords useMemo
content = content.replace(
  "}, [baseRecords, selectedState, selectedCity, selectedBucket, selectedExecutive, selectedPaidStatus, searchQuery, minPos, maxPos]);",
  "}, [baseRecords, selectedState, selectedCity, selectedBucket, selectedExecutive, selectedPaidStatus, searchQuery, minPos, maxPos, activeCustomFilters, customFilterValues]);"
);

// Add clear logic
content = content.replace(
  "setSelectedState('All'); setSelectedCity('All'); setSelectedExecutive('All'); setSelectedPaidStatus('All'); setSearchQuery('');",
  "setSelectedState('All'); setSelectedCity('All'); setSelectedExecutive('All'); setSelectedPaidStatus('All'); setSearchQuery(''); setCustomFilterValues({}); setActiveCustomFilters([]);"
);

// Add UI for Custom Filters
const customFiltersUI = `
          {activeCustomFilters.map(col => {
            // Compute unique options for this column
            const options = Array.from(new Set(baseRecords.map((r: any) => String(r[col] || 'UNKNOWN').trim().toUpperCase()).filter(Boolean))).sort();
            return (
              <div key={col} className="flex items-center gap-2 shrink-0 bg-muted/30 px-2 py-1 rounded border border-border">
                <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                  {col}
                  <button onClick={() => {
                    setActiveCustomFilters(prev => prev.filter(c => c !== col));
                    setCustomFilterValues(prev => { const n = {...prev}; delete n[col]; return n; });
                  }} className="hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
                </span>
                <select 
                  value={customFilterValues[col] || 'All'} 
                  onChange={e => setCustomFilterValues(prev => ({...prev, [col]: e.target.value}))} 
                  className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary max-w-[150px]"
                >
                  <option value="All">All</option>
                  {options.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            );
          })}
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all border border-dashed border-border hover:bg-muted text-muted-foreground">
                <Plus className="h-3 w-3" /> Add Filter
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Select Column</h4>
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search columns..." 
                  className="w-full pl-6 pr-2 py-1 text-xs border border-border rounded bg-muted/20 outline-none focus:border-primary transition-colors"
                  value={customFilterSearch}
                  onChange={e => setCustomFilterSearch(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto pr-1 no-scrollbar flex flex-col gap-1">
                {schema
                  .filter(col => !STANDARD_KEYS.includes(col) && !col.startsWith('_') && !activeCustomFilters.includes(col))
                  .filter(col => col.toLowerCase().includes(customFilterSearch.toLowerCase()))
                  .map(col => (
                    <button
                      key={col}
                      onClick={() => {
                        setActiveCustomFilters(prev => [...prev, col]);
                        setCustomFilterSearch('');
                      }}
                      className="text-left px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors truncate"
                    >
                      {col}
                    </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
`;

const insertTarget = `<div className="flex items-center gap-2 shrink-0 lg:ml-auto">`;
if (content.includes(insertTarget)) {
  content = content.replace(insertTarget, customFiltersUI + '\\n          ' + insertTarget);
}

fs.writeFileSync(file, content);
