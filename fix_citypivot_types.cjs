const fs = require('fs');

let code = fs.readFileSync('src/pages/CityPivot.tsx', 'utf-8');

code = code.replace(/useWorkerPivot<any\[\]>/g, "useWorkerPivot<import('../lib/pivots').BucketCityPivotRow[]>");
code = code.replace(/\(item: any\)/g, "(item: import('../lib/pivots').BucketCityPivotRow)");
code = code.replace(/\(acc: any, cur: any\)/g, "(acc: Record<string, import('../lib/pivots').BucketCityPivotRow[]>, cur: import('../lib/pivots').BucketCityPivotRow)");
code = code.replace(/\(s: number, i: any\)/g, "(s: number, i: import('../lib/pivots').BucketCityPivotRow)");

fs.writeFileSync('src/pages/CityPivot.tsx', code);
