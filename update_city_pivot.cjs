const fs = require('fs');

let content = fs.readFileSync('src/pages/CityPivot.tsx', 'utf8');

// Replace standard grand total div with Bento Cards
const grandTotalBento = `
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {[
          { label: 'Total POS', value: fmtCur(grandTotal.totalPOS), color: 'text-foreground' },
          { label: 'Collection', value: fmtCur(grandTotal.collection), color: 'text-primary' },
          { label: 'Needed POS', value: fmtCur(grandTotal.target), color: 'text-destructive' },
          { label: 'Total %', value: fmtPct(gPct), color: pctColor(gPct) },
          { label: 'Total Count', value: grandTotal.count, color: 'text-muted-foreground' },
          { label: 'Paid Count', value: grandTotal.paid, color: 'text-success' },
          { label: 'Paid POS', value: fmtCur(grandTotal.paidPOS), color: 'text-success' },
          { label: 'Daily Req.', value: fmtCur(grandTotal.dailyRequiredPOS), color: 'text-amber-500' },
        ].map((metric, i) => (
          <div key={i} className="bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-2xl p-4 shadow-xl flex flex-col justify-center items-center hover:bg-white/10 transition-colors">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{metric.label}</div>
            <div className={\`font-mono text-lg font-black tracking-tighter \${metric.color}\`}>{metric.value}</div>
          </div>
        ))}
      </div>
`;

// Replace the old top bar and grand total
content = content.replace(
  /<div className="mb-6 flex items-center justify-between">[\s\S]*?<h1[\s\S]*?<\/h1>[\s\S]*?<div className="flex gap-4">[\s\S]*?<\/div>[\s\S]*?<\/div>/,
  (match) => {
    return `<div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">City Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time analysis and milestone targets</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search cities..." 
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-64 shadow-inner"
            />
          </div>
          <button onClick={() => exportBucketCityPivot(rawCityData)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>
      ${grandTotalBento}`;
  }
);

// Now wrap the table in glass container
content = content.replace(
  /<div className="overflow-auto scrollbar-thin max-h-\[calc\(100vh-250px\)\] min-h-\[400px\] relative bg-card">/,
  '<div className="overflow-auto scrollbar-thin max-h-[calc(100vh-250px)] min-h-[400px] relative bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl shadow-2xl">'
);

// Format table head
content = content.replace(
  /<thead className="sticky top-0 z-30 bg-card shadow-sm border-b-2 border-border">/,
  '<thead className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-2xl shadow-sm border-b border-white/10">'
);

// Update TR font inside map to use Mono for numbers
content = content.replace(
  /className="px-3 py-2 text-right text-primary font-bold/g,
  'className="px-3 py-2 text-right text-primary font-mono font-bold tracking-tighter'
);
content = content.replace(
  /className="px-3 py-2 text-right text-success/g,
  'className="px-3 py-2 text-right font-mono font-medium text-success'
);
content = content.replace(
  /className="px-3 py-2 text-right text-info/g,
  'className="px-3 py-2 text-right font-mono font-medium text-info'
);
content = content.replace(
  /className="px-3 py-2 text-right font-medium/g,
  'className="px-3 py-2 text-right font-mono font-medium tracking-tight'
);
content = content.replace(
  /className="text-destructive font-bold"/g,
  'className="text-destructive font-mono font-bold tracking-tight"'
);
content = content.replace(
  /className="px-3 py-2 text-right font-semibold text-amber-600"/g,
  'className="px-3 py-2 text-right font-mono font-bold tracking-tight text-amber-600"'
);
content = content.replace(
  /className={`px-3 py-2 text-right font-bold \${pctColor\(item.pct\)}`}/g,
  'className={`px-3 py-2 text-right font-mono font-black tracking-tighter ${pctColor(item.pct)}`}'
);
content = content.replace(
  /className="px-3 py-2 text-right cursor-pointer/g,
  'className="px-3 py-2 text-right font-mono cursor-pointer'
);


fs.writeFileSync('src/pages/CityPivot.tsx', content, 'utf8');
