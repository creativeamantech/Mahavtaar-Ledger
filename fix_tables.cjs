const fs = require('fs');

const files = [
  'src/pages/ExecTeamPerf.tsx',
  'src/pages/TeamPivot.tsx',
  'src/pages/CityPivot.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // 1. Remove tbody GRAND TOTAL
  content = content.replace(/<tr className="bg-primary\/20 font-bold border-t-2 border-border">[\s\S]*?GRAND TOTAL[\s\S]*?<\/tr>/, '');

  // 2. Fix tfoot
  content = content.replace(
    /<tfoot className="bg-primary\/10 font-bold sticky bottom-0 z-10 shadow-\[0_-2px_10px_rgba\(0,0,0,0\.05\)\] transition-colors">/,
    '<tfoot className="bg-card font-bold sticky bottom-0 z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.08)] border-t-2 border-border transition-colors">'
  );

  // 3. Fix thead
  content = content.replace(
    /<thead className="sticky top-0 z-20 bg-muted\/95 backdrop-blur shadow-sm">/,
    '<thead className="sticky top-0 z-30 bg-card shadow-sm border-b-2 border-border">'
  );

  // 4. Fix double div and relative
  const doubleDiv = `<div className="overflow-auto scrollbar-thin max-h-[calc(100vh-250px)] min-h-[400px]">\n        <div className="overflow-auto scrollbar-thin max-h-[calc(100vh-250px)] min-h-[400px]">`;
  if (content.includes(doubleDiv)) {
    content = content.replace(doubleDiv, `<div className="overflow-auto scrollbar-thin max-h-[calc(100vh-250px)] min-h-[400px] relative bg-card">`);
    content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/AppLayout>/, '</div>\n      </div>\n    </AppLayout>');
  } else {
    content = content.replace(
      `<div className="overflow-auto scrollbar-thin max-h-[calc(100vh-250px)] min-h-[400px]">`,
      `<div className="overflow-auto scrollbar-thin max-h-[calc(100vh-250px)] min-h-[400px] relative bg-card">`
    );
  }

  // Ensure header text is more legible in sticky headers (bg-card makes text better when scrolling)
  // Let's also remove `bg-muted/50` from the tr in thead so it uses the bg-card from thead.
  content = content.replace(/<tr className="border-b border-border bg-muted\/50">/, '<tr className="border-b-2 border-border">');

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
