const fs = require('fs');
let content = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf8');

const sortState = `
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc'|'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(''); // clear
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
`;

if (!content.includes('const [sortKey, setSortKey]')) {
  content = content.replace(/(const \[page, setPage\] = useState\(1\);)/, `$1\n${sortState}`);
}

const sortLogic = `
  const sortedRecords = useMemo(() => {
    if (!sortKey) return filteredRecords;
    return [...filteredRecords].sort((a: any, b: any) => {
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
  }, [filteredRecords, sortKey, sortDirection]);

  const paginatedRecords = useMemo(() => {
    return sortedRecords.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [sortedRecords, page, itemsPerPage]);
`;

content = content.replace(/const paginatedRecords = useMemo\(\(\) => \{[\s\S]*?\}, \[filteredRecords, page\]\);/, sortLogic.trim());

// Standard keys replacements manually using normal regex replacement
content = content.replace(/<th className="([^"]*)">(Agreement|Customer|State|City|Bucket|Executive|POS|EMI|ECS|DAC)<\/th>/g, 
  (match, p1, p2) => {
    let key = '';
    if (p2 === 'Agreement') key = 'agreementid';
    else if (p2 === 'Customer') key = 'customer_name';
    else if (p2 === 'State') key = 'state';
    else if (p2 === 'City') key = 'city';
    else if (p2 === 'Bucket') key = 'bom_bkt';
    else if (p2 === 'Executive') key = 'executive_name';
    else if (p2 === 'POS') key = 'principal_outstanding';
    else if (p2 === 'EMI') key = 'emi';
    else if (p2 === 'ECS') key = 'ecs';
    else if (p2 === 'DAC') key = 'dac';
    return `<th className="${p1} cursor-pointer hover:bg-muted transition-colors" onClick={() => handleSort('${key}')}>${p2}<ArrowUpDown className="inline h-3 w-3 ml-1 opacity-40 hover:opacity-100" /></th>`;
});

content = content.replace(
  /<th key=\{col\} id=\{`th-\$\{col\}`\} className="([^"]*)">\{col\}<\/th>/g, 
  '<th key={col} id={`th-${col}`} className="$1 cursor-pointer hover:bg-muted transition-colors" onClick={() => handleSort(col)}>{col}<ArrowUpDown className="inline h-3 w-3 ml-1 opacity-40 hover:opacity-100" /></th>'
);

if (!content.includes('ArrowUpDown')) {
  content = content.replace(/import \{ (.*?) \} from 'lucide-react';/, 'import { $1, ArrowUpDown } from \'lucide-react\';');
}

fs.writeFileSync('src/pages/DataExplorer.tsx', content, 'utf8');
console.log('Fixed DataExplorer');
