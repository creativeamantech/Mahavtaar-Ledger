const fs = require('fs');
let code = fs.readFileSync('src/pages/TeamPivot.tsx', 'utf-8');

code = code.replace(
  "import { useData } from '../contexts/DataContext';",
  "import { useData } from '../contexts/DataContext';\nimport { useNavigate } from 'react-router-dom';"
);

code = code.replace(
  "const { records, targets, isLoading } = useData();",
  "const navigate = useNavigate();\n  const { records, targets, isLoading, globalBucket } = useData();\n  const navigateToExplorer = (filters: { executive?: string, bucket?: string, paid?: string }) => {\n    const params = new URLSearchParams();\n    if (globalBucket !== 'ALL') params.set('bucket', globalBucket);\n    if (filters.bucket) params.set('bucket', filters.bucket);\n    if (filters.executive) params.set('exec', filters.executive);\n    if (filters.paid) params.set('paid', filters.paid);\n    navigate(`/explorer?${params.toString()}`);\n  };"
);

fs.writeFileSync('src/pages/TeamPivot.tsx', code);
console.log("Patched TeamPivot basics");
