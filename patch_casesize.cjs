const fs = require('fs');

let code = fs.readFileSync('src/pages/Assignment.tsx', 'utf-8');

const stateTarget = `  const [caseSize, setCaseSize] = useState<string>('All'); // All, Small (<50k), Large (>=50k)`;
const stateReplacement = `  const [caseSize, setCaseSize] = useState<string>('All');`;
code = code.replace(stateTarget, stateReplacement);

const filterTarget = `      const pos = Number(r.principal_outstanding) || 0;
      if (caseSize === 'Small' && pos >= 50000) return false;
      if (caseSize === 'Large' && pos < 50000) return false;
      
      return true;`;
const filterReplacement = `      const pos = Number(r.principal_outstanding) || 0;
      if (caseSize === 'Small' && pos >= 1000) return false;
      if (caseSize === 'Medium' && (pos < 1000 || pos >= 5000)) return false;
      if (caseSize === 'Medium-Large' && (pos < 5000 || pos >= 10000)) return false;
      if (caseSize === 'Large' && pos < 10000) return false;
      
      return true;`;
code = code.replace(filterTarget, filterReplacement);

const statsTarget = `const smallCasesCount = filteredRecords.filter(r => (Number(r.principal_outstanding) || 0) < 50000).length;`;
const statsReplacement = `const smallCasesCount = filteredRecords.filter(r => (Number(r.principal_outstanding) || 0) < 1000).length;`;
code = code.replace(statsTarget, statsReplacement);

const kpiTarget = `<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Small Cases (&lt;50k POS)</span>`;
const kpiReplacement = `<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Small Cases (&lt;1k POS)</span>`;
code = code.replace(kpiTarget, kpiReplacement);

const selectTarget = `<select value={caseSize} onChange={e => {setCaseSize(e.target.value); setPage(1);}} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              <option value="All">All Sizes</option>
              <option value="Small">Small (&lt;50k)</option>
              <option value="Large">Large (&ge;50k)</option>
            </select>`;
const selectReplacement = `<select value={caseSize} onChange={e => {setCaseSize(e.target.value); setPage(1);}} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              <option value="All">All Sizes</option>
              <option value="Small">Small (&lt;1k)</option>
              <option value="Medium">Medium (1k - 5k)</option>
              <option value="Medium-Large">Medium-Large (5k - 10k)</option>
              <option value="Large">Large (&ge;10k)</option>
            </select>`;
code = code.replace(selectTarget, selectReplacement);

fs.writeFileSync('src/pages/Assignment.tsx', code);
console.log("Updated case size categories");
