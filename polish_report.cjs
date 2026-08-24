const fs = require('fs');

const files = [
  { path: 'src/pages/CityPivot.tsx', type: 'City' },
  { path: 'src/pages/TeamPivot.tsx', type: 'Executive' },
  { path: 'src/pages/ExecTeamPerf.tsx', type: 'Executive' }
];

files.forEach(({path, type}) => {
  let content = fs.readFileSync(path, 'utf8');

  // 1. Add KPI Cards & Better Header
  const title = path.includes('City') ? 'City Overall Performance' : 'Team Performance';
  const dataVar = path.includes('City') ? 'cityData' : (path.includes('ExecTeamPerf') ? 'rawTeamData' : 'teamData');
  const exportFn = path.includes('City') ? 'exportBucketCityPivot' : (path.includes('ExecTeamPerf') ? 'exportExecTeamPerf' : 'exportTeamPivot');

  const newHeader = `<div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              ${title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 pl-4">Enterprise Data Report · Bucket → ${type}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-64 shadow-sm"
              />
            </div>
            <button onClick={() => ${exportFn}(${dataVar})} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 shadow-sm transition-all">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total POS', value: fmtCur(grandTotal.totalPOS), color: 'text-slate-900 dark:text-white', bg: 'bg-white dark:bg-slate-900' },
            { label: 'Paid POS', value: fmtCur(grandTotal.paidPOS), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
            { label: 'Needed POS', value: fmtCur(grandTotal.target), color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/50 dark:bg-rose-950/20' },
            { label: 'Overall %', value: fmtPct(grandTotal.totalPOS ? grandTotal.paidPOS / grandTotal.totalPOS : 0), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/50 dark:bg-blue-950/20' },
          ].map((kpi, i) => (
            <div key={i} className={\`p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm \${kpi.bg} flex flex-col justify-center\`}>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</div>
              <div className={\`text-2xl font-bold font-tabular-nums \${kpi.color}\`}>{kpi.value}</div>
            </div>
          ))}
        </div>
      </div>`;

  content = content.replace(
    /<div className="mb-6 flex items-center justify-between">[\s\S]*?<h1[\s\S]*?<\/h1>[\s\S]*?<div className="flex gap-4">[\s\S]*?<\/div>[\s\S]*?<\/div>/,
    newHeader
  );
  content = content.replace(
    /<div className="mb-6 flex items-center justify-between">[\s\S]*?<h1[\s\S]*?<\/h1>[\s\S]*?<\/div>[\s\S]*?<button[\s\S]*?<\/button>[\s\S]*?<\/div>/,
    newHeader
  );

  // 2. Make rows striped
  content = content.replace(
    /className="border-b border-border transition-colors hover:bg-slate-50\/50 dark:hover:bg-slate-800\/50"/g,
    'className="border-b border-border transition-colors even:bg-slate-50/50 dark:even:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/80"'
  );

  // 3. Make Bucket Header look like a corporate group header (dark blueish)
  content = content.replace(
    /className="bg-slate-100\/80 dark:bg-slate-800\/80 border-b border-border"/g,
    'className="bg-slate-800 dark:bg-slate-900 border-b border-slate-700"'
  );
  content = content.replace(
    /className="px-4 py-2 text-\[11px\] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest"/g,
    'className="px-4 py-2 text-[11px] font-bold text-slate-100 uppercase tracking-widest"'
  );

  // 4. Update the grand total row to have a thick border and slightly colored background
  content = content.replace(
    /className="bg-slate-50 dark:bg-slate-900 font-bold sticky bottom-0 z-20 shadow-md border-t-2 border-slate-300 dark:border-slate-700"/g,
    'className="bg-slate-100 dark:bg-slate-800 font-bold sticky bottom-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t-2 border-slate-400 dark:border-slate-600"'
  );

  // Fix alignment of text-success/text-info for better contrast
  content = content.replace(/text-success/g, 'text-emerald-600 dark:text-emerald-400');
  content = content.replace(/text-info/g, 'text-blue-600 dark:text-blue-400');
  content = content.replace(/text-destructive/g, 'text-rose-600 dark:text-rose-400');

  fs.writeFileSync(path, content, 'utf8');
  console.log(`Polished ${path}`);
});
