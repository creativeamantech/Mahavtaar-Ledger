const fs = require('fs');
let code = fs.readFileSync('src/pages/CityPivot.tsx', 'utf-8');

// Sub Totals (Bucket {bkt} Total)
code = code.replace(
  /<td className="px-3 py-2 text-right text-primary">\{fmtCur\(sub\.collection\)\}<\/td>/g,
  '<td className="px-3 py-2 text-right text-primary cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ bucket: bkt })}>{fmtCur(sub.collection)}</td>'
);
code = code.replace(
  /<td className="px-3 py-2 text-right">\{sub\.count\}<\/td>/g,
  '<td className="px-3 py-2 text-right cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ bucket: bkt })}>{sub.count}</td>'
);
code = code.replace(
  /<td className="px-3 py-2 text-right text-success">\{sub\.paid\}<\/td>/g,
  '<td className="px-3 py-2 text-right text-success cursor-pointer hover:bg-success/10 transition-colors" onClick={() => navigateToExplorer({ bucket: bkt, paid: \\\'Paid\\\' })}>{sub.paid}</td>'
);
code = code.replace(
  /<td className="px-3 py-2 text-right text-info">\{sub\.posPaidOnlyCount\}<\/td>/g,
  '<td className="px-3 py-2 text-right text-info cursor-pointer hover:bg-info/10 transition-colors" onClick={() => navigateToExplorer({ bucket: bkt, paid: \\\'Paid\\\' })}>{sub.posPaidOnlyCount}</td>'
);
code = code.replace(
  /<td className="px-3 py-2 text-right">\{fmtCur\(sub\.totalPOS\)\}<\/td>/g,
  '<td className="px-3 py-2 text-right cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ bucket: bkt })}>{fmtCur(sub.totalPOS)}</td>'
);
code = code.replace(
  /<td className="px-3 py-2 text-right">\{fmtCur\(sub\.paidPOS\)\}<\/td>/g,
  '<td className="px-3 py-2 text-right cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ bucket: bkt, paid: \\\'Paid\\\' })}>{fmtCur(sub.paidPOS)}</td>'
);

// Grand Totals (in the tfoot)
code = code.replace(
  /<tfoot className="bg-primary\/10 font-bold sticky bottom-0 z-10 shadow-\[0_-2px_10px_rgba\(0,0,0,0\.05\)\] cursor-pointer hover:bg-primary\/20 transition-colors" onClick=\{[^}]+\}>/,
  '<tfoot className="bg-primary/10 font-bold sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] transition-colors">'
);

code = code.replace(
  /<td className="px-3 py-2\.5 font-bold uppercase text-primary">Grand Total<\/td>/g,
  '<td className="px-3 py-2.5 font-bold uppercase text-primary cursor-pointer hover:underline" onClick={() => navigateToExplorer({})}>Grand Total</td>'
);
code = code.replace(
  /<td className="px-3 py-2\.5 text-right font-data font-bold text-success">\{fmtCur\(grandTotal\.collection\)\}<\/td>/g,
  '<td className="px-3 py-2.5 text-right font-data font-bold text-success cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({})}>{fmtCur(grandTotal.collection)}</td>'
);
code = code.replace(
  /<td className="px-3 py-2\.5 text-right font-data font-bold">\{grandTotal\.count\}<\/td>/g,
  '<td className="px-3 py-2.5 text-right font-data font-bold cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({})}>{grandTotal.count}</td>'
);
code = code.replace(
  /<td className="px-3 py-2\.5 text-right font-data font-bold text-info">\{grandTotal\.paid\}<\/td>/g,
  '<td className="px-3 py-2.5 text-right font-data font-bold text-info cursor-pointer hover:bg-info/10 transition-colors" onClick={() => navigateToExplorer({ paid: \\\'Paid\\\' })}>{grandTotal.paid}</td>'
);
code = code.replace(
  /<td className="px-3 py-2\.5 text-right font-data font-bold">\{grandTotal\.posPaidOnlyCount\}<\/td>/g,
  '<td className="px-3 py-2.5 text-right font-data font-bold cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({ paid: \\\'Paid\\\' })}>{grandTotal.posPaidOnlyCount}</td>'
);
code = code.replace(
  /<td className="px-3 py-2\.5 text-right font-data font-bold">\{fmtCur\(grandTotal\.totalPOS\)\}<\/td>/g,
  '<td className="px-3 py-2.5 text-right font-data font-bold cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigateToExplorer({})}>{fmtCur(grandTotal.totalPOS)}</td>'
);
code = code.replace(
  /<td className="px-3 py-2\.5 text-right font-data font-bold text-success">\{fmtCur\(grandTotal\.paidPOS\)\}<\/td>/g,
  '<td className="px-3 py-2.5 text-right font-data font-bold text-success cursor-pointer hover:bg-success/10 transition-colors" onClick={() => navigateToExplorer({ paid: \\\'Paid\\\' })}>{fmtCur(grandTotal.paidPOS)}</td>'
);

// Fix \' issue
code = code.replace(/\\'/g, "'");

fs.writeFileSync('src/pages/CityPivot.tsx', code);
console.log("Patched CityPivot Totals");
