const fs = require('fs');

const path = 'src/pages/Dashboard.tsx';
let code = fs.readFileSync(path, 'utf-8');

// Update stats calculation
code = code.replace(
  "let smallCasesEMI = 0;\n    let smallCasesPOS = 0;",
  "let smallCasesEMI = 0;\n    let smallCasesPOS = 0;\n    let totalSmallCases = 0;\n    let smallCasesBoth = 0;"
);

code = code.replace(
  "if (emi < 500) smallCasesEMI++;\n        if (pos < 1000) smallCasesPOS++;",
  `if (emi < 500) smallCasesEMI++;
        if (pos < 1000) smallCasesPOS++;
        if (emi < 500 || pos < 1000) {
            totalSmallCases++;
            if (emi < 500 && pos < 1000) smallCasesBoth++;
        }`
);

code = code.replace(
  "return { totalCollection, bucketData, cityData, smallCasesEMI, smallCasesPOS };",
  "return { totalCollection, bucketData, cityData, smallCasesEMI, smallCasesPOS, totalSmallCases, smallCasesBoth };"
);

// Update UI Cards
const cardsOld = `<div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-muted-foreground mb-2 font-medium">
            <AlertCircle className="h-4 w-4" /> Small Cases (EMI &lt; ₹500)
          </div>
          <div className="text-3xl font-bold text-destructive">{stats.smallCasesEMI.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Accounts with low monthly obligations</div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-muted-foreground mb-2 font-medium">
            <AlertCircle className="h-4 w-4" /> Small Cases (POS &lt; ₹1k)
          </div>
          <div className="text-3xl font-bold text-warning">{stats.smallCasesPOS.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Accounts with low principal outstanding</div>
        </div>`;

const cardsNew = `<div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-muted-foreground mb-2 font-medium">
            <AlertCircle className="h-4 w-4" /> Total Small Cases
          </div>
          <div className="text-3xl font-bold text-warning">{stats.totalSmallCases.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Accounts with EMI &lt; ₹500 <strong>or</strong> POS &lt; ₹1k
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 flex justify-between">
            <span>EMI only: {(stats.smallCasesEMI - stats.smallCasesBoth).toLocaleString()}</span>
            <span>POS only: {(stats.smallCasesPOS - stats.smallCasesBoth).toLocaleString()}</span>
            <span>Both: {stats.smallCasesBoth.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-muted-foreground mb-2 font-medium">
            <Database className="h-4 w-4" /> Total Outstanding (POS)
          </div>
          <div className="text-3xl font-bold text-destructive">{fmtCur(stats.bucketData.reduce((acc, b) => acc + b.pos, 0))}</div>
          <div className="text-xs text-muted-foreground mt-1">Total principal across all cases</div>
        </div>`;

code = code.replace(cardsOld, cardsNew);

fs.writeFileSync(path, code);
console.log('Updated dashboard small cases logic');
