const fs = require('fs');

let code = fs.readFileSync('src/pages/ExecDashboard.tsx', 'utf-8');

if (!code.includes('useWorkerPivot')) {
  code = code.replace(
    /import \{ buildExecCityPivot \} from '\.\.\/lib\/pivots';/,
    "import { useWorkerPivot } from '../hooks/useWorkerPivot';"
  );

  const rawCityDataPattern = /const rawCityData = useMemo\(\(\) => \{\s*return buildExecCityPivot\(records, targets\);\s*\}, \[records, targets\]\);/;
  
  code = code.replace(
    rawCityDataPattern,
    `const { data: rawCityData, isCalculating: isPivoting } = useWorkerPivot<any[]>('buildExecCityPivot', records, targets, []);`
  );
  
  fs.writeFileSync('src/pages/ExecDashboard.tsx', code);
}
