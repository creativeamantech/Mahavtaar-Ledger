const fs = require('fs');
let code = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf-8');

// We need to add `q` to search states.
const searchStateLine = `  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');`;

// insert it around line 31
const stateInsertionPoint = `  const [selectedPaidStatus, setSelectedPaidStatus] = useState<string>(searchParams.get('paid') || 'All'); // All, Paid, Unpaid`;

code = code.replace(stateInsertionPoint, stateInsertionPoint + '\n' + searchStateLine);

// Update useEffect to track searchQuery
code = code.replace(
  `    if (selectedPaidStatus !== 'All') params.set('paid', selectedPaidStatus);`,
  `    if (selectedPaidStatus !== 'All') params.set('paid', selectedPaidStatus);\n    if (searchQuery) params.set('q', searchQuery);`
);

code = code.replace(
  `  }, [selectedState, selectedCity, selectedBucket, selectedExecutive, selectedPaidStatus, setSearchParams]);`,
  `  }, [selectedState, selectedCity, selectedBucket, selectedExecutive, selectedPaidStatus, searchQuery, setSearchParams]);`
);

// Update filteredRecords to filter by searchQuery
const filterLogicPoint = `      if (selectedPaidStatus === 'Unpaid' && isPaid) return false;`;
const newFilterLogic = `      if (selectedPaidStatus === 'Unpaid' && isPaid) return false;
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = String(r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || '').toLowerCase();
        const id = String(r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '').toLowerCase();
        if (!name.includes(q) && !id.includes(q)) return false;
      }`;

code = code.replace(filterLogicPoint, newFilterLogic);

code = code.replace(
  `  }, [baseRecords, selectedState, selectedCity, selectedBucket, selectedExecutive, selectedPaidStatus]);`,
  `  }, [baseRecords, selectedState, selectedCity, selectedBucket, selectedExecutive, selectedPaidStatus, searchQuery]);`
);

// Add search input in the UI next to Clear Secondary button
const clearSecondaryPoint = `<button 
              onClick={() => {
                setSelectedState('All'); setSelectedCity('All'); setSelectedExecutive('All'); setSelectedPaidStatus('All');
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground font-semibold uppercase tracking-wider underline underline-offset-2 transition-colors"
            >
              Clear Secondary
            </button>`;

const searchInputUI = `
          <div className="flex items-center ml-2 border-l border-border pl-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search Name or Aggr No..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 w-48 rounded bg-muted/50 border border-border pl-8 pr-2 text-xs font-medium outline-none focus:border-primary"
              />
            </div>
          </div>
`;

code = code.replace(clearSecondaryPoint, clearSecondaryPoint + searchInputUI);

code = code.replace(
  `setSelectedPaidStatus('All');`,
  `setSelectedPaidStatus('All'); setSearchQuery('');`
);

// Need to import Search if not already imported? It is already imported.
fs.writeFileSync('src/pages/DataExplorer.tsx', code);
console.log('DataExplorer search updated');
