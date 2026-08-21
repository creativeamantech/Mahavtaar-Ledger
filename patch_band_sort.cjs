const fs = require('fs');
let code = fs.readFileSync('src/pages/BandExplorer.tsx', 'utf-8');

// Update imports
code = code.replace(
    "import { Download, Filter, MapPin, Database, DollarSign, Activity, FileText, Settings2 } from 'lucide-react';",
    "import { Download, Filter, MapPin, Database, DollarSign, Activity, FileText, Settings2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';"
);

// Add sort state right after maxPos
code = code.replace(
    "const [tempMax, setTempMax] = useState<string>('5000');",
    "const [tempMax, setTempMax] = useState<string>('5000');\n  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'}>({ key: 'city_count', direction: 'desc' });"
);

// Add sorting handler
code = code.replace(
    "const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {",
    `const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
        direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {`
);

// Replace the bandData useMemo with logic that computes city counts and sorts
const bandDataTarget = `const bandData = useMemo(() => {
     return dataWithBands.filter(r => r._posVal >= minPos && r._posVal <= maxPos).sort((a, b) => b._posVal - a._posVal);
  }, [dataWithBands, minPos, maxPos]);`;

const bandDataReplacement = `const bandData = useMemo(() => {
     const filtered = dataWithBands.filter(r => r._posVal >= minPos && r._posVal <= maxPos);
     
     const cityCounts: Record<string, number> = {};
     filtered.forEach(r => {
        cityCounts[r._city] = (cityCounts[r._city] || 0) + 1;
     });

     return filtered.sort((a, b) => {
         let comparison = 0;
         switch (sortConfig.key) {
            case 'city_count':
                comparison = cityCounts[a._city] - cityCounts[b._city];
                if (comparison === 0) comparison = a._posVal - b._posVal;
                break;
            case 'aggr':
                comparison = a._aggr.localeCompare(b._aggr);
                break;
            case 'name':
                comparison = a._name.localeCompare(b._name);
                break;
            case 'city':
                comparison = a._city.localeCompare(b._city);
                break;
            case 'pos':
                comparison = a._posVal - b._posVal;
                break;
            case 'emi':
                comparison = a._emiVal - b._emiVal;
                break;
         }
         return sortConfig.direction === 'asc' ? comparison : -comparison;
     });
  }, [dataWithBands, minPos, maxPos, sortConfig]);`;

code = code.replace(bandDataTarget, bandDataReplacement);

// Replace Table headers
const theadTarget = `<thead className="text-xs uppercase sticky top-0 z-20 shadow-md">
                        <tr className="bg-muted text-muted-foreground">
                            <th className="px-4 py-3 font-semibold border-b border-border bg-muted">Agreement Number</th>
                            <th className="px-4 py-3 font-semibold border-b border-border bg-muted">Customer Name</th>
                            <th className="px-4 py-3 font-semibold border-b border-border bg-muted">City</th>
                            <th className="px-4 py-3 font-semibold text-right border-b border-border bg-muted">Principal (POS)</th>
                            <th className="px-4 py-3 font-semibold text-right border-b border-border bg-muted">EMI</th>
                        </tr>
                    </thead>`;

const theadReplacement = `<thead className="text-xs uppercase sticky top-0 z-20 shadow-md">
                        <tr className="bg-muted text-muted-foreground">
                            <th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80" onClick={() => handleSort('aggr')}>
                                <div className="flex items-center">Agreement Number <SortIcon columnKey="aggr" /></div>
                            </th>
                            <th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80" onClick={() => handleSort('name')}>
                                <div className="flex items-center">Customer Name <SortIcon columnKey="name" /></div>
                            </th>
                            <th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80" onClick={() => handleSort('city_count')}>
                                <div className="flex items-center">City <SortIcon columnKey="city_count" /></div>
                            </th>
                            <th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80" onClick={() => handleSort('pos')}>
                                <div className="flex items-center justify-end">Principal (POS) <SortIcon columnKey="pos" /></div>
                            </th>
                            <th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80" onClick={() => handleSort('emi')}>
                                <div className="flex items-center justify-end">EMI <SortIcon columnKey="emi" /></div>
                            </th>
                        </tr>
                    </thead>`;

code = code.replace(theadTarget, theadReplacement);

fs.writeFileSync('src/pages/BandExplorer.tsx', code);
console.log("Patched BandExplorer sorting");
