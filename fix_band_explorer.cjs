const fs = require('fs');

let content = fs.readFileSync('src/pages/BandExplorer.tsx', 'utf8');

// Strip out handleSort and SortIcon
content = content.replace(/const handleSort = \([\s\S]*?\};\n/s, '');
content = content.replace(/const SortIcon = \([\s\S]*?\};\n/s, '');

// Strip sortConfig state
content = content.replace(/const \[sortConfig, setSortConfig\] = useState<\{ key: string, direction: 'asc' \| 'desc' \}>\(\{ key: 'pos', direction: 'desc' \}\);\n/g, '');

// Remove onClick and cursor-pointer from th tags
content = content.replace(/ cursor-pointer hover:bg-muted\/80/g, '');
content = content.replace(/ onClick=\{\(\) => handleSort\('[^']+'\)\}/g, '');

// Remove <SortIcon columnKey="..." />
content = content.replace(/ <SortIcon columnKey="[^"]*" \/>/g, '');

// Remove sorting logic from bandData
const bandDataRegex = /const bandData = useMemo\(\(\) => \{.*?return arr;\n\s*\}, \[dataWithBands, minPos, maxPos, sortConfig\]\);/s;
if (content.match(bandDataRegex)) {
  content = content.replace(bandDataRegex, `const bandData = useMemo(() => {
    return dataWithBands.filter(r => r._posVal >= minPos && r._posVal <= maxPos);
  }, [dataWithBands, minPos, maxPos]);`);
} else {
  // alternative match if it differs
  content = content.replace(/const bandData = useMemo\(\(\) => \{[\s\S]*?return arr;\n\s*\}, \[[^\]]*\]\);/s, `const bandData = useMemo(() => {
    return dataWithBands.filter(r => r._posVal >= minPos && r._posVal <= maxPos);
  }, [dataWithBands, minPos, maxPos]);`);
}

// Remove ArrowUp, ArrowDown from lucide-react imports if not used
content = content.replace(/, ArrowUp, ArrowDown /g, ' ');

fs.writeFileSync('src/pages/BandExplorer.tsx', content, 'utf8');
console.log('Cleaned BandExplorer.tsx');
