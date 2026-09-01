const fs = require('fs');

function replaceFile(path, replacer) {
  if (!fs.existsSync(path)) return;
  let code = fs.readFileSync(path, 'utf-8');
  let newCode = replacer(code);
  if (code !== newCode) fs.writeFileSync(path, newCode);
}

replaceFile('src/lib/pivots.ts', c => {
  let code = c.replace(/cases: any\[\];/g, "cases: { aggr: string, name: string, pos: number, isPaid: boolean }[];");
  code = code.replace(/const map: Record<string, any> = \{\};/g, "const map: Record<string, BucketCityPivotRow | ExecCityPivotRow> = {};");
  return code;
});

replaceFile('src/pages/AllFeedback.tsx', c => c.replace(/_: any, /g, "_: unknown, "));
replaceFile('src/pages/Attendance.tsx', c => c.replace(/_: any, /g, "_: unknown, "));
replaceFile('src/components/AdvancedTargetsTab.tsx', c => c.replace(/\(t: any\)/g, "(t: import('../types/domain').StateTarget)").replace(/err: any/g, "err: unknown"));
replaceFile('src/components/agent/AgentNotifications.tsx', c => c.replace(/n: any/g, "n: Record<string, unknown>").replace(/any\[\]/g, "Record<string, unknown>[]"));
replaceFile('src/contexts/SyncContext.tsx', c => c.replace(/data: any/g, "data: Record<string, unknown>").replace(/status: any/g, "status: string"));
replaceFile('src/lib/exporter.ts', c => c.replace(/data: any\[\]/g, "data: Record<string, unknown>[]").replace(/r: any/g, "r: Record<string, unknown>"));
replaceFile('src/pages/ExecDashboard.tsx', c => c.replace(/cityData: any/g, "cityData: import('../lib/pivots').ExecCityPivotRow[]").replace(/\(r: any\)/g, "(r: import('../lib/pivots').ExecCityPivotRow)"));
replaceFile('src/components/CaseInformationTable.tsx', c => c.replace(/a: any, b: any/g, "a: import('../types/domain').LoanRecord, b: import('../types/domain').LoanRecord"));
replaceFile('src/components/explorer/MultiCaseModal.tsx', c => c.replace(/c: any/g, "c: import('../types/domain').LoanRecord"));

