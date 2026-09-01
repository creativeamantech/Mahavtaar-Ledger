const fs = require('fs');
let code = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf-8');

code = code.replace(
  /const \{ records, schema, isLoading, bulkUpdateRecords \} = useData\(\);/,
  `const { records, schema, isLoading } = useDataState();\n  const { bulkUpdateRecords } = useDataDispatch();`
);

code = code.replace(
  /import \{ useData \} from '\.\.\/contexts\/DataContext';/,
  `import { useDataState, useDataDispatch } from '../contexts/DataContext';`
);

fs.writeFileSync('src/pages/DataExplorer.tsx', code);
