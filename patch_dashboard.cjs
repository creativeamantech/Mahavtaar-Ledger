const fs = require('fs');
const file = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update bands structure in stats
content = content.replace(
  `bands: {} as Record<string, number>`,
  `bands: {} as Record<string, { cases: number, pos: number }>`
);

content = content.replace(
  `if (!byCity[city].bands[band]) byCity[city].bands[band] = 0;\n        byCity[city].bands[band]++;`,
  `if (!byCity[city].bands[band]) byCity[city].bands[band] = { cases: 0, pos: 0 };\n        byCity[city].bands[band].cases++;\n        byCity[city].bands[band].pos += pos;`
);

// 2. Add state for selection
const stateInsertion = `  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  
  const handleCellClick = (city: string, band: string) => {
    setSelectedCells(prev => {
      const next = new Set(prev);
      const id = \`\${city}:::\${band}\`;
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const selectionStats = useMemo(() => {
    let cases = 0;
    let pos = 0;
    selectedCells.forEach(id => {
      const [c, b] = id.split(':::');
      const cityRec = stats.cityData.find(x => x.city === c);
      if (cityRec && cityRec.bands[b]) {
        cases += cityRec.bands[b].cases;
        pos += cityRec.bands[b].pos;
      }
    });
    return { cases, pos };
  }, [selectedCells, stats.cityData]);

  const { records, isLoading, globalBucket } = useData();`;

content = content.replace(`  const { records, isLoading, globalBucket } = useData();`, stateInsertion);

// 3. Fix grid layout: remove xl:grid-cols-2 from Bucket Breakdown and move City Top Level out of it
content = content.replace(
  `<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">`,
  `<div className="grid grid-cols-1 gap-6 mb-8">`
);

// We need to move the City Top Level div out of that grid.
// The grid has two main children: Bucket Breakdown and City Top Level.
// Wait, the grid contains:
// {/* Bucket Breakdown */}
// <div ...> ... </div>
// {/* City Top Level */}
// <div ...> ... </div>
// </div>

const cityTopLevelStart = `{/* City Top Level */}`;
const bucketEnd = content.indexOf(cityTopLevelStart);
if (bucketEnd !== -1) {
  content = content.substring(0, bucketEnd) + `</div>\n      <div className="mb-10">\n        ` + content.substring(bucketEnd);
  // We need to remove the closing div of the original grid that was at the end of City Top Level.
  // We'll let it close the new mb-10 div. But the previous grid needs to be closed. So I added `</div>` before the new div. This is correct.
}

// 4. Update cell rendering in City Top Level
content = content.replace(
  `{stats.sortedBands.map((band, idx) => {\n                        const val = c.bands[band];\n                        return (\n                          <td key={band} className={\`px-2 py-2 text-center text-xs bg-muted/10 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors \${idx === 0 ? 'border-l border-border/30' : ''} \${idx === stats.sortedBands.length - 1 ? 'border-r border-border/30' : ''}\`} onClick={() => navigateToExplorer({ city: c.city, band })}>\n                              {val > 0 ? val : '-'}\n                          </td>\n                        )\n                    })}`,
  `{stats.sortedBands.map((band, idx) => {
                        const cell = c.bands[band];
                        const val = cell ? cell.cases : 0;
                        const isSelected = selectedCells.has(\`\${c.city}:::\${band}\`);
                        return (
                          <td 
                            key={band} 
                            className={\`px-2 py-2 text-center text-xs cursor-pointer transition-colors \${idx === 0 ? 'border-l border-border/30' : ''} \${idx === stats.sortedBands.length - 1 ? 'border-r border-border/30' : ''} \${isSelected ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted/10 hover:bg-primary/10 hover:text-primary'}\`} 
                            onClick={() => handleCellClick(c.city, band)}
                          >
                              {val > 0 ? val : '-'}
                          </td>
                        )
                    })}`
);

// 5. Update footer calculation for bands
content = content.replace(
  `{stats.cityData.reduce((a, c) => a + (c.bands[band] || 0), 0).toLocaleString()}`,
  `{stats.cityData.reduce((a, c) => a + (c.bands[band] ? c.bands[band].cases : 0), 0).toLocaleString()}`
);

// 6. Update CSV export
content = content.replace(
  `stats.sortedBands.map(b => c.bands[b] || 0).join(',')`,
  `stats.sortedBands.map(b => c.bands[b] ? c.bands[b].cases : 0).join(',')`
);

// 7. Render Floating Selection Bar
const floatingBar = `
      {selectedCells.size > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-foreground text-background px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center bg-background/20 text-background rounded-full w-8 h-8 font-bold text-sm">
                {selectedCells.size}
              </span>
              <span>Cells Selected</span>
            </div>
            <div className="w-px h-6 bg-background/20"></div>
            <div className="flex flex-col">
              <span className="text-xs text-background/70 uppercase tracking-wider">Total Cases</span>
              <span className="font-bold text-lg leading-none">{selectionStats.cases.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-background/70 uppercase tracking-wider">Total POS</span>
              <span className="font-bold text-lg leading-none">{fmtCur(selectionStats.pos)}</span>
            </div>
            <div className="w-px h-6 bg-background/20 ml-2"></div>
            <button 
              onClick={() => setSelectedCells(new Set())}
              className="text-sm px-3 py-1.5 rounded-lg hover:bg-background/20 transition-colors ml-2"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </AppLayout>
`;

content = content.replace(`    </AppLayout>`, floatingBar);

fs.writeFileSync(file, content);
console.log('Dashboard patched successfully.');
