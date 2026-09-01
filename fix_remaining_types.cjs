const fs = require('fs');

function fixSettings() {
  let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');
  code = code.replace(/catch \(err: any\)/g, "catch (err: unknown)");
  code = code.replace(/\(u: any\)/g, "(u: import('../types/domain').User)");
  code = code.replace(/\(data as any\)/g, "(data as Record<string, unknown>)");
  code = code.replace(/val: string, row: any/g, "val: string, row: import('../types/domain').User");
  code = code.replace(/val: any/g, "val: string | number");
  code = code.replace(/_: any, row: any/g, "_: unknown, row: import('../types/domain').User");
  fs.writeFileSync('src/pages/Settings.tsx', code);
}

function fixAuthContext() {
  let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf-8');
  code = code.replace(/seedUsers as any/g, "seedUsers as import('../types/domain').User[]");
  code = code.replace(/const found: any =/g, "const found: import('../types/domain').User[] =");
  code = code.replace(/updates: any =/g, "updates: Partial<import('../types/domain').User> =");
  code = code.replace(/newUser as any/g, "newUser as import('../types/domain').User");
  code = code.replace(/updatePayload: any =/g, "updatePayload: Partial<import('../types/domain').User> =");
  fs.writeFileSync('src/contexts/AuthContext.tsx', code);
}

function fixDataTable() {
  let code = fs.readFileSync('src/components/ui/DataTable.tsx', 'utf-8');
  code = code.replace(/value: any, row: any/g, "value: unknown, row: Record<string, unknown>");
  code = code.replace(/row: any/g, "row: Record<string, unknown>");
  fs.writeFileSync('src/components/ui/DataTable.tsx', code);
}

function fixEnterprisePivotTable() {
  let code = fs.readFileSync('src/components/ui/EnterprisePivotTable.tsx', 'utf-8');
  code = code.replace(/T = any/g, "T = Record<string, unknown>");
  code = code.replace(/\(row as any\)/g, "(row as Record<string, unknown>)");
  fs.writeFileSync('src/components/ui/EnterprisePivotTable.tsx', code);
}

function fixAuditRepository() {
  let code = fs.readFileSync('src/lib/repositories/auditRepository.ts', 'utf-8');
  code = code.replace(/as any,/g, "as import('../types/domain').AuditEntry['source'],");
  code = code.replace(/\(e as any\)/g, "(e as Record<string, unknown>)");
  code = code.replace(/mapped as any/g, "mapped as import('../types/domain').AuditEntry[]");
  fs.writeFileSync('src/lib/repositories/auditRepository.ts', code);
}

fixSettings();
fixAuthContext();
fixDataTable();
fixEnterprisePivotTable();
fixAuditRepository();

