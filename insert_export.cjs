const fs = require('fs');
let content = fs.readFileSync('src/pages/ExecDashboard.tsx', 'utf8');

const injection = `
        </div>
        <div className="p-3 border-t border-border bg-muted/10 text-right">
          <button onClick={() => {
            const headerRow = "Bucket,Rank,City,Collection,Total Cases,Paid Count,POS Paid Only Count,Total POS,Paid POS,Needed/DRR,Target Date,DRR,POS Paid Only POS,Total %";
            const csv = [headerRow, ...teamPerfData.map((item: any) => \`"\${item.bkt}","\${item.globalRank}","\${item.city}",\${item.collection},\${item.count},\${item.paid},\${item.posPaidOnlyCount},\${item.totalPOS},\${item.paidPOS},\${item.target},"\${item.targetDate || ''}",\${item.dailyRequiredPOS || 0},\${item.posPaidOnlyPOS},\${item.pct}\`)].join("\\n");
            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "Performance_Paid_Cases.csv"; a.click();
          }} className="inline-flex items-center gap-1.5 text-xs font-bold bg-card border border-border px-3 py-1.5 rounded hover:bg-muted text-primary transition-colors">
            <Download className="h-3.5 w-3.5" /> Export Data
          </button>
`;

// Only replace the last occurrence (or just before </AppLayout>)
// Find the last </div> before </AppLayout>
content = content.replace(/<\/table>\s*<\/div>\s*<\/div>\s*<\/AppLayout>/, `</table>${injection}</div></div></AppLayout>`);
fs.writeFileSync('src/pages/ExecDashboard.tsx', content);
