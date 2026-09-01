const fs = require('fs');

let code = fs.readFileSync('src/pages/ExecDashboard.tsx', 'utf-8');

code = code.replace(/useWorkerPivot<any\[\]>/g, "useWorkerPivot<import('../lib/pivots').ExecCityPivotRow[]>");
code = code.replace(/\(item: any\)/g, "(item: import('../lib/pivots').ExecCityPivotRow)");
code = code.replace(/\(acc: any, cur: any\)/g, "(acc: Record<string, import('../lib/pivots').ExecCityPivotRow[]>, cur: import('../lib/pivots').ExecCityPivotRow)");
code = code.replace(/\(s: number, i: any\)/g, "(s: number, i: import('../lib/pivots').ExecCityPivotRow)");

fs.writeFileSync('src/pages/ExecDashboard.tsx', code);
