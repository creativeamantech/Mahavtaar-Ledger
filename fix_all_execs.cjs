const fs = require('fs');
let code = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf8');

if (!code.includes('const allExecutives = useMemo')) {
  // Find a good place to insert it. How about right before `const allExtraKeys = useMemo`
  const target = 'const allExtraKeys = useMemo(() => {';
  const insertion = `  const allExecutives = useMemo(() => {
    return Array.from(new Set(records.map((r: any) => String(r.executive_name || r['Executive Name'] || '').trim()).filter(Boolean))).sort();
  }, [records]);
  
  `;
  
  code = code.replace(target, insertion + target);
  fs.writeFileSync('src/pages/DataExplorer.tsx', code);
  console.log('Fixed allExecutives');
} else {
  console.log('Already exists');
}
