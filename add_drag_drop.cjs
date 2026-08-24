const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add draggedCol state
const stateInjectionPoint = "const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());";
content = content.replace(stateInjectionPoint, stateInjectionPoint + "\n  const [draggedCol, setDraggedCol] = useState<string | null>(null);");

// Replace the th map function
const oldTh = `((visibleExtraColumns || []).filter(col => allExtraKeys.includes(col))).map(col => (
                  <th key={col} id={\`th-\${col}\`} className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{col}</th>
                ))`;

const newTh = `((visibleExtraColumns || []).filter(col => allExtraKeys.includes(col))).map(col => (
                  <th 
                    key={col} 
                    id={\`th-\${col}\`} 
                    draggable
                    onDragStart={(e) => {
                        setDraggedCol(col);
                        e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        if (draggedCol && draggedCol !== col) {
                            setVisibleExtraColumns(prev => {
                                const next = [...(prev || [])];
                                const fromIdx = next.indexOf(draggedCol);
                                const toIdx = next.indexOf(col);
                                if (fromIdx !== -1 && toIdx !== -1) {
                                    next.splice(fromIdx, 1);
                                    next.splice(toIdx, 0, draggedCol);
                                    localStorage.setItem('dataExplorerExtraColumns', JSON.stringify(next));
                                }
                                return next;
                            });
                        }
                        setDraggedCol(null);
                    }}
                    onDragEnd={() => setDraggedCol(null)}
                    className={\`px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold cursor-move \${draggedCol === col ? 'opacity-50' : ''}\`}
                    title="Drag to reorder"
                  >
                    {col}
                  </th>
                ))`;

// The regex might need to account for spacing, so let's just do a manual replace using a simpler string
if (content.includes('((visibleExtraColumns || []).filter(col => allExtraKeys.includes(col))).map(col => (\\n                  <th key={col} id={`th-${col}`} className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{col}</th>\\n                ))')) {
    console.log("direct match found");
}

content = content.replace(
    /\{\(\(visibleExtraColumns \|\| \[\]\)\.filter\(col => allExtraKeys\.includes\(col\)\)\)\.map\(col => \(\s*<th key=\{col\} id=\{`th-\$\{col\}`\} className="px-2 py-2 font-sans text-\[10px\] uppercase tracking-wider text-muted-foreground font-bold">\{col\}<\/th>\s*\)\)\}/,
    `{${newTh}}`
);


fs.writeFileSync(file, content, 'utf8');
console.log('Added Drag and Drop');
