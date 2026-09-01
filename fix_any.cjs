const { execSync } = require('child_process');
const fs = require('fs');

const lintOutput = execSync('npm run lint | grep "Unexpected any" || true', { encoding: 'utf-8' });
const lines = lintOutput.split('\n').filter(l => l.includes('Unexpected any'));
const files = [...new Set(lines.map(l => l.match(/^\/(.*?):/)?.[1]).filter(Boolean))];

console.log("Files with any:", files.length);
files.forEach(f => console.log(f));
