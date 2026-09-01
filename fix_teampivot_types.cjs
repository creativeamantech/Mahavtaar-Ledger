const fs = require('fs');

let code = fs.readFileSync('src/pages/TeamPivot.tsx', 'utf-8');

code = code.replace(/useWorkerPivot<any\[\]>/g, "useWorkerPivot<import('../lib/pivots').TeamPivotRow[]>");
code = code.replace(/\(item: any\)/g, "(item: import('../lib/pivots').TeamPivotRow)");
code = code.replace(/\(acc: any, cur: any\)/g, "(acc: Record<string, import('../lib/pivots').TeamPivotRow[]>, cur: import('../lib/pivots').TeamPivotRow)");
code = code.replace(/\(s: number, i: any\)/g, "(s: number, i: import('../lib/pivots').TeamPivotRow)");

fs.writeFileSync('src/pages/TeamPivot.tsx', code);
