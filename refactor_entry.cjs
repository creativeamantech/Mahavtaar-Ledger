const fs = require('fs');
let code = fs.readFileSync('src/pages/DataEntry.tsx', 'utf-8');

code = code.replace(
  /const \{ records, loadMainFile, loadPaidFile, loadAdditionalFile, loadCorrectedFile, updateRecord, uploadHistory \} = useData\(\);/,
  `const { records, uploadHistory } = useDataState();\n  const { loadMainFile, loadPaidFile, loadAdditionalFile, loadCorrectedFile, updateRecord } = useDataDispatch();`
);

code = code.replace(
  /import \{ useData \} from '\.\.\/contexts\/DataContext';/,
  `import { useDataState, useDataDispatch } from '../contexts/DataContext';`
);

fs.writeFileSync('src/pages/DataEntry.tsx', code);
