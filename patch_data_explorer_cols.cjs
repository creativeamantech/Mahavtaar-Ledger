const fs = require('fs');

let code = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { Filter, Database, Search, Download } from 'lucide-react';",
  "import { Filter, Database, Search, Download, Columns } from 'lucide-react';\nimport { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';\nimport { Checkbox } from '../components/ui/checkbox';"
);

// Define STANDARD_KEYS
const standardKeysDef = `
const STANDARD_KEYS = [
  'agreementid', 'agreement_no',
  'customer_name', 'CUSTOMERNAME', 'Customer Name', 'CUSTOMER_NAME', 'customername',
  'bom_bkt',
  'state', 'State',
  'city', 'City',
  'executive_name', 'Executive Name',
  'principal_outstanding',
  'emi_amt',
  'ecs',
  'provisional_dac', 'dac',
  'mainPaid', 'emiCount'
];
`;

code = code.replace(
  "export default function DataExplorer() {",
  standardKeysDef + "\nexport default function DataExplorer() {"
);

// Add hooks
const hooksDef = `
  const allExtraKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const r of records) {
      for (const k of Object.keys(r)) {
        if (!STANDARD_KEYS.includes(k) && !k.startsWith('_')) {
          keys.add(k);
        }
      }
    }
    return Array.from(keys).sort();
  }, [records]);

  const [visibleExtraColumns, setVisibleExtraColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem('dataExplorerExtraColumns');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleExtraColumn = (col: string) => {
    setVisibleExtraColumns(prev => {
      const next = prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col];
      localStorage.setItem('dataExplorerExtraColumns', JSON.stringify(next));
      return next;
    });
  };
`;

code = code.replace(
  "const [page, setPage] = useState(1);\n  const itemsPerPage = 500;",
  "const [page, setPage] = useState(1);\n  const itemsPerPage = 500;\n" + hooksDef
);

// Add Columns Button in the header
const columnsBtn = `
          <div className="flex items-center ml-2 border-l border-border pl-4 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all bg-card border border-border hover:bg-muted text-muted-foreground">
                  <Columns className="h-4 w-4" /> Columns
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Extra Columns</h4>
                <ScrollArea className="h-64 pr-4">
                  <div className="space-y-2">
                    {allExtraKeys.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic">No extra columns found</div>
                    ) : (
                      allExtraKeys.map(col => (
                        <div key={col} className="flex items-center gap-2">
                          <Checkbox 
                            id={\`col-\${col}\`} 
                            checked={visibleExtraColumns.includes(col)}
                            onCheckedChange={() => toggleExtraColumn(col)}
                          />
                          <label htmlFor={\`col-\${col}\`} className="text-xs font-medium leading-none cursor-pointer select-none">
                            {col}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
`;

code = code.replace(
  '<div className="flex items-center ml-2 border-l border-border pl-4">',
  columnsBtn
);

// Add Headers
const extraHeaders = `
                {visibleExtraColumns.map(col => (
                  <th key={col} className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{col}</th>
                ))}
`;

code = code.replace(
  '<th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">Status</th>\n              </tr>',
  '<th className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">Status</th>\n' + extraHeaders + '              </tr>'
);

// Add Cells
const extraCells = `
                      {visibleExtraColumns.map(col => (
                        <td key={col} className="px-2 py-1.5 text-muted-foreground font-sans text-xs">{r[col] || '-'}</td>
                      ))}
`;

code = code.replace(
  '</span>Paid</span> : <span className="text-muted-foreground flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>Unpaid</span>}</td>\n                    </tr>',
  '</span>Paid</span> : <span className="text-muted-foreground flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>Unpaid</span>}</td>\n' + extraCells + '                    </tr>'
);


// Add Side Panel Information
const extraSidePanel = `
              {selectedRecord && (
                <div className="mt-6">
                  <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span className="h-px flex-1 bg-border"></span>
                    Additional Information
                    <span className="h-px flex-1 bg-border"></span>
                  </h4>
                  <div className="grid gap-2 text-sm">
                    {Object.keys(selectedRecord)
                      .filter(k => !STANDARD_KEYS.includes(k) && !k.startsWith('_'))
                      .map(k => (
                        <div key={k} className="flex justify-between p-2 rounded hover:bg-muted/30 transition-colors">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="font-sans font-medium text-foreground">{selectedRecord[k] || '-'}</span>
                        </div>
                      ))
                    }
                    {Object.keys(selectedRecord).filter(k => !STANDARD_KEYS.includes(k) && !k.startsWith('_')).length === 0 && (
                      <div className="text-center p-4 text-xs italic text-muted-foreground">No extra data available</div>
                    )}
                  </div>
                </div>
              )}
`;

code = code.replace(
  '</div>\n          </ScrollArea>\n        </SheetContent>',
  '</div>\n' + extraSidePanel + '          </ScrollArea>\n        </SheetContent>'
);

fs.writeFileSync('src/pages/DataExplorer.tsx', code);
