const fs = require('fs');

const path = 'src/pages/Dashboard.tsx';
let code = fs.readFileSync(path, 'utf-8');

// Replace bands logic
code = code.replace(
  "bands: { '<1k': 0, '1k-10k': 0, '10k-50k': 0, '50k+': 0 }",
  "bands: {} as Record<string, number>"
);

const bandCalcOld = `if (pos < 1000) byCity[city].bands['<1k']++;
        else if (pos < 10000) byCity[city].bands['1k-10k']++;
        else if (pos < 50000) byCity[city].bands['10k-50k']++;
        else byCity[city].bands['50k+']++;`;

const bandCalcNew = `let band = '< 1k';
        if (pos >= 1000 && pos < 10000) {
            const lower = Math.floor(pos / 1000);
            band = \`\${lower}k-\${lower + 1}k\`;
        } else if (pos >= 10000) {
            const lower = Math.floor(pos / 5000) * 5;
            band = \`\${lower}k-\${lower + 5}k\`;
        }
        if (!byCity[city].bands[band]) byCity[city].bands[band] = 0;
        byCity[city].bands[band]++;`;

code = code.replace(bandCalcOld, bandCalcNew);

// Add unique sorted bands to the returned stats
const returnOld = "return { totalCollection, bucketData, cityData, smallCasesEMI, smallCasesPOS, totalSmallCases, smallCasesBoth };";
const returnNew = `
    const allBands = new Set<string>();
    filteredRecords.forEach((row: any) => {
        const pos = Number(row.principal_outstanding) || 0;
        if (pos < 1000) allBands.add('< 1k');
        else if (pos < 10000) {
            const lower = Math.floor(pos / 1000);
            allBands.add(\`\${lower}k-\${lower + 1}k\`);
        } else {
            const lower = Math.floor(pos / 5000) * 5;
            allBands.add(\`\${lower}k-\${lower + 5}k\`);
        }
    });
    
    const sortedBands = Array.from(allBands).sort((a, b) => {
        if (a === '< 1k') return -1;
        if (b === '< 1k') return 1;
        const valA = parseInt(a.split('k')[0]);
        const valB = parseInt(b.split('k')[0]);
        return valA - valB;
    });

    return { totalCollection, bucketData, cityData, smallCasesEMI, smallCasesPOS, totalSmallCases, smallCasesBoth, sortedBands };`;

code = code.replace(returnOld, returnNew.trim());

fs.writeFileSync(path, code);
console.log('Fixed bands calculation in Dashboard');
