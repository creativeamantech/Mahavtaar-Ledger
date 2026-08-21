const fs = require('fs');
// Let's just output some common keys from the raw data
// We don't have a dataset file available, let's look at calculateRow
let calc = fs.readFileSync('src/lib/calculations.ts', 'utf-8');
console.log(calc.split('\n').filter(l => l.includes('r.') || l.includes('row.')).slice(0, 15).join('\n'));
