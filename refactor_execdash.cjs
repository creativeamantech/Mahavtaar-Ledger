const fs = require('fs');
let code = fs.readFileSync('src/pages/ExecDashboard.tsx', 'utf-8');

code = code.replace(
  /const \{ records, isLoading, globalBucket, targets \} = useData\(\);/,
  `const { records, isLoading, globalBucket, targets } = useDataState();`
);

code = code.replace(
  /import \{ useData \} from '\.\.\/contexts\/DataContext';/,
  `import { useDataState } from '../contexts/DataContext';`
);

fs.writeFileSync('src/pages/ExecDashboard.tsx', code);
