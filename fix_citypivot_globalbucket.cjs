const fs = require('fs');
let code = fs.readFileSync('src/pages/CityPivot.tsx', 'utf-8');

code = code.replace(
  "const { records, targets, isLoading } = useData();",
  "const { records, targets, isLoading, globalBucket } = useData();"
);

fs.writeFileSync('src/pages/CityPivot.tsx', code);
