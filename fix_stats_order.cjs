const fs = require('fs');
const file = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const selectionStatsRegex = /  const selectionStats = useMemo\(\(\) => \{[\s\S]*?return \{ cases, pos \};\n  \}, \[selectedCells, stats\.cityData\]\);\n\n/;

const match = content.match(selectionStatsRegex);
if (match) {
  content = content.replace(match[0], '');
  // Insert it after `const stats = useMemo(...)`
  const statsEndStr = '  }, [filteredRecords]);\n';
  const idx = content.indexOf(statsEndStr);
  if (idx !== -1) {
    const insertIdx = idx + statsEndStr.length;
    content = content.substring(0, insertIdx) + '\n' + match[0] + content.substring(insertIdx);
  }
  fs.writeFileSync(file, content);
  console.log('Fixed order.');
} else {
  console.log('Could not find selectionStats block.');
}
