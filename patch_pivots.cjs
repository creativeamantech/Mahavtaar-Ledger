const fs = require('fs');
const file = 'src/lib/pivots.ts';
let content = fs.readFileSync(file, 'utf8');

const newFunc = `export function buildExecCityPivot(records: any[], targets: Record<string, number> = {}) {
  const map: Record<string, any> = {};
  records.forEach(r => {
    const c = calculateRow(r);
    const city = (r.city || r.City || 'UNKNOWN').trim().toUpperCase();
    const bkt = r.bom_bkt || 'UNKNOWN';
    
    const key = \`\${bkt}__\${city}\`;
    if (!map[key]) map[key] = { bkt, city, collection: 0, count: 0, totalPOS: 0, paid: 0, paidPOS: 0, posPaidOnlyCount: 0, posPaidOnlyPOS: 0, targetPOS: 0, cases: [] };
    
    map[key].collection += Number(r.dac ?? r.DAC) || 0;
    map[key].count += 1;
    
    const posVal = Number(r.principal_outstanding) || 0;
    map[key].totalPOS += posVal;
    
    // Evaluate based on teamPaid, because this is the team's performance on the city
    if (c.teamPaid === 1) {
      map[key].paid += 1;
      map[key].paidPOS += c.teamPaidPOS || 0;
    }
    if (c.posCleared <= 0 && c.teamPaid !== 1) {
      map[key].posPaidOnlyCount += 1;
      map[key].posPaidOnlyPOS += posVal;
    }
  });

  return Object.values(map).map(m => {
    const target = targets[\`\${m.bkt}_\${m.city}\`] || 0;
    const targetAmt = m.totalPOS * (target / 100);
    const needed = Math.max(0, targetAmt - m.paidPOS);
    return { ...m, target: needed, pct: m.totalPOS ? m.paidPOS / m.totalPOS : 0 };
  });
}`;

content = content + '\n\n' + newFunc;
fs.writeFileSync(file, content);
console.log('Pivots updated');
