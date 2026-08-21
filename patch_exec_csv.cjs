const fs = require('fs');
const file = 'src/pages/ExecDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const csv = ['Bucket,Cases,POS Amount,Paid,Unpaid', ...stats.bucketData.map(b => \\`\"\\${b.bucket}\",\\${b.cases},\\${b.pos},\\${b.paid},\\${b.unpaid}\\`)].join('\\n');",
  "const csv = ['Bucket,Cases,POS Amount,Team Paid,POS Paid Only', ...stats.bucketData.map(b => \\`\"\\${b.bucket}\",\\${b.cases},\\${b.pos},\\${b.teamPaid},\\${b.posPaidOnly}\\`)].join('\\n');"
);

content = content.replace(
  "let headerRow = 'City,Total Cases,' + stats.bucketData.map(b => \\`Bkt \\${b.bucket} Paid,Bkt \\${b.bucket} Unpaid\\`).join(',');",
  "let headerRow = 'City,Total Cases,' + stats.bucketData.map(b => \\`Bkt \\${b.bucket} Team Paid,Bkt \\${b.bucket} POS Paid Only\\`).join(',');"
);

content = content.replace(
  "const csv = [headerRow, ...stats.cityData.map(c => \\`\"\\${c.city}\",\\${c.cases},\\${stats.bucketData.map(b => (c.buckets[b.bucket]?.paid || 0) + ',' + (c.buckets[b.bucket]?.unpaid || 0)).join(',')}\\`)].join('\\n');",
  "const csv = [headerRow, ...stats.cityData.map(c => \\`\"\\${c.city}\",\\${c.cases},\\${stats.bucketData.map(b => (c.buckets[b.bucket]?.teamPaid || 0) + ',' + (c.buckets[b.bucket]?.posPaidOnly || 0)).join(',')}\\`)].join('\\n');"
);

fs.writeFileSync(file, content);
console.log('ExecDashboard CSV patched');
