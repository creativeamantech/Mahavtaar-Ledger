const fs = require('fs');
let code = fs.readFileSync('src/pages/TeamPivot.tsx', 'utf-8');

// Item rows
code = code.replace(
  /<td className="px-3 py-2 pl-6">\{item\.exec\}<\/td>/g,
  '<td className="px-3 py-2 pl-6 cursor-pointer hover:text-primary hover:underline transition-colors font-medium" onClick={() => navigateToExplorer({ executive: item.exec, bucket: bkt })}>{item.exec}</td>'
);
code = code.replace(
  /<td className="px-3 py-2 text-right text-primary font-bold">\{fmtCur\(item\.collection\)\}<\/td>/g,
  '<td className="px-3 py-2 text-right text-primary font-bold cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ executive: item.exec, bucket: bkt })}>{fmtCur(item.collection)}</td>'
);
code = code.replace(
  /<td className="px-3 py-2 text-right">\{item\.count\}<\/td>/g,
  '<td className="px-3 py-2 text-right cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ executive: item.exec, bucket: bkt })}>{item.count}</td>'
);
code = code.replace(
  /<td className="px-3 py-2 text-right text-success">\{item\.paid\}<\/td>/g,
  '<td className="px-3 py-2 text-right text-success cursor-pointer hover:bg-success/10 transition-colors" onClick={() => navigateToExplorer({ executive: item.exec, bucket: bkt, paid: \\\'Paid\\\' })}>{item.paid}</td>'
);
code = code.replace(
  /<td className="px-3 py-2 text-right text-info">\{item\.posPaidOnlyCount\}<\/td>/g,
  '<td className="px-3 py-2 text-right text-info cursor-pointer hover:bg-info/10 transition-colors" onClick={() => navigateToExplorer({ executive: item.exec, bucket: bkt, paid: \\\'Paid\\\' })}>{item.posPaidOnlyCount}</td>'
);
code = code.replace(
  /<td className="px-3 py-2 text-right font-medium">\{fmtCur\(item\.totalPOS\)\}<\/td>/g,
  '<td className="px-3 py-2 text-right font-medium cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ executive: item.exec, bucket: bkt })}>{fmtCur(item.totalPOS)}</td>'
);
code = code.replace(
  /<td className="px-3 py-2 text-right font-medium">\{fmtCur\(item\.paidPOS\)\}<\/td>/g,
  '<td className="px-3 py-2 text-right font-medium cursor-pointer hover:bg-primary/5 transition-colors hover:text-primary" onClick={() => navigateToExplorer({ executive: item.exec, bucket: bkt, paid: \\\'Paid\\\' })}>{fmtCur(item.paidPOS)}</td>'
);

// Sub total rows
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

// We need to look at the tfoot for the Grand Totals.
