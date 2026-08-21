const fs = require('fs');
let code = fs.readFileSync('src/pages/BandExplorer.tsx', 'utf-8');

code = code.replace(
    /onClick=\{\(\) => window\.location\.href = `\/explorer\?minPos=\$\{minPos\}\&maxPos=\$\{maxPos\}`\}/g,
    "onClick={() => window.location.href = `/explorer?minPos=${minPos}&maxPos=${maxPos}${globalBucket !== 'ALL' ? `&bucket=${globalBucket}` : ''}`}"
);

fs.writeFileSync('src/pages/BandExplorer.tsx', code);
console.log("Patched BandExplorer links");
