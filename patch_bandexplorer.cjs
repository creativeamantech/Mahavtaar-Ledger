const fs = require('fs');
let code = fs.readFileSync('src/pages/BandExplorer.tsx', 'utf-8');

code = code.replace(
  "import { useData } from '../contexts/DataContext';",
  "import { useData } from '../contexts/DataContext';\nimport { useNavigate } from 'react-router-dom';"
);

code = code.replace(
  "export default function BandExplorer() {",
  "export default function BandExplorer() {\n  const navigate = useNavigate();"
);

// Replace the row onClick
code = code.replace(
  /onClick=\{\(\) => \{ window\.location\.href = `\/explorer\?q=\$\{encodeURIComponent\(row\._aggr\)\}`; \}\}/g,
  "onClick={() => { navigate(`/explorer?q=${encodeURIComponent(row._aggr)}`); }}"
);

// Replace the tfoot onClick
code = code.replace(
  /onClick=\{\(\) => window\.location\.href = `\/explorer\?minPos=\$\{minPos\}&maxPos=\$\{maxPos\}\$\{globalBucket !== 'ALL' \? `&bucket=\$\{globalBucket\}` : ''\}`\}/g,
  "onClick={() => { navigate(`/explorer?minPos=${minPos}&maxPos=${maxPos}${globalBucket !== 'ALL' ? `&bucket=${globalBucket}` : ''}`); }}"
);

fs.writeFileSync('src/pages/BandExplorer.tsx', code);
console.log("Patched BandExplorer");
