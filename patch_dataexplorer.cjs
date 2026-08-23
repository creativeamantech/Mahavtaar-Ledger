const fs = require('fs');
let code = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf8');

// Replace setSelectedRecord calls with a function that routes
code = code.replace("const [selectedRecord, setSelectedRecord] = useState<any | null>(null);", 
  "const [selectedRecord, setSelectedRecord] = useState<any | null>(null);\n  const navigate = useNavigate();\n  const handleRowClick = (r: any) => {\n    sessionStorage.setItem('currentCaseList', JSON.stringify(filteredRecords.map(rec => rec.agreementid)));\n    navigate(`/customer/${r.agreementid}?${searchParams.toString()}`);\n  };"
);

// Replace the imports to include useNavigate
code = code.replace("import { useSearchParams } from 'react-router-dom';", "import { useSearchParams, useNavigate } from 'react-router-dom';");

// Replace onClick handlers
code = code.replace(/setSelectedRecord\(r\)/g, "handleRowClick(r)");

// Remove Sheet entirely since we don't need it. But it might be tricky to regex it out perfectly, 
// so let's just leave it there (it won't open since selectedRecord will never be set).
// Actually, I can just replace `open={!!selectedRecord}` with `open={false}` to be safe.
code = code.replace("open={!!selectedRecord}", "open={false}");

fs.writeFileSync('src/pages/DataExplorer.tsx', code);
