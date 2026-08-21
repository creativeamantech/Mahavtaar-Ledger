const fs = require('fs');
let code = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf-8');

code = code.replace(
    "const { records, isLoading, globalBucket } = useData();",
    "const { records, isLoading } = useData();"
);

code = code.replace(
    "let recs = records;\n    if (globalBucket !== 'ALL') {\n        recs = recs.filter((r: any) => String(r.bom_bkt).trim().toUpperCase() === globalBucket);\n    }\n    if (isExecutive() && user) return recs.filter((r: any) => r.executive_name === user.name);\n    return recs;",
    "if (isExecutive() && user) return records.filter((r: any) => r.executive_name === user.name);\n    return records;"
);

code = code.replace(
    "[records, user, isExecutive, globalBucket]",
    "[records, user, isExecutive]"
);

fs.writeFileSync('src/pages/DataExplorer.tsx', code);
console.log("Patched DataExplorer to remove globalBucket dependency");
