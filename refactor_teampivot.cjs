const fs = require('fs');
let code = fs.readFileSync('src/pages/TeamPivot.tsx', 'utf-8');

code = code.replace(
  /const \{ records, targets, isLoading, globalBucket \} = useData\(\);/,
  `const { records, targets, isLoading, globalBucket } = useDataState();`
);

code = code.replace(
  /import \{ useData \} from '\.\.\/contexts\/DataContext';/,
  `import { useDataState } from '../contexts/DataContext';`
);

fs.writeFileSync('src/pages/TeamPivot.tsx', code);
