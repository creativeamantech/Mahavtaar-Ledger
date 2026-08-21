const fs = require('fs');
let code = fs.readFileSync('src/pages/CityPivot.tsx', 'utf-8');

// Replace the entire items.map(...) block carefully
// Wait, we can just replace the <td> elements
// 1. City Column (with hover card) -> clickable cell with navigateToExplorer
code = code.replace(
  /<td className="px-3 py-2 pl-6 font-medium">\s*<HoverCard>[\s\S]*?<\/HoverCard>\s*<\/td>/g,
  '<td className="px-3 py-2 pl-6 font-medium cursor-pointer hover:text-primary transition-colors hover:underline" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>{item.city}</td>'
);

// 2. Collection
code = code.replace(
  /<td className="px-3 py-2 text-right text-primary font-bold">\{fmtCur\(item\.collection\)\}<\/td>/g,
  '<td className="px-3 py-2 text-right text-primary font-bold cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>{fmtCur(item.collection)}</td>'
);

// 3. Count
code = code.replace(
  /<td className="px-3 py-2 text-right">\{item\.count\}<\/td>/g,
  '<td className="px-3 py-2 text-right cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>{item.count}</td>'
);

// 4. Paid
code = code.replace(
  /<td className="px-3 py-2 text-right text-success">\{item\.paid\}<\/td>/g,
  '<td className="px-3 py-2 text-right text-success cursor-pointer hover:bg-success/10 transition-colors" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt, paid: \\\'Paid\\\' })}>{item.paid}</td>'
);

// 5. Unpaid isn't listed, posPaidOnlyCount
code = code.replace(
  /<td className="px-3 py-2 text-right text-info">\{item\.posPaidOnlyCount\}<\/td>/g,
  '<td className="px-3 py-2 text-right text-info cursor-pointer hover:bg-info/10 transition-colors" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt, paid: \\\'Paid\\\' })}>{item.posPaidOnlyCount}</td>'
);

// 6. Total POS
code = code.replace(
  /<td className="px-3 py-2 text-right font-medium">\{fmtCur\(item\.totalPOS\)\}<\/td>/g,
  '<td className="px-3 py-2 text-right font-medium cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt })}>{fmtCur(item.totalPOS)}</td>'
);

// 7. Paid POS
code = code.replace(
  /<td className="px-3 py-2 text-right font-medium">\{fmtCur\(item\.paidPOS\)\}<\/td>/g,
  '<td className="px-3 py-2 text-right font-medium cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ city: item.city, bucket: bkt, paid: \\\'Paid\\\' })}>{fmtCur(item.paidPOS)}</td>'
);

fs.writeFileSync('src/pages/CityPivot.tsx', code);
console.log("Patched CityPivot Item Cells");
