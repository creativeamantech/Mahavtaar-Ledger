const fs = require('fs');
const file = 'src/components/layout/DesktopHeader.tsx';
let content = fs.readFileSync(file, 'utf8');

const bucketUI = `      </div>

      <div className="flex-1 flex justify-center overflow-hidden px-4">
        {!isExplorer && availableBuckets.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setGlobalBucket('ALL')}
              className={\`shrink-0 px-3 py-1.5 text-xs rounded-full transition-colors border \${globalBucket === 'ALL' ? 'bg-primary/10 text-primary font-semibold border-primary/30' : 'text-muted-foreground hover:bg-muted border-transparent'}\`}
            >
              All Buckets
            </button>
            {availableBuckets.map(b => (
              <button
                key={b}
                onClick={() => setGlobalBucket(b)}
                className={\`shrink-0 px-3 py-1.5 text-xs rounded-full transition-colors border \${globalBucket === b ? 'bg-primary/10 text-primary font-semibold border-primary/30' : 'text-muted-foreground hover:bg-muted border-transparent'}\`}
              >
                Bkt {b}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-muted-foreground">`;

content = content.replace(/<\/div>\s*<div className="flex items-center gap-3 text-muted-foreground">/, bucketUI);

fs.writeFileSync(file, content);
console.log("Successfully replaced via regex");
