const fs = require('fs');
let code = fs.readFileSync('src/pages/AuditLog.tsx', 'utf-8');

code = code.replace(
  /const \{ auditLog \} = useData\(\);/,
  `const { auditLog } = useDataState();`
);

code = code.replace(
  /import \{ useData \} from '\.\.\/contexts\/DataContext';/,
  `import { useDataState } from '../contexts/DataContext';`
);

fs.writeFileSync('src/pages/AuditLog.tsx', code);
