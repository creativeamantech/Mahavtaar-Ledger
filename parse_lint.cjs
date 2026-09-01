const fs = require('fs');

const data = JSON.parse(fs.readFileSync('lint-results.json', 'utf-8'));
const fileStats = data.map(file => {
  const anyErrors = file.messages.filter(m => m.ruleId === '@typescript-eslint/no-explicit-any');
  return { path: file.filePath, count: anyErrors.length };
}).filter(f => f.count > 0).sort((a, b) => b.count - a.count);

console.log("Top 10 files with any:");
fileStats.slice(0, 10).forEach(f => console.log(`${f.count}: ${f.path}`));
