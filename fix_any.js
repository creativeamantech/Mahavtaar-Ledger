const { execSync } = require('child_process');
const fs = require('fs');

const lintOutput = execSync('npm run lint | grep "Unexpected any" || true', { encoding: 'utf-8' });
const lines = lintOutput.split('\n').filter(l => l.includes('Unexpected any'));
const files = [...new Set(lines.map(l => l.match(/^\/(.*?):/)?.[1]).filter(Boolean))];

console.log("Files with any:", files.length);

for (const f of files) {
  let content = fs.readFileSync(f, 'utf-8');
  
  if (!content.includes("import { LoanRecord")) {
     // try to add it.
  }
  
  // Actually, replacing all `any` mechanically is tough. Let's just fix the contexts and major libs.
}
