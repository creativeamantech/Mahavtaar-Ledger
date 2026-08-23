const fs = require('fs');
const content = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

let newContent = content.replace(
  "const key = buildTargetKey('GLOBAL', bucket, type);",
  "const key = `GLOBAL__BKT__${bucket}__${type}`;"
);

newContent = newContent.replace(
`        {availableBuckets.map(bucket => {
          const resKey = buildTargetKey('GLOBAL', bucket, 'RESOLUTION');
          const recKey = buildTargetKey('GLOBAL', bucket, 'RECOVERY');
          const resValue = globalTargets[resKey] ?? 0;
          const recValue = globalTargets[recKey] ?? 0;
          const { count, pos } = findMatchingRecordsCountAccurate(records, bucket, 'GLOBAL');`,
`        {availableBuckets.map(bucket => {
          const resKey = \`GLOBAL__BKT__\${bucket}__RESOLUTION\`;
          const recKey = \`GLOBAL__BKT__\${bucket}__RECOVERY\`;
          const resValue = globalTargets[resKey] ?? 0;
          const recValue = globalTargets[recKey] ?? 0;
          
          let count = 0;
          let pos = 0;
          for (const r of records) {
            if (String(r.bom_bkt).trim().toUpperCase() === bucket) {
              count++;
              pos += (Number(r.pos) || 0);
            }
          }
`
);

fs.writeFileSync('src/pages/Settings.tsx', newContent);
console.log("Settings.tsx updated.");
