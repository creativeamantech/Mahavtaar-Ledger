const fs = require('fs');

const file = 'src/pages/BandExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update state definition
content = content.replace(
  /const \[sortConfig, setSortConfig\] = useState<\{key: string, direction: 'asc'\|'desc'\}>\(\{ key: 'city_count', direction: 'desc' \}\);/,
  "const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'}[]>([{ key: 'city', direction: 'asc' }]);"
);

// 2. Update the sorting logic block
const oldSortLogic = `     return filtered.sort((a, b) => {
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
     });`;

const newSortLogic = `     return filtered.sort((a, b) => {
         for (const sort of sortConfig) {
             let comparison = 0;
             switch (sort.key) {
                case 'city_count':
                    comparison = (cityCounts[a._city] || 0) - (cityCounts[b._city] || 0);
                    if (comparison === 0) comparison = a._posVal - b._posVal;
                    break;
                case 'aggr':
                    comparison = (a._aggr || '').localeCompare(b._aggr || '');
                    break;
                case 'name':
                    comparison = (a._name || '').localeCompare(b._name || '');
                    break;
                case 'city':
                    comparison = (a._city || '').localeCompare(b._city || '');
                    break;
                case 'pos':
                case '_posVal':
                    comparison = a._posVal - b._posVal;
                    break;
                case 'emi':
                case '_emiVal':
                    comparison = a._emiVal - b._emiVal;
                    break;
             }
             if (comparison !== 0) {
                 return sort.direction === 'asc' ? comparison : -comparison;
             }
         }
         return 0;
     });`;

if (content.includes("switch (sortConfig.key)")) {
  // It might not exactly match `oldSortLogic` due to spacing, so we can use a regex.
  const regex = /return filtered\.sort\(\(a, b\) => \{[\s\S]*?return sortConfig\.direction === 'asc' \? comparison : -comparison;\s*\}\);/;
  content = content.replace(regex, newSortLogic);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed sort logic');
