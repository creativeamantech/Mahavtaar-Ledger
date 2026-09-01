const fs = require('fs');
let code = fs.readFileSync('src/pages/BandExplorer.tsx', 'utf-8');

code = code.replace(
  /const \{ records, globalBucket, isLoading \} = useData\(\);/,
  `const { records, globalBucket, isLoading } = useDataState();`
);

code = code.replace(
  /import \{ useData \} from '\.\.\/contexts\/DataContext';/,
  `import { useDataState } from '../contexts/DataContext';`
);

fs.writeFileSync('src/pages/BandExplorer.tsx', code);
