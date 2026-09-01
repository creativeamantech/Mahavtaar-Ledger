const fs = require('fs');
let code = fs.readFileSync('src/pages/Assignment.tsx', 'utf-8');

code = code.replace(
  /const \{ records, bulkUpdateRecords, auditLog, globalBucket \} = useData\(\);/,
  `const { records, auditLog, globalBucket } = useDataState();\n  const { bulkUpdateRecords } = useDataDispatch();`
);

code = code.replace(
  /import \{ useData \} from '\.\.\/contexts\/DataContext';/,
  `import { useDataState, useDataDispatch } from '../contexts/DataContext';`
);

fs.writeFileSync('src/pages/Assignment.tsx', code);
