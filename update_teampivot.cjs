const fs = require('fs');

let code = fs.readFileSync('src/pages/TeamPivot.tsx', 'utf-8');

if (!code.includes('useWorkerPivot')) {
  code = code.replace(
    /import \{ buildTeamPivot \} from '\.\.\/lib\/pivots';/,
    "import { useWorkerPivot } from '../hooks/useWorkerPivot';"
  );

  const rawTeamDataPattern = /\/\/ Build raw pivot using verified core calculation[\s\S]*?const rawTeamData = useMemo\(\(\) => \{\s*return buildTeamPivot\(filtered, targets\);\s*\}, \[filtered, targets\]\);/;
  
  code = code.replace(
    rawTeamDataPattern,
    `// Build raw pivot using Web Worker Offloading\n  const { data: rawTeamData, isCalculating: isPivoting } = useWorkerPivot<any[]>('buildTeamPivot', filtered, targets, []);`
  );
  
  fs.writeFileSync('src/pages/TeamPivot.tsx', code);
}
