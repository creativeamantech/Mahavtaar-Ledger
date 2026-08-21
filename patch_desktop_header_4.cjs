const fs = require('fs');
const file = 'src/components/layout/DesktopHeader.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = /<div className="flex-1 flex justify-center overflow-hidden px-4">[\s\S]*?<\/div>\s*<div className="flex items-center gap-3 text-muted-foreground">/;

const bucketUI = `<div className="flex-1 flex justify-center px-4">
        {availableBuckets.length > 0 && (
          <div className="flex bg-muted/30 p-1 rounded-lg border border-border">
            <button
              onClick={() => setGlobalBucket('ALL')}
              className={\`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors \${globalBucket === 'ALL' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:bg-muted'}\`}
            >
              All Buckets
            </button>
            {availableBuckets.map(b => (
              <button
                key={b}
                onClick={() => setGlobalBucket(b)}
                className={\`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors \${globalBucket === b ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:bg-muted'}\`}
              >
                Bucket {b}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-muted-foreground">`;

if (content.match(target)) {
  content = content.replace(target, bucketUI);
  fs.writeFileSync(file, content);
  console.log("Desktop header patched.");
} else {
  console.log("Regex not matched.");
}
