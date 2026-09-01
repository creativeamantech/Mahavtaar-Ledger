const fs = require('fs');
let code = fs.readFileSync('src/pages/CustomerDetail.tsx', 'utf-8');

code = code.replace(
  /const \{ records \} = useData\(\);/,
  `const { records } = useDataState();`
);

code = code.replace(
  /import \{ useData \} from '\.\.\/contexts\/DataContext';/,
  `import { useDataState } from '../contexts/DataContext';`
);

fs.writeFileSync('src/pages/CustomerDetail.tsx', code);
