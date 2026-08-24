const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

const stateAnchor = "const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());";
if (!content.includes("const [density, setDensity]")) {
    content = content.replace(stateAnchor, stateAnchor + `
  const [density, setDensity] = useState<'compact' | 'comfortable'>('compact');
  const thPad = density === 'comfortable' ? 'py-4' : 'py-2';
  const tdPad = density === 'comfortable' ? 'py-3' : 'py-1.5';
`);
}
fs.writeFileSync(file, content, 'utf8');
