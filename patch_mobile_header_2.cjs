const fs = require('fs');
const file = 'src/components/layout/MobileHeader.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = /\{\/\* Mobile Bucket Filter \*\/\}[\s\S]*?<\/div>\n      \)\}\n    <\/div>/;

const bucketUI = `{/* Mobile Bucket Filter */}
      {availableBuckets.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-1.5 border-t border-border/30 bg-muted/10">
          <div className="flex bg-muted/30 p-1 rounded-lg border border-border w-max">
            <button
              onClick={() => setGlobalBucket('ALL')}
              className={\`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors \${globalBucket === 'ALL' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:bg-muted'}\`}
            >
              All Buckets
            </button>
            {availableBuckets.map(b => (
              <button
                key={b}
                onClick={() => setGlobalBucket(b)}
                className={\`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors \${globalBucket === b ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:bg-muted'}\`}
              >
                Bucket {b}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>`;

if (content.match(target)) {
  content = content.replace(target, bucketUI);
  fs.writeFileSync(file, content);
  console.log("Mobile header patched.");
} else {
  console.log("Regex not matched in MobileHeader.");
}
