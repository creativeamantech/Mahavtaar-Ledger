const fs = require('fs');
let code = fs.readFileSync('src/pages/Ledger.tsx', 'utf-8');

code = code.replace(
  /const \{ records, isLoading, globalBucket \} = useData\(\);/,
  `const { records, isLoading, globalBucket } = useDataState();`
);

code = code.replace(
  /import \{ useData \} from '\.\.\/contexts\/DataContext';/,
  `import { useDataState } from '../contexts/DataContext';`
);

fs.writeFileSync('src/pages/Ledger.tsx', code);
