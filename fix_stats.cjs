const fs = require('fs');
const file = 'src/pages/ExecDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find the start and end of the useMemo
const startIndex = content.indexOf('const stats = useMemo(() => {');
const endIndex = content.indexOf('const bucketData = Object.keys(byBucket)');

if (startIndex !== -1 && endIndex !== -1) {
  const newStatsBlock = `const stats = useMemo(() => {
    let totalCollection = 0;
    let teamPaidPosSum = 0;
    let posPaidOnlyPosSum = 0;
    
    const byBucket: Record<string, any> = {};
    const byCity: Record<string, any> = {};
    
    let smallCasesEMI = 0;
    let smallCasesPOS = 0;
    let totalSmallCases = 0;
    let smallCasesBoth = 0;
    
    filteredRecords.forEach((row: any) => {
        const c = calculateRow(row);
        const bucket = String(row.bom_bkt || 'Unknown').trim();
        const city = String(row.city || row.City || 'Unknown').trim().toUpperCase();
        const dac = Number(row.dac ?? row.DAC) || 0;
        const pos = Number(row.principal_outstanding) || 0;
        const emi = Number(row.emi_amt) || 0;

        const isTeamPaid = c.teamPaid === 1;
        const isPosPaidOnly = (c.posCleared <= 0 && c.teamPaid !== 1);
        
        if (isTeamPaid || isPosPaidOnly) totalCollection += dac;
        if (isTeamPaid) teamPaidPosSum += pos;
        if (isPosPaidOnly) posPaidOnlyPosSum += pos;
        
        if (emi < 500) smallCasesEMI++;
        if (pos < 1000) smallCasesPOS++;
        if (emi < 500 || pos < 1000) {
            totalSmallCases++;
            if (emi < 500 && pos < 1000) smallCasesBoth++;
        }
        
        if (!byBucket[bucket]) byBucket[bucket] = { collection: 0, cases: 0, pos: 0, teamPaid: 0, posPaidOnly: 0, unpaid: 0 };
        byBucket[bucket].cases++;
        byBucket[bucket].pos += pos;
        
        if (isTeamPaid) {
            byBucket[bucket].collection += dac;
            byBucket[bucket].teamPaid++;
        } else if (isPosPaidOnly) {
            byBucket[bucket].collection += dac;
            byBucket[bucket].posPaidOnly++;
        } else {
            byBucket[bucket].unpaid++;
        }
        
        if (!byCity[city]) {
            byCity[city] = { 
                cases: 0, pos: 0, teamPaid: 0, posPaidOnly: 0, unpaid: 0, 
                buckets: {} as Record<string, any>, 
                bands: {} as Record<string, { cases: number, pos: number }> 
            };
        }
        byCity[city].cases++;
        byCity[city].pos += pos;
        if (isTeamPaid) byCity[city].teamPaid++; 
        else if (isPosPaidOnly) byCity[city].posPaidOnly++;
        else byCity[city].unpaid++;
        
        if (!byCity[city].buckets[bucket]) byCity[city].buckets[bucket] = { teamPaid: 0, posPaidOnly: 0, unpaid: 0 };
        if (isTeamPaid) byCity[city].buckets[bucket].teamPaid++;
        else if (isPosPaidOnly) byCity[city].buckets[bucket].posPaidOnly++;
        else byCity[city].buckets[bucket].unpaid++;
        
        let band = '< 1k';
        if (pos >= 1000 && pos < 10000) {
            const lower = Math.floor(pos / 1000);
            band = \`\${lower}k-\${lower + 1}k\`;
        } else if (pos >= 10000) {
            const lower = Math.floor(pos / 5000) * 5;
            band = \`\${lower}k-\${lower + 5}k\`;
        }
        if (!byCity[city].bands[band]) byCity[city].bands[band] = { cases: 0, pos: 0 };
        byCity[city].bands[band].cases++;
        byCity[city].bands[band].pos += pos;
    });
    
    `;
  content = content.slice(0, startIndex) + newStatsBlock + content.slice(endIndex);
  fs.writeFileSync(file, content);
  console.log('Fixed stats manually');
} else {
  console.log('Could not find boundaries');
}
