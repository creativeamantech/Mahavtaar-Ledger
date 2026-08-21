const fs = require('fs');
const file = 'src/components/layout/DesktopHeader.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add globalBucket, setGlobalBucket to useData
content = content.replace(
  `const { records, undo, redo, canUndo, canRedo } = useData();`,
  `const { records, undo, redo, canUndo, canRedo, globalBucket, setGlobalBucket } = useData();\n  const location = useLocation();\n  const isExplorer = location.pathname === '/explorer';\n\n  const availableBuckets = useMemo(() => {\n    const bkts = new Set<string>();\n    (records || []).forEach((r: any) => {\n      if (r.bom_bkt) bkts.add(String(r.bom_bkt).trim().toUpperCase());\n    });\n    return Array.from(bkts).sort();\n  }, [records]);\n`
);

// Insert into header
const headerInsertPoint = `      </div>\n      <div className="flex items-center gap-3 text-muted-foreground">`;
const bucketUI = `      </div>\n\n      <div className="flex-1 flex justify-center overflow-hidden px-4">\n        {!isExplorer && availableBuckets.length > 0 && (\n          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">\n            <button\n              onClick={() => setGlobalBucket('ALL')}\n              className={\`shrink-0 px-3 py-1.5 text-xs rounded-full transition-colors border \${globalBucket === 'ALL' ? 'bg-primary/10 text-primary font-semibold border-primary/30' : 'text-muted-foreground hover:bg-muted border-transparent'}\`}\n            >\n              All Buckets\n            </button>\n            {availableBuckets.map(b => (\n              <button\n                key={b}\n                onClick={() => setGlobalBucket(b)}\n                className={\`shrink-0 px-3 py-1.5 text-xs rounded-full transition-colors border \${globalBucket === b ? 'bg-primary/10 text-primary font-semibold border-primary/30' : 'text-muted-foreground hover:bg-muted border-transparent'}\`}\n              >\n                Bkt {b}\n              </button>\n            ))}\n          </div>\n        )}\n      </div>\n\n      <div className="flex items-center gap-3 text-muted-foreground">`;

content = content.replace(headerInsertPoint, bucketUI);

fs.writeFileSync(file, content);
console.log('DesktopHeader patched.');
