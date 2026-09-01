const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  /const \{ records, targets, globalBucket, isLoading \} = useData\(\);/,
  `const { records, targets, globalBucket, isLoading } = useDataState();`
);

code = code.replace(
  /import \{ useData \} from '\.\.\/contexts\/DataContext';/,
  `import { useDataState } from '../contexts/DataContext';`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
