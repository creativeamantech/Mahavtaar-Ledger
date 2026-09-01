const fs = require('fs');

let code = fs.readFileSync('src/pages/CityPivot.tsx', 'utf-8');

if (!code.includes('useWorkerPivot')) {
  code = code.replace(
    /import \{ buildBucketCityPivot \} from '\.\.\/lib\/pivots';/,
    "import { useWorkerPivot } from '../hooks/useWorkerPivot';"
  );

  const rawCityDataPattern = /\/\/ Build raw pivot using verified core calculation[\s\S]*?const rawCityData = useMemo\(\(\) => \{\s*return buildBucketCityPivot\(filtered, targets\);\s*\}, \[filtered, targets\]\);/;
  
  code = code.replace(
    rawCityDataPattern,
    `// Build raw pivot using Web Worker Offloading\n  const { data: rawCityData, isCalculating: isPivoting } = useWorkerPivot<any[]>('buildBucketCityPivot', filtered, targets, []);`
  );
  
  // also need to handle showing a loading indicator maybe? or just rely on the existing isLoading logic
  // let's update isLoading to include isPivoting
  // actually wait, city totals and rendering just use rawCityData which is an array
  
  fs.writeFileSync('src/pages/CityPivot.tsx', code);
}
