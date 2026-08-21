const fs = require('fs');
let code = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf-8');

code = code.replace(
    "const { records, isLoading } = useData();",
    "const { records, isLoading, globalBucket } = useData();"
);

code = code.replace(
    "if (isExecutive() && user) return records.filter((r: any) => r.executive_name === user.name);\n    return records;",
    `let recs = records;
    if (globalBucket !== 'ALL') {
        recs = recs.filter((r: any) => String(r.bom_bkt).trim().toUpperCase() === globalBucket);
    }
    if (isExecutive() && user) return recs.filter((r: any) => r.executive_name === user.name);
    return recs;`
);
code = code.replace(
    "[records, user, isExecutive]",
    "[records, user, isExecutive, globalBucket]"
);

fs.writeFileSync('src/pages/DataExplorer.tsx', code);
console.log("Patched DataExplorer globalBucket");
