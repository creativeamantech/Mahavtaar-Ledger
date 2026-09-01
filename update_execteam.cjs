const fs = require('fs');

let code = fs.readFileSync('src/pages/ExecTeamPerf.tsx', 'utf-8');

if (!code.includes('useWorkerPivot')) {
  code = code.replace(
    /import \{ buildExecCityPivot \} from '\.\.\/lib\/pivots';/,
    "import { useWorkerPivot } from '../hooks/useWorkerPivot';"
  );

  const rawTeamDataPattern = /const rawTeamData = useMemo\(\(\) => \{\s*return buildExecCityPivot\(records, targets\);\s*\}, \[records, targets\]\);/;
  
  code = code.replace(
    rawTeamDataPattern,
    `const { data: rawTeamData, isCalculating: isPivoting } = useWorkerPivot<any[]>('buildExecCityPivot', records, targets, []);`
  );
  
  fs.writeFileSync('src/pages/ExecTeamPerf.tsx', code);
}
