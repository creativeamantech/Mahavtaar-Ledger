const fs = require('fs');
const file = 'src/components/layout/MobileHeader.tsx';
let content = fs.readFileSync(file, 'utf8');

const importsToAdd = "import { useData } from '../../contexts/DataContext';\nimport { useMemo } from 'react';\n";
content = content.replace("import { useAuth }", importsToAdd + "import { useAuth }");

const logicToAdd = `
  const { records, globalBucket, setGlobalBucket } = useData();
  const availableBuckets = useMemo(() => {
    const bkts = new Set<string>();
    (records || []).forEach((r: any) => {
      if (r.bom_bkt) bkts.add(String(r.bom_bkt).trim().toUpperCase());
    });
    return Array.from(bkts).sort();
  }, [records]);
  const isExplorer = location.pathname === '/explorer';
`;

content = content.replace("const title = PAGE_TITLES", logicToAdd + "  const title = PAGE_TITLES");

const returnContent = `
    <div className="sticky top-0 z-40 flex flex-col border-b border-border bg-background md:hidden shadow-sm">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="p-1 rounded-md text-muted-foreground hover:bg-muted" title="Go Back"><ArrowLeft className="h-4 w-4" /></button>
            <button onClick={() => navigate(1)} className="p-1 rounded-md text-muted-foreground hover:bg-muted" title="Go Forward"><ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <h1 className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
          <span className={\`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider \${
            user.role === 'ADMIN' ? 'bg-primary text-primary-foreground' :
            user.role === 'MANAGER' ? 'bg-info text-info-foreground' :
            user.role === 'EXECUTIVE' ? 'bg-success text-success-foreground' :
            'bg-muted text-muted-foreground'
          }\`}>
            {user.role}
          </span>
          )}
        </div>
      </div>
      
      {/* Mobile Bucket Filter */}
      {!isExplorer && availableBuckets.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-2 border-t border-border/50 bg-muted/10">
          <button
            onClick={() => setGlobalBucket('ALL')}
            className={\`shrink-0 px-3 py-1.5 font-sans text-xs rounded transition-colors border \${globalBucket === 'ALL' ? 'bg-primary/10 text-primary font-semibold border-primary' : 'text-muted-foreground hover:bg-muted border-transparent'}\`}
          >
            All Buckets
          </button>
          {availableBuckets.map(b => (
            <button
              key={b}
              onClick={() => setGlobalBucket(b)}
              className={\`shrink-0 px-3 py-1.5 font-sans text-xs rounded transition-colors border \${globalBucket === b ? 'bg-primary/10 text-primary font-semibold border-primary' : 'text-muted-foreground hover:bg-muted border-transparent'}\`}
            >
              Bkt {b}
            </button>
          ))}
        </div>
      )}
    </div>
`;

content = content.replace(/<div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">[\s\S]*<\/div>/, returnContent);

fs.writeFileSync(file, content);
