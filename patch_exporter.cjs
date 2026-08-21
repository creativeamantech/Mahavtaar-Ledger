const fs = require('fs');
const file = 'src/lib/exporter.ts';
let content = fs.readFileSync(file, 'utf8');

const newFunc = `export function exportExecCityPivot(data: any[]) {
  const rows = data.map(e => ({
    'Bucket': e.bkt,
    'City': e.city,
    'Collection': e.collection,
    'Total Count': e.count,
    'Paid Count': e.paid,
    'Total POS': e.totalPOS,
    'Paid POS': e.paidPOS,
    'Total %': (e.pct * 100).toFixed(2) + '%',
  }));
  exportToExcel(rows, 'Team Overall Performance', \`Team_Overall_Performance_\${new Date().toISOString().slice(0, 10)}.xlsx\`);
}`;

content = content + '\n\n' + newFunc;
fs.writeFileSync(file, content);
console.log('Exporter updated');
