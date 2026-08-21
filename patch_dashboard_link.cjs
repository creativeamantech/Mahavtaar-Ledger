const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
    /onClick=\{\(\) => window\.location\.href = '\/explorer'\}/g,
    "onClick={() => window.location.href = globalBucket === 'ALL' ? '/explorer' : `/explorer?bucket=${globalBucket}`}"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Patched Dashboard links");
