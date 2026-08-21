const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add states
const stateInjectionPoint = "const [visibleExtraColumns, setVisibleExtraColumns] = useState<string[]>(() => {";
const newStates = `
  const [columnSearch, setColumnSearch] = useState('');
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({});
  
  ` + stateInjectionPoint;

if (!content.includes('columnSearch')) {
  content = content.replace(stateInjectionPoint, newStates);
}

// Update filteredRecords to include extraFilters
const filterInjectionPoint = "if (!name.includes(q) && !id.includes(q)) return false;";
const newFilterLogic = filterInjectionPoint + `

      for (const [col, val] of Object.entries(extraFilters)) {
        if (!val) continue;
        const rowVal = String(r[col] !== undefined && r[col] !== null ? r[col] : '').toLowerCase();
        if (!rowVal.includes(val.toLowerCase())) return false;
      }
`;

if (!content.includes('extraFilters)) {')) {
  content = content.replace(filterInjectionPoint, newFilterLogic);
}

// Update Extra Columns popover to have a search input
const extraColsHeader = `<div className="flex items-center justify-between mb-3">`;
const newExtraColsHeader = `
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Search columns..." 
                      className="w-full pl-7 pr-2 py-1.5 text-xs border border-border rounded bg-muted/20 outline-none focus:border-primary transition-colors"
                      value={columnSearch}
                      onChange={e => setColumnSearch(e.target.value)}
                    />
                  </div>
                </div>
                ` + extraColsHeader;

if (!content.includes('placeholder="Search columns..."')) {
  content = content.replace(extraColsHeader, newExtraColsHeader);
}

// Update map to filter by search
const mapInjectionPoint = "allExtraKeys.map(col => (";
const newMapLogic = "allExtraKeys.filter(col => col.toLowerCase().includes(columnSearch.toLowerCase())).map(col => (";

if (!content.includes('allExtraKeys.filter(col => col.toLowerCase().includes(columnSearch.toLowerCase())).map')) {
  content = content.replace(mapInjectionPoint, newMapLogic);
}

// Add filter to headers
const thMapInjection = "{(visibleExtraColumns || []).map(col => (";
const newThMapLogic = `{(visibleExtraColumns || []).map(col => (
                  <th key={col} className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    <div className="flex items-center justify-between gap-1">
                      <span>{col}</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="focus:outline-none shrink-0" onClick={(e) => e.stopPropagation()}>
                            <Filter className={\`h-3 w-3 \${extraFilters[col] ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}\`} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2 shadow-lg" align="start">
                          <input 
                            type="text" 
                            className="w-full text-xs p-1.5 border border-border rounded bg-muted/20 outline-none focus:border-primary transition-colors"
                            placeholder={\`Filter \${col}...\`}
                            value={extraFilters[col] || ''}
                            onChange={e => setExtraFilters(p => ({ ...p, [col]: e.target.value }))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </th>
                ))}`;

if (!content.includes('Filter ${col}')) {
  const oldThMap = `{(visibleExtraColumns || []).map(col => (
                  <th key={col} className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{col}</th>
                ))}`;
  content = content.replace(oldThMap, newThMapLogic);
}

fs.writeFileSync(file, content);
