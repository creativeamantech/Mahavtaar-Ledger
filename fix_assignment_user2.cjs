const fs = require('fs');
let code = fs.readFileSync('src/pages/Assignment.tsx', 'utf-8');

if (!code.includes("import { useAuth }")) {
  code = code.replace(
    "import { useData } from '../contexts/DataContext';",
    "import { useData } from '../contexts/DataContext';\nimport { useAuth } from '../contexts/AuthContext';"
  );
  
  code = code.replace(
    "const { records, bulkUpdateRecords, globalBucket } = useData();",
    "const { records, bulkUpdateRecords, globalBucket } = useData();\n  const { user } = useAuth();"
  );
  
  code = code.replace(
    "bulkUpdateRecords(updates, 'System');",
    "bulkUpdateRecords(updates, user?.name || 'System');"
  );
  
  fs.writeFileSync('src/pages/Assignment.tsx', code);
  console.log("Applied Auth fixes to Assignment");
} else {
  console.log("Auth already fixed in Assignment");
}
