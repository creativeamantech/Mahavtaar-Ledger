const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// TH replace
content = content.replace(/<th\s+([^>]*)className="([^"]*)px-2 py-2([^"]*)"([^>]*)>/g, (match, p1, p2, p3, p4) => {
    return `<th ${p1}className={\`${p2}px-2 \${thPad}${p3}\`}${p4}>`;
});

// TD replace
content = content.replace(/<td\s+([^>]*)className="([^"]*)px-2 py-1\.5([^"]*)"([^>]*)>/g, (match, p1, p2, p3, p4) => {
    return `<td ${p1}className={\`${p2}px-2 \${tdPad}${p3}\`}${p4}>`;
});

// Fix the dragged column logic which I also need to apply
const oldTh = `{(visibleExtraColumns || []).filter(col => allExtraKeys.includes(col)).map(col => (
                  <th key={col} id={\`th-\${col}\`} className="px-2 py-2 font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{col}</th>
                ))}`;

const newTh = `{(visibleExtraColumns || []).filter(col => allExtraKeys.includes(col)).map(col => (
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
                    className={\`px-2 \${thPad} font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold cursor-move \${draggedCol === col ? 'opacity-50' : ''}\`}
                    title="Drag to reorder"
                  >
                    {col}
                  </th>
                ))}`;

content = content.replace(/\{\(visibleExtraColumns \|\| \[\]\)\.filter\(col => allExtraKeys\.includes\(col\)\)\.map\(col => \(\s*<th key=\{col\} id=\{`th-\$\{col\}`\} className="px-2 py-2 font-sans text-\[10px\] uppercase tracking-wider text-muted-foreground font-bold">\{col\}<\/th>\s*\)\)\}/g, newTh);

// Just in case it was already replaced by the regex above:
const oldThReplaced = `{(visibleExtraColumns || []).filter(col => allExtraKeys.includes(col)).map(col => (
                  <th key={col} id={\`th-\${col}\`} className={\`px-2 \${thPad} font-sans text-[10px] uppercase tracking-wider text-muted-foreground font-bold\`}>{col}</th>
                ))}`;
content = content.replace(/\{\(visibleExtraColumns \|\| \[\]\)\.filter\(col => allExtraKeys\.includes\(col\)\)\.map\(col => \(\s*<th key=\{col\} id=\{`th-\$\{col\}`\} className=\{\`px-2 \$\{thPad\} font-sans text-\[10px\] uppercase tracking-wider text-muted-foreground font-bold\`\}>\{col\}<\/th>\s*\)\)\}/g, newTh);

fs.writeFileSync(file, content, 'utf8');
console.log('Applied density mapping and drag and drop');
