const fs = require('fs');

function replaceFile(path, replacer) {
  if (!fs.existsSync(path)) return;
  let code = fs.readFileSync(path, 'utf-8');
  let newCode = replacer(code);
  if (code !== newCode) fs.writeFileSync(path, newCode);
}

replaceFile('src/components/AdvancedTargetsTab.tsx', c => c.replace(/\(val: any\)/g, "(val: string)"));
replaceFile('src/components/CaseInformationTable.tsx', c => c.replace(/\(r: any/g, "(r: import('../types/domain').LoanRecord"));
replaceFile('src/components/agent/AgentNotifications.tsx', c => c.replace(/n: any/g, "n: Record<string, unknown>").replace(/any\[\]/g, "Record<string, unknown>[]"));
replaceFile('src/components/explorer/MultiCaseModal.tsx', c => c.replace(/c: any/g, "c: import('../types/domain').LoanRecord"));
replaceFile('src/contexts/SyncContext.tsx', c => c.replace(/data: any/g, "data: Record<string, unknown>").replace(/status: any/g, "status: string"));
replaceFile('src/lib/exporter.ts', c => c.replace(/data: any\[\]/g, "data: Record<string, unknown>[]").replace(/r: any/g, "r: Record<string, unknown>"));
replaceFile('src/pages/ExecDashboard.tsx', c => c.replace(/cityData: any/g, "cityData: import('../lib/pivots').ExecCityPivotRow[]").replace(/\(r: any\)/g, "(r: import('../lib/pivots').ExecCityPivotRow)"));
replaceFile('src/hooks/useWorkerPivot.ts', c => c.replace(/records: any\[\]/g, "records: Record<string, unknown>[]"));
replaceFile('src/lib/targets.ts', c => c.replace(/any/g, "Record<string, unknown>"));
replaceFile('app/applet/src/components/AdvancedTargetsTab.tsx', c => c.replace(/any/g, "string"));
replaceFile('app/applet/src/lib/targets.ts', c => c.replace(/any/g, "Record<string, unknown>"));
replaceFile('src/components/sync/BackupRecoverySection.tsx', c => c.replace(/any/g, "unknown"));
replaceFile('src/components/sync/ConflictResolverModal.tsx', c => c.replace(/any/g, "unknown"));
replaceFile('src/components/sync/SyncSettingsTab.tsx', c => c.replace(/any/g, "unknown"));

